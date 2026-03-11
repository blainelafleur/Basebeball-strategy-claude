/**
 * BSM Knowledge Embedding Script
 *
 * Extracts scenarios, knowledge maps, principles, BRAIN data, and SCENARIO_BIBLE
 * from the app source files, generates embeddings via Workers AI, and upserts
 * into Cloudflare Vectorize (bsm-knowledge index).
 *
 * This runs as a worker route: POST /admin/embed-knowledge
 * It uses env.AI for embeddings and env.VECTORIZE for storage.
 */

// ─── Chunking helpers ────────────────────────────────────────────────────────

/**
 * Split long text into ~500-token chunks with 50-token overlap.
 * Approximation: 1 token ≈ 4 chars.
 */
function chunkText(text, maxChars = 2000, overlapChars = 200) {
  if (text.length <= maxChars) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlapChars;
    if (start >= text.length - overlapChars) break;
  }
  return chunks;
}

/**
 * Batch an array into groups of `size`.
 */
function batch(arr, size) {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
}

// ─── Data extraction (from raw index.jsx source) ────────────────────────────

/**
 * Extract SCENARIOS object from index.jsx source text.
 * Returns array of { id, position, title, description, options, best, explanations, diff, concept, successRates }
 */
function extractScenarios(source) {
  const scenarios = [];
  // Match each position array in the SCENARIOS object
  const positions = [
    "pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase",
    "leftField", "centerField", "rightField",
    "batter", "baserunner", "manager", "famous", "rules", "counts"
  ];

  for (const pos of positions) {
    // Find all scenario objects for this position using id pattern
    const idPattern = new RegExp(`\\{id:"([^"]+)"[^}]*?title:"([^"]*)"[^}]*?diff:(\\d)[^}]*?description:"([^"]*)"[^}]*?options:\\[([^\\]]+)\\][^}]*?best:(\\d)[^}]*?explanations:\\[([^\\]]+)\\][^}]*?rates:\\[([^\\]]+)\\][^}]*?concept:"([^"]*)"`, "g");
    let match;
    while ((match = idPattern.exec(source)) !== null) {
      const [, id, title, diff, description, optionsRaw, best, explRaw, ratesRaw, concept] = match;
      // Only include if the id prefix matches the position (crude but effective)
      const posPrefix = { pitcher: "p", catcher: "c", firstBase: "fb", secondBase: "sb",
        shortstop: "ss", thirdBase: "tb", leftField: "lf", centerField: "cf",
        rightField: "rf", batter: "bat", baserunner: "br", manager: "mgr",
        famous: "fam", rules: "rl", counts: "cnt" };
      // Skip if already captured (regex is global across full source)
      if (scenarios.some(s => s.id === id)) continue;

      const options = optionsRaw.split('","').map(s => s.replace(/^"|"$/g, ""));
      const explanations = explRaw.split('","').map(s => s.replace(/^"|"$/g, ""));
      const rates = ratesRaw.split(",").map(s => parseInt(s.trim()));

      scenarios.push({
        id, position: pos, title, description, options, best: parseInt(best),
        explanations, diff: parseInt(diff), concept, successRates: rates
      });
    }
  }
  return scenarios;
}

/**
 * Simpler extraction: find all scenarios by scanning for {id:" patterns
 * and mapping them to position based on their id prefix.
 */
function extractScenariosSimple(source) {
  const scenarios = [];
  const prefixToPos = {
    p: "pitcher", c: "catcher", fb: "firstBase", sb: "secondBase",
    ss: "shortstop", tb: "thirdBase", lf: "leftField", cf: "centerField",
    rf: "rightField", bat: "batter", br: "baserunner", mgr: "manager",
    fam: "famous", rl: "rules", cnt: "counts"
  };

  // Find the SCENARIOS block
  const scenStart = source.indexOf("const SCENARIOS = {");
  if (scenStart === -1) return scenarios;

  // Find each id:"xxx" and extract surrounding scenario data
  const idRegex = /\{id:"([^"]+)",\s*(?:conceptTag:"[^"]*",\s*)?title:"([^"]*)"/g;
  let m;
  while ((m = idRegex.exec(source)) !== null) {
    if (m.index > scenStart + 500000) break; // Don't scan past scenarios
    const id = m[1];
    const title = m[2];

    // Determine position from id prefix
    let position = "unknown";
    for (const [prefix, pos] of Object.entries(prefixToPos)) {
      if (id.startsWith(prefix) && !id.startsWith(prefix + "a")) {
        // Handle prefix conflicts: "c" vs "cf" vs "cnt"
        if (prefix === "c" && (id.startsWith("cf") || id.startsWith("cnt"))) continue;
        if (prefix === "fb" && id.startsWith("fam")) continue;
        position = pos;
        break;
      }
    }

    // Extract description from nearby text
    const chunk = source.slice(m.index, m.index + 3000);
    const descMatch = chunk.match(/description:"([^"]*)"/);
    const diffMatch = chunk.match(/diff:(\d)/);
    const conceptMatch = chunk.match(/concept:"([^"]*)"/);
    const optMatch = chunk.match(/options:\[([^\]]+)\]/);
    const explMatch = chunk.match(/explanations:\[([^\]]+)\]/);
    const ratesMatch = chunk.match(/rates:\[([^\]]+)\]/);

    const description = descMatch ? descMatch[1] : "";
    const diff = diffMatch ? parseInt(diffMatch[1]) : 1;
    const concept = conceptMatch ? conceptMatch[1] : "";

    // Build embeddable text
    const options = optMatch ? optMatch[1].replace(/"/g, "").split(",").map(s => s.trim()) : [];
    const explanations = explMatch ? explMatch[1].replace(/"/g, "").split(",").map(s => s.trim()) : [];
    const rates = ratesMatch ? ratesMatch[1].split(",").map(s => parseInt(s.trim())) : [];

    const text = [
      `Title: ${title}`,
      `Position: ${position}`,
      `Difficulty: ${diff === 1 ? "Rookie" : diff === 2 ? "Pro" : "All-Star"}`,
      `Concept: ${concept}`,
      `Description: ${description}`,
      options.length ? `Options: ${options.join(" | ")}` : "",
      explanations.length ? `Best explanation: ${explanations[0]}` : "",
    ].filter(Boolean).join("\n");

    scenarios.push({
      id: `scenario_${position}_${id}`,
      text,
      metadata: { type: "scenario", position, concept, difficulty: diff, scenarioId: id, title }
    });
  }
  return scenarios;
}

/**
 * Extract knowledge maps from source.
 */
function extractKnowledgeMaps(source) {
  const maps = [];
  const mapNames = [
    "CUTOFF_RELAY_MAP", "BUNT_DEFENSE_MAP", "FIRST_THIRD_MAP", "BACKUP_MAP",
    "RUNDOWN_MAP", "DP_POSITIONING_MAP", "HIT_RUN_MAP", "PICKOFF_MAP",
    "BALK_MAP", "APPEAL_PLAY_MAP", "PITCH_CLOCK_MAP", "WP_PB_MAP",
    "SQUEEZE_MAP", "INFIELD_FLY_MAP", "OF_COMMUNICATION_MAP",
    "PARK_ENVIRONMENT_MAP", "LEVEL_ADJUSTMENTS_MAP", "POPUP_PRIORITY_MAP",
    "OBSTRUCTION_INTERFERENCE_MAP", "TAGUP_SACRIFICE_FLY_MAP",
    "PITCHING_CHANGE_MAP", "INTENTIONAL_WALK_MAP", "LEGAL_SHIFT_MAP",
    "BASERUNNER_READS_MAP"
  ];

  for (const name of mapNames) {
    // Find the map content between backticks
    const startMarker = `${name}: \``;
    const startIdx = source.indexOf(startMarker);
    if (startIdx === -1) continue;

    const contentStart = startIdx + startMarker.length;
    const contentEnd = source.indexOf("`", contentStart);
    if (contentEnd === -1) continue;

    const content = source.slice(contentStart, contentEnd);
    const concept = name.replace(/_MAP$/, "").toLowerCase().replace(/_/g, "-");

    // Chunk if long
    const chunks = chunkText(content, 2000, 200);
    chunks.forEach((chunk, i) => {
      maps.push({
        id: `map_${name}${chunks.length > 1 ? `_part${i + 1}` : ""}`,
        text: `Knowledge Map: ${name.replace(/_/g, " ")}\n\n${chunk}`,
        metadata: { type: "map", concept, mapName: name }
      });
    });
  }
  return maps;
}

/**
 * Extract POS_PRINCIPLES and AI_POS_PRINCIPLES from source.
 */
function extractPrinciples(source) {
  const principles = [];
  const positions = [
    "pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase",
    "leftField", "centerField", "rightField",
    "batter", "baserunner", "manager", "famous", "rules", "counts"
  ];

  // Extract from POS_PRINCIPLES
  for (const pos of positions) {
    const marker = `const POS_PRINCIPLES = {`;
    const blockStart = source.indexOf(marker);
    if (blockStart === -1) continue;

    const posMarker = `  ${pos}:"`;
    const posStart = source.indexOf(posMarker, blockStart);
    if (posStart === -1 || posStart > blockStart + 50000) continue;

    const contentStart = posStart + posMarker.length;
    // Find the closing quote (handle escaped quotes)
    let contentEnd = contentStart;
    while (contentEnd < source.length) {
      if (source[contentEnd] === '"' && source[contentEnd - 1] !== '\\') break;
      contentEnd++;
    }
    const content = source.slice(contentStart, contentEnd);

    const chunks = chunkText(content, 2000, 200);
    chunks.forEach((chunk, i) => {
      principles.push({
        id: `principle_${pos}${chunks.length > 1 ? `_part${i + 1}` : ""}`,
        text: `Position Principles: ${pos}\n\n${chunk}`,
        metadata: { type: "principle", position: pos }
      });
    });
  }

  // Also extract AI_POS_PRINCIPLES (condensed versions)
  for (const pos of positions) {
    const marker = `const AI_POS_PRINCIPLES = {`;
    const blockStart = source.indexOf(marker);
    if (blockStart === -1) continue;

    const posMarker = `  ${pos}:"`;
    const posStart = source.indexOf(posMarker, blockStart);
    if (posStart === -1 || posStart > blockStart + 20000) continue;

    const contentStart = posStart + posMarker.length;
    let contentEnd = contentStart;
    while (contentEnd < source.length) {
      if (source[contentEnd] === '"' && source[contentEnd - 1] !== '\\') break;
      contentEnd++;
    }
    const content = source.slice(contentStart, contentEnd);

    principles.push({
      id: `ai_principle_${pos}`,
      text: `AI Position Principles (condensed): ${pos}\n\n${content}`,
      metadata: { type: "principle", position: pos, variant: "condensed" }
    });
  }

  return principles;
}

/**
 * Extract BRAIN constant data (RE24, countData, concepts, coaching).
 */
function extractBrainData(source) {
  const entries = [];

  // RE24 matrix
  const re24Match = source.match(/RE24:\s*\{([^}]+)\}/);
  if (re24Match) {
    entries.push({
      id: "brain_re24",
      text: `BRAIN Run Expectancy Matrix (RE24):\n${re24Match[1].trim()}\nSource: FanGraphs 2015-2024 MLB averages. Keys: "---"=empty, "1--"=1st, "-2-"=2nd, "--3"=3rd, "12-"=1st+2nd, "1-3"=1st+3rd, "-23"=2nd+3rd, "123"=loaded. Values: [0 outs, 1 out, 2 outs].`,
      metadata: { type: "brain", subtype: "re24" }
    });
  }

  // Count data
  const countBlock = source.match(/countData:\s*\{([\s\S]*?)\},\s*\n\s*steal/);
  if (countBlock) {
    entries.push({
      id: "brain_count_data",
      text: `BRAIN Count Leverage Data:\n${countBlock[1].trim()}\nEach count shows batting average, OBP, SLG, label, and edge (hitter/pitcher/neutral).`,
      metadata: { type: "brain", subtype: "countData" }
    });
  }

  // Steal break-even & bunt delta & TTO
  entries.push({
    id: "brain_steal_bunt_tto",
    text: `BRAIN Decision Thresholds:\n- Steal break-even by outs: 0 outs=72%, 1 out=72%, 2 outs=67%\n- Sacrifice bunt RE24 cost: R1/0out=-0.23, R2/0out=-0.19, R12/0out=-0.08\n- Times Through Order effect: 1st=+0, 2nd=+15, 3rd=+30 BA points\nSource: The Book (Tango/Lichtman/Dolphin), FanGraphs TTO splits 2019-2023.`,
    metadata: { type: "brain", subtype: "thresholds" }
  });

  // Concepts (all 48)
  const conceptsStart = source.indexOf("concepts: {", source.indexOf("const BRAIN"));
  if (conceptsStart !== -1) {
    const conceptsEnd = source.indexOf("\n},", conceptsStart);
    const conceptsText = source.slice(conceptsStart, conceptsEnd + 3);

    // Parse individual concepts
    const conceptRegex = /"([^"]+)":\s*\{name:"([^"]*)",\s*domain:"([^"]*)",\s*prereqs:\[([^\]]*)\],\s*ageMin:(\d+),\s*diff:(\d)/g;
    let cm;
    const conceptList = [];
    while ((cm = conceptRegex.exec(conceptsText)) !== null) {
      const [, tag, name, domain, prereqs, ageMin, diff] = cm;
      conceptList.push(`${tag}: ${name} (domain=${domain}, difficulty=${diff}, ageMin=${ageMin}, prereqs=[${prereqs.replace(/"/g, "")}])`);
    }

    // Chunk concept list into groups
    const conceptText = `BRAIN Concept Graph (48 concepts with prerequisites):\n\n${conceptList.join("\n")}`;
    const chunks = chunkText(conceptText, 2000, 200);
    chunks.forEach((chunk, i) => {
      entries.push({
        id: `brain_concepts${chunks.length > 1 ? `_part${i + 1}` : ""}`,
        text: chunk,
        metadata: { type: "brain", subtype: "concepts" }
      });
    });
  }

  // Coaching situational lines
  const coachStart = source.indexOf("coaching: {", source.indexOf("const BRAIN"));
  if (coachStart !== -1) {
    const coachBlock = source.slice(coachStart, coachStart + 2000);
    const lineRegex = /"([^"]+)":\s*"([^"]*)"/g;
    let lm;
    const lines = [];
    while ((lm = lineRegex.exec(coachBlock)) !== null) {
      lines.push(`${lm[1]}: ${lm[2]}`);
    }
    if (lines.length) {
      entries.push({
        id: "brain_coaching",
        text: `BRAIN Coaching Situational Lines:\n\n${lines.join("\n")}`,
        metadata: { type: "brain", subtype: "coaching" }
      });
    }
  }

  return entries;
}

/**
 * Chunk SCENARIO_BIBLE.md into sections.
 */
function extractBibleSections(bibleText) {
  if (!bibleText) return [];
  const sections = [];

  // Split on ## headers
  const parts = bibleText.split(/(?=^## )/m);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    const headerMatch = part.match(/^##\s*(.+)/);
    const sectionName = headerMatch ? headerMatch[1].trim() : `section_${i}`;

    const chunks = chunkText(part, 2000, 200);
    chunks.forEach((chunk, j) => {
      sections.push({
        id: `bible_${i}_${sectionName.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)}${chunks.length > 1 ? `_part${j + 1}` : ""}`,
        text: `Scenario Bible: ${sectionName}\n\n${chunk}`,
        metadata: { type: "bible", section: sectionName }
      });
    });
  }
  return sections;
}

// ─── Main embedding pipeline ─────────────────────────────────────────────────

/**
 * Run the full embedding pipeline.
 * @param {Object} env - Worker environment with AI and VECTORIZE bindings
 * @param {string} appSource - Full index.jsx source text
 * @param {string} bibleText - Full SCENARIO_BIBLE.md text
 * @returns {Object} Summary of what was embedded
 */
export async function runEmbeddingPipeline(env, appSource, bibleText) {
  const log = [];
  const allVectors = [];

  // 1. Extract all content
  log.push("Extracting scenarios...");
  const scenarios = extractScenariosSimple(appSource);
  log.push(`  Found ${scenarios.length} scenarios`);

  log.push("Extracting knowledge maps...");
  const maps = extractKnowledgeMaps(appSource);
  log.push(`  Found ${maps.length} map chunks`);

  log.push("Extracting principles...");
  const principles = extractPrinciples(appSource);
  log.push(`  Found ${principles.length} principle entries`);

  log.push("Extracting BRAIN data...");
  const brainData = extractBrainData(appSource);
  log.push(`  Found ${brainData.length} brain entries`);

  log.push("Extracting Scenario Bible sections...");
  const bibleSections = extractBibleSections(bibleText);
  log.push(`  Found ${bibleSections.length} bible sections`);

  // Combine all entries
  const allEntries = [...scenarios, ...maps, ...principles, ...brainData, ...bibleSections];
  log.push(`\nTotal entries to embed: ${allEntries.length}`);

  // 2. Generate embeddings in batches (Workers AI supports up to 100 texts per call)
  const EMBED_BATCH_SIZE = 50; // Conservative to avoid hitting limits
  const entryBatches = batch(allEntries, EMBED_BATCH_SIZE);

  log.push(`Processing ${entryBatches.length} embedding batches...`);

  for (let i = 0; i < entryBatches.length; i++) {
    const entryBatch = entryBatches[i];
    const texts = entryBatch.map(e => e.text.slice(0, 8000)); // Truncate very long texts

    try {
      const result = await env.AI.run("@cf/baai/bge-large-en-v1.5", { text: texts });

      if (!result?.data || result.data.length !== texts.length) {
        log.push(`  Batch ${i + 1}: WARNING — expected ${texts.length} embeddings, got ${result?.data?.length || 0}`);
        continue;
      }

      for (let j = 0; j < entryBatch.length; j++) {
        allVectors.push({
          id: entryBatch[j].id,
          values: result.data[j],
          metadata: {
            ...entryBatch[j].metadata,
            text: entryBatch[j].text.slice(0, 10000) // Store text in metadata for retrieval
          }
        });
      }
      log.push(`  Batch ${i + 1}/${entryBatches.length}: embedded ${entryBatch.length} entries`);
    } catch (err) {
      log.push(`  Batch ${i + 1}: ERROR — ${err.message}`);
    }
  }

  // 3. Upsert into Vectorize in batches (max 1000 per upsert)
  const UPSERT_BATCH_SIZE = 100;
  const vectorBatches = batch(allVectors, UPSERT_BATCH_SIZE);

  log.push(`\nUpserting ${allVectors.length} vectors in ${vectorBatches.length} batches...`);

  let totalUpserted = 0;
  for (let i = 0; i < vectorBatches.length; i++) {
    try {
      await env.VECTORIZE.upsert(vectorBatches[i]);
      totalUpserted += vectorBatches[i].length;
      log.push(`  Upsert batch ${i + 1}/${vectorBatches.length}: ${vectorBatches[i].length} vectors`);
    } catch (err) {
      log.push(`  Upsert batch ${i + 1}: ERROR — ${err.message}`);
    }
  }

  const summary = {
    scenarios: scenarios.length,
    maps: maps.length,
    principles: principles.length,
    brainData: brainData.length,
    bibleSections: bibleSections.length,
    totalEntries: allEntries.length,
    totalEmbedded: allVectors.length,
    totalUpserted,
    log
  };

  log.push(`\nDone! ${totalUpserted}/${allEntries.length} entries embedded and stored.`);
  return summary;
}

/**
 * Query Vectorize for relevant knowledge.
 * @param {Object} env - Worker environment
 * @param {string} query - Search query text
 * @param {number} topK - Number of results
 * @param {Object} filter - Metadata filter (e.g., { type: "scenario", position: "pitcher" })
 * @returns {Array} Top-K matches with text and metadata
 */
export async function queryKnowledge(env, query, topK = 3, filter = {}) {
  // Embed the query
  const embedResult = await env.AI.run("@cf/baai/bge-large-en-v1.5", { text: [query] });
  if (!embedResult?.data?.[0]) {
    throw new Error("Failed to embed query");
  }

  const queryVector = embedResult.data[0];

  // Build Vectorize query options
  const queryOptions = {
    topK,
    returnMetadata: "all",
    returnValues: false
  };

  // Add metadata filter if provided (Vectorize uses $eq operator syntax)
  if (filter && Object.keys(filter).length > 0) {
    const vFilter = {};
    for (const [key, value] of Object.entries(filter)) {
      vFilter[key] = { $eq: value };
    }
    queryOptions.filter = vFilter;
  }

  const results = await env.VECTORIZE.query(queryVector, queryOptions);

  return (results.matches || []).map(match => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text || "",
    type: match.metadata?.type || "",
    position: match.metadata?.position || "",
    concept: match.metadata?.concept || "",
    metadata: match.metadata || {}
  }));
}
