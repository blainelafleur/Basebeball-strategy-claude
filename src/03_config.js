const ALL_POS = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField","batter","baserunner","manager"];
const POS_META = {
  pitcher:{label:"Pitcher",emoji:"⚾",color:"#ef4444",bg:"linear-gradient(135deg,#7f1d1d,#991b1b,#dc2626)",desc:"Control the game from the mound",icon:"🔥"},
  catcher:{label:"Catcher",emoji:"🎭",color:"#06b6d4",bg:"linear-gradient(135deg,#164e63,#155e75,#0891b2)",desc:"Call the game behind the plate",icon:"🛡️"},
  firstBase:{label:"1st Base",emoji:"🥇",color:"#f97316",bg:"linear-gradient(135deg,#7c2d12,#9a3412,#ea580c)",desc:"Stretch, scoop, and hold runners",icon:"🧤"},
  secondBase:{label:"2nd Base",emoji:"🔄",color:"#22c55e",bg:"linear-gradient(135deg,#14532d,#166534,#22c55e)",desc:"Turn double plays and cover ground",icon:"🧤"},
  shortstop:{label:"Shortstop",emoji:"⚡",color:"#6366f1",bg:"linear-gradient(135deg,#312e81,#3730a3,#4f46e5)",desc:"Captain of the infield",icon:"🛡️"},
  thirdBase:{label:"3rd Base",emoji:"🔥",color:"#e11d48",bg:"linear-gradient(135deg,#881337,#9f1239,#e11d48)",desc:"Guard the hot corner",icon:"💥"},
  leftField:{label:"Left Field",emoji:"🌿",color:"#16a34a",bg:"linear-gradient(135deg,#14532d,#166534,#16a34a)",desc:"Track down balls and throw runners out",icon:"💪"},
  centerField:{label:"Center Field",emoji:"👑",color:"#0ea5e9",bg:"linear-gradient(135deg,#0c4a6e,#075985,#0284c7)",desc:"Cover the most ground and call the shots",icon:"🏃"},
  rightField:{label:"Right Field",emoji:"🎯",color:"#84cc16",bg:"linear-gradient(135deg,#365314,#3f6212,#65a30d)",desc:"Strongest arm in the outfield",icon:"💨"},
  batter:{label:"Batter",emoji:"💪",color:"#3b82f6",bg:"linear-gradient(135deg,#1e3a5f,#1e40af,#3b82f6)",desc:"Drive in runs when it counts",icon:"⚡"},
  baserunner:{label:"Runner",emoji:"🏃",color:"#f59e0b",bg:"linear-gradient(135deg,#78350f,#92400e,#d97706)",desc:"Run smart, score runs",icon:"💨"},
  manager:{label:"Manager",emoji:"📋",color:"#a855f7",bg:"linear-gradient(135deg,#3b0764,#581c87,#7c3aed)",desc:"Make championship decisions",icon:"🧠"},
  famous:{label:"Famous Play",emoji:"🏟️",color:"#eab308",bg:"linear-gradient(135deg,#713f12,#854d0e,#ca8a04)",desc:"Legendary moments in baseball history",icon:"⭐"},
  rules:{label:"Rule IQ",emoji:"📖",color:"#f472b6",bg:"linear-gradient(135deg,#831843,#9d174d,#db2777)",desc:"Know the rules that decide games",icon:"📐"},
  counts:{label:"Count IQ",emoji:"🔢",color:"#14b8a6",bg:"linear-gradient(135deg,#134e4a,#115e59,#0d9488)",desc:"Master every count in baseball",icon:"📊"},
};
const LEVELS=[{n:"Rookie",min:0,c:"#94a3b8",e:"🌱"},{n:"Varsity",min:75,c:"#3b82f6",e:"⭐"},{n:"All-Star",min:200,c:"#f59e0b",e:"🌟"},{n:"MVP",min:400,c:"#ef4444",e:"🏆"},{n:"Hall of Fame",min:700,c:"#a855f7",e:"👑"}];
const ACHS=[
  {id:"first",n:"First Pitch",d:"Complete your first scenario",e:"⚾",ck:s=>s.gp>=1},
  {id:"s3",n:"On a Roll",d:"3 optimal in a row",e:"🔥",ck:s=>s.bs>=3},
  {id:"s5",n:"Hot Streak",d:"5 in a row",e:"💥",ck:s=>s.bs>=5},
  {id:"s10",n:"Unstoppable",d:"10 in a row!",e:"⚡",ck:s=>s.bs>=10},
  {id:"g10",n:"Dedicated",d:"Play 10 challenges",e:"📚",ck:s=>s.gp>=10},
  {id:"g25",n:"Student",d:"Play 25 challenges",e:"🎓",ck:s=>s.gp>=25},
  {id:"g50",n:"Scholar",d:"Play 50 challenges",e:"🏅",ck:s=>s.gp>=50},
  {id:"g100",n:"Veteran",d:"Play 100 challenges",e:"💎",ck:s=>s.gp>=100},
  {id:"a80",n:"Sharp Eye",d:"80%+ accuracy (10+ games)",e:"🎯",ck:s=>s.gp>=10&&(s.co/s.gp)>=0.8},
  {id:"util",n:"Utility Player",d:"Play all 12 positions",e:"🔄",ck:s=>ALL_POS.every(p=>(s.ps[p]?.p||0)>=1)},
  {id:"c10",n:"Baseball Brain",d:"Learn 10 concepts",e:"🧠",ck:s=>(s.cl?.length||0)>=10},
  {id:"c20",n:"Professor",d:"Learn 20 concepts",e:"📖",ck:s=>(s.cl?.length||0)>=20},
  {id:"daily3",n:"3-Day Streak",d:"Play 3 days in a row",e:"📅",ck:s=>(s.ds||0)>=3},
  {id:"daily7",n:"Weekly Warrior",d:"7-day streak",e:"🗓️",ck:s=>(s.ds||0)>=7},
  {id:"perf5",n:"Perfect Inning",d:"5 optimal in one session",e:"💯",ck:s=>(s.sp||0)>=5},
];
function achProgress(id,s){
  const map={first:[s.gp,1],s3:[Math.min(s.str,3),3],s5:[Math.min(s.str,5),5],s10:[Math.min(s.str,10),10],
    g10:[Math.min(s.gp,10),10],g25:[Math.min(s.gp,25),25],g50:[Math.min(s.gp,50),50],g100:[Math.min(s.gp,100),100],
    a80:[s.gp>=10?Math.min(Math.round((s.co/Math.max(s.gp,1))*100),100):Math.min(s.gp,10),s.gp>=10?80:10],
    util:[ALL_POS.filter(p=>(s.ps[p]?.p||0)>=1).length,ALL_POS.length],
    c10:[Math.min(s.cl?.length||0,10),10],c20:[Math.min(s.cl?.length||0,20),20],
    daily3:[Math.min(s.ds||0,3),3],daily7:[Math.min(s.ds||0,7),7],perf5:[Math.min(s.sp||0,5),5]};
  return map[id]||[0,1];
}
function getLvl(p){for(let i=LEVELS.length-1;i>=0;i--)if(p>=LEVELS[i].min)return LEVELS[i];return LEVELS[0];}
function getNxt(p){for(const l of LEVELS)if(p<l.min)return l;return null;}

const DAILY_FREE = 8;
const STRIPE_MONTHLY_URL = "https://buy.stripe.com/4gM00ifyYbLI67way56kg00";
const STRIPE_YEARLY_URL = "https://buy.stripe.com/4gM7sKgD2g1YbrQ9u16kg01";
const WORKER_BASE = "https://bsm-ai-proxy.blafleur.workers.dev";
const AI_PROXY_URL = WORKER_BASE + "/v1/chat/completions";
const LLM_70B_URL = WORKER_BASE + "/api/llm-70b";
const LLM_70B_ENRICH_URL = WORKER_BASE + "/api/llm-70b/enrich";

// Sprint C3: Shareable player card generator
function generatePlayerCard(stats,callback){
  const c=document.createElement("canvas");c.width=400;c.height=560;const ctx=c.getContext("2d");
  // Background gradient
  const bg=ctx.createLinearGradient(0,0,0,560);bg.addColorStop(0,"#1a1a2e");bg.addColorStop(1,"#16213e");ctx.fillStyle=bg;ctx.fillRect(0,0,400,560);
  // Gold border
  ctx.strokeStyle="#f59e0b";ctx.lineWidth=4;ctx.strokeRect(8,8,384,544);ctx.strokeStyle="rgba(245,158,11,.3)";ctx.lineWidth=1;ctx.strokeRect(14,14,372,532);
  // Header
  ctx.fillStyle="#f59e0b";ctx.font="bold 28px 'Bebas Neue',sans-serif";ctx.textAlign="center";ctx.letterSpacing="4px";ctx.fillText("BASEBALL STRATEGY MASTER",200,48);
  // Player name
  ctx.fillStyle="white";ctx.font="bold 24px sans-serif";ctx.fillText(stats.displayName||"Rookie",200,90);
  // Level badge
  const lv=stats.lv||1;const lvl=LEVELS.find(l=>lv>=l.min)||LEVELS[0];
  ctx.fillStyle=lvl.color||"#f59e0b";ctx.font="bold 16px sans-serif";ctx.fillText("Level "+lv+" — "+(lvl.title||"Rookie"),200,116);
  // Season
  ctx.fillStyle="#6b7280";ctx.font="12px sans-serif";ctx.fillText("Season "+(stats.season||1),200,138);
  // Diamond separator
  ctx.fillStyle="#f59e0b";ctx.beginPath();ctx.moveTo(170,158);ctx.lineTo(200,148);ctx.lineTo(230,158);ctx.lineTo(200,168);ctx.closePath();ctx.fill();
  // Stats box
  const drawStat=(label,value,x,y)=>{ctx.fillStyle="#f59e0b";ctx.font="bold 32px 'Bebas Neue',sans-serif";ctx.fillText(String(value),x,y);ctx.fillStyle="#9ca3af";ctx.font="10px sans-serif";ctx.fillText(label,x,y+16)};
  drawStat("GAMES",stats.gp||0,80,210);drawStat("POINTS",stats.pts||0,200,210);drawStat("STREAK",stats.ds||0,320,210);
  // Accuracy by position
  ctx.fillStyle="#374151";ctx.fillRect(30,250,340,1);
  ctx.fillStyle="white";ctx.font="bold 12px sans-serif";ctx.fillText("POSITION ACCURACY",200,274);
  const positions=Object.entries(stats.ps||{}).filter(([,v])=>v.t>=3).sort(([,a],[,b])=>(b.c/b.t)-(a.c/a.t)).slice(0,5);
  positions.forEach(([p,v],i)=>{
    const y=295+i*24;const pct=Math.round((v.c/v.t)*100);
    ctx.fillStyle="#9ca3af";ctx.font="11px sans-serif";ctx.textAlign="left";ctx.fillText(p.replace(/([A-Z])/g," $1").trim(),40,y);
    ctx.fillStyle="#1f2937";ctx.fillRect(180,y-10,160,14);
    ctx.fillStyle=pct>=70?"#22c55e":pct>=50?"#f59e0b":"#ef4444";ctx.fillRect(180,y-10,160*(pct/100),14);
    ctx.fillStyle="white";ctx.textAlign="right";ctx.font="bold 11px sans-serif";ctx.fillText(pct+"%",350,y);
  });
  ctx.textAlign="center";
  // Achievements count
  const achCount=(stats.achs||[]).length;
  ctx.fillStyle="#374151";ctx.fillRect(30,430,340,1);
  ctx.fillStyle="#f59e0b";ctx.font="bold 14px sans-serif";ctx.fillText(achCount+" Achievement"+(achCount!==1?"s":"")+" Earned",200,458);
  // Scenarios completed
  ctx.fillStyle="#6b7280";ctx.font="12px sans-serif";ctx.fillText((stats.cl||[]).length+" Scenarios Mastered",200,480);
  // QR-like call to action
  ctx.fillStyle="#374151";ctx.fillRect(30,500,340,1);
  ctx.fillStyle="#06b6d4";ctx.font="bold 12px sans-serif";ctx.fillText("bsm-app.pages.dev",200,526);
  ctx.fillStyle="#4b5563";ctx.font="10px sans-serif";ctx.fillText("Think like a pro. Play like a pro.",200,544);
  // Export
  c.toBlob(blob=>{if(callback)callback(blob,c.toDataURL("image/png"))});
}

// Sprint 4.2: Anonymized analytics pipeline
const ANALYTICS_BATCH_INTERVAL = 30000 // flush every 30 seconds
const ANALYTICS_MAX_BATCH = 50
const analyticsQueue = []
const analyticsSessionHash = (() => {
  // Generate a per-session hash (no PII) — resets each browser session
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("")
})()
function trackAnalyticsEvent(type, data, context) {
  analyticsQueue.push({
    type,
    data: data || null,
    ageGroup: context?.ageGroup || "",
    isPro: context?.isPro || false,
    platform: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    ts: Date.now()
  })
  // Flush if batch is full
  if (analyticsQueue.length >= ANALYTICS_MAX_BATCH) flushAnalytics()
}
function flushAnalytics() {
  if (analyticsQueue.length === 0) return
  const events = analyticsQueue.splice(0, ANALYTICS_MAX_BATCH)
  fetch(WORKER_BASE + "/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionHash: analyticsSessionHash, events })
  }).catch(() => {
    // If flush fails, re-queue events (once only, don't retry forever)
    if (events[0] && !events[0]._retried) {
      events.forEach(e => { e._retried = true })
      analyticsQueue.push(...events)
    }
  })
}
// Pillar 6D: Report A/B test outcomes to worker
function reportABResult(testId, variantId, metric, value) {
  try {
    fetch(`${WORKER_BASE}/analytics/ab-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, variantId, sessionHash: analyticsSessionHash, metric, value, timestamp: Date.now() })
    }).catch(() => {}) // Fire and forget
  } catch (e) { /* silent */ }
}
// Auto-flush on interval and page unload
if (typeof window !== "undefined") {
  setInterval(flushAnalytics, ANALYTICS_BATCH_INTERVAL)
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAnalytics()
  })
  window.addEventListener("beforeunload", flushAnalytics)
}

// Sprint 4.4: Error monitoring + alerting
const errorQueue = []
const ERROR_FLUSH_INTERVAL = 60000
function reportError(type, message, context) {
  console.error(`[BSM Error] ${type}: ${message}`, context || "")
  errorQueue.push({
    type,
    message: (message || "").slice(0, 500),
    context: context || null,
    sessionHash: analyticsSessionHash,
    ts: Date.now()
  })
  if (errorQueue.length >= 10) flushErrors()
}
function flushErrors() {
  if (errorQueue.length === 0) return
  const errors = errorQueue.splice(0, 20)
  fetch(WORKER_BASE + "/error-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ errors })
  }).catch(() => {})
}
if (typeof window !== "undefined") {
  setInterval(flushErrors, ERROR_FLUSH_INTERVAL)
  window.addEventListener("error", (e) => {
    reportError("js_error", e.message || "Unknown error", {
      filename: (e.filename || "").split("/").pop(),
      line: e.lineno, col: e.colno
    })
  })
  window.addEventListener("unhandledrejection", (e) => {
    reportError("promise_rejection", String(e.reason || "Unhandled promise rejection").slice(0, 200))
  })
}

// Sprint 4.5: Performance — shared style constants (reduce inline object allocation)
const S = {
  card: {background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:16,padding:"16px 18px"},
  cardSm: {background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"10px 12px"},
  btn: {border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,padding:"12px 20px"},
  btnSm: {border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:12,padding:"8px 14px"},
  center: {textAlign:"center"},
  flexCol: {display:"flex",flexDirection:"column"},
  flexRow: {display:"flex",alignItems:"center"},
  flexBetween: {display:"flex",justifyContent:"space-between",alignItems:"center"},
  muted: {color:"#9ca3af",fontSize:12},
  heading: {color:"white",fontWeight:800,margin:0},
  gold: {color:"#f59e0b"},
  green: {color:"#22c55e"},
  red: {color:"#ef4444"},
  overlay: {position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16},
}

const FREE_THEMES = ["default","sunny","retro"];
const FREE_JERSEYS = 2;
const FREE_CAPS = 2;
const FREE_BATS = 1;
// === SITUATIONAL PATTERN DETECTION (powered by enrichFeedback stored data) ===
// Analyzes playContextHistory to detect performance patterns by game situation
function detectSituationalPatterns(history){
  if(!history||history.length<10)return[];
  const patterns=[];
  // Pressure performance: accuracy at high vs low pressure
  const highP=history.filter(h=>h.pressure>=65);
  const lowP=history.filter(h=>h.pressure<35);
  if(highP.length>=5&&lowP.length>=5){
    const highAcc=highP.filter(h=>h.isOpt).length/highP.length;
    const lowAcc=lowP.filter(h=>h.isOpt).length/lowP.length;
    if(lowAcc-highAcc>.25)patterns.push({id:"pressure_choke",label:"Struggles under pressure",detail:`${Math.round(lowAcc*100)}% at low pressure vs ${Math.round(highAcc*100)}% at high pressure`,severity:"high"});
    if(highAcc>lowAcc+.1&&highAcc>.75)patterns.push({id:"clutch_player",label:"Clutch performer",detail:`${Math.round(highAcc*100)}% accuracy in high-pressure situations`,severity:"positive"});
  }
  // Count awareness: hitter's count vs pitcher's count
  const hitterCount=history.filter(h=>h.countEdge==="hitter");
  const pitcherCount=history.filter(h=>h.countEdge==="pitcher");
  if(hitterCount.length>=3&&pitcherCount.length>=3){
    const hAcc=hitterCount.filter(h=>h.isOpt).length/hitterCount.length;
    const pAcc=pitcherCount.filter(h=>h.isOpt).length/pitcherCount.length;
    if(hAcc-pAcc>.3)patterns.push({id:"count_savvy",label:"Count-savvy player",detail:`Better decisions in hitter's counts`,severity:"positive"});
    if(pAcc-hAcc>.25)patterns.push({id:"count_blind",label:"Count-blind on hitter's counts",detail:`Misses opportunities in favorable counts`,severity:"medium"});
  }
  // Late-game performance
  const late=history.filter(h=>h.inning>=7);
  const early=history.filter(h=>h.inning<=3);
  if(late.length>=5&&early.length>=5){
    const lateAcc=late.filter(h=>h.isOpt).length/late.length;
    const earlyAcc=early.filter(h=>h.isOpt).length/early.length;
    if(earlyAcc-lateAcc>.25)patterns.push({id:"late_game_fade",label:"Late-game decision fade",detail:`${Math.round(earlyAcc*100)}% early vs ${Math.round(lateAcc*100)}% in 7th+`,severity:"medium"});
  }
  // Runners-on performance (RISP situations)
  const risp=history.filter(h=>h.runners>=2);
  const empty=history.filter(h=>h.runners===0);
  if(risp.length>=5&&empty.length>=5){
    const rispAcc=risp.filter(h=>h.isOpt).length/risp.length;
    const emptyAcc=empty.filter(h=>h.isOpt).length/empty.length;
    if(emptyAcc-rispAcc>.25)patterns.push({id:"risp_panic",label:"Overthinks with runners on",detail:`${Math.round(emptyAcc*100)}% bases empty vs ${Math.round(rispAcc*100)}% with RISP`,severity:"medium"});
  }
  return patterns;
}

// === EASING PRESETS — Named curves for animation clarity ===
const EASE={
  runner:"0.4 0 0.2 1",       // Athletic push-off, explosive acceleration
  throw:"0.15 0.6 0.35 1",    // Smooth delivery arc, fielder-to-base
  launch:"0.12 0.8 0.3 1",    // Bat contact, fast start with gentle arc
  gravity:"0.6 0 0.8 0.2",    // Falling/dropping (curveball, fly ball descent)
  ground:"0.3 0 0.65 1",      // Ground ball roll, decelerating bounce
  float:"0.4 0 0.6 1",        // Gentle ease, changeup or slow trot
  flyArc:"0.2 0.7 0.4 1",     // Fly ball parabolic arc, high to outfield
  pulse:"0.25 0.1 0.25 1",    // UI pulse, outcome ring expansion
};

// === AF1: ANIMATION-AS-DATA — Structured animation definitions ===
// Each animation is an array of phases. A generic renderer converts these to SVG+SMIL.
// Phase types: dust, ball, trail, runner, flash, text, line
// This enables: ghost runners (AF2), pitch curves (AF3), scenario-specific paths (AF5), speed control (AF6)
const ANIM_DATA={
  steal_success:[
    {type:"dust",cx:290,cy:212,r:6,dur:.3,begin:0,color:"#c4a882"},
    {type:"dust",cx:293,cy:210,r:4,dur:.25,begin:.05,color:"#c4a882"},
    {type:"dust",cx:287,cy:213,r:5,dur:.28,begin:.03,color:"#c4a882"},
    {type:"runner",path:"M290,210 Q248,170 200,135",dur:.55,begin:.08,easing:EASE.runner},
    {type:"ball",path:"M200,300 Q210,215 200,138",dur:.4,begin:.25,color:"white",r:2,easing:EASE.throw,opacity:.8},
    {type:"dust",cx:200,cy:137,r:7,dur:.3,begin:.55,color:"#c4a882"},
    {type:"dust",cx:203,cy:135,r:5,dur:.25,begin:.58,color:"#c4a882"},
    {type:"text",x:200,y:120,text:"SAFE!",size:12,color:"#22c55e",dur:1.3,begin:0},
  ],
  score_success:[
    {type:"dust",cx:112,cy:212,r:5,dur:.3,begin:0,color:"#c4a882"},
    {type:"runner",path:"M110,210 Q160,252 200,290",dur:.5,begin:.05,easing:EASE.runner},
    {type:"dust",cx:200,cy:292,r:7,dur:.3,begin:.5,color:"#c4a882"},
    {type:"text",x:200,y:265,text:"SAFE!",size:14,color:"#22c55e",dur:1.3,begin:0},
  ],
  hit_success:[
    {type:"flash",cx:200,cy:288,r:8,dur:.1,begin:0,color:"rgba(255,255,255,.9)"},
    {type:"trail",path:"M200,290 Q252,178 306,75",dur:.45,begin:.04,color:"#f59e0b",r:2,easing:EASE.launch},
    {type:"ball",path:"M200,290 Q252,178 306,75",dur:.45,begin:0,color:"#f59e0b",r:3,easing:EASE.launch,glow:true},
    {type:"dust",cx:202,cy:292,r:5,dur:.3,begin:.1,color:"#c4a882"},
    {type:"dust",cx:198,cy:291,r:3.5,dur:.25,begin:.13,color:"#c4a882"},
    {type:"runner",path:"M200,290 Q248,252 290,210",dur:.6,begin:.15,easing:EASE.runner},
    {type:"text",x:265,y:112,text:"BASE HIT",size:10,color:"#f59e0b",dur:1.3,begin:0},
  ],
  doubleplay_success:[
    {type:"flash",cx:200,cy:288,r:5,dur:.08,begin:0,color:"rgba(255,255,255,.6)"},
    {type:"ball",path:"M240,258 Q240,200 200,135",dur:.25,begin:0,color:"#22c55e",r:3,easing:EASE.throw,glow:true},
    {type:"flash",cx:200,cy:135,r:8,dur:.1,begin:.24,color:"rgba(34,197,94,.4)"},
    {type:"ball",path:"M200,135 Q248,170 290,210",dur:.25,begin:.28,color:"#22c55e",r:3,easing:EASE.throw,glow:true},
    {type:"flash",cx:290,cy:210,r:8,dur:.1,begin:.52,color:"rgba(34,197,94,.4)"},
    {type:"text",x:200,y:175,text:"DOUBLE PLAY!",size:10,color:"#22c55e",dur:1.1,begin:0},
  ],
  strike_success:[
    {type:"flash",cx:200,cy:216,r:5,dur:.1,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"trail",path:"M200,218 L200,288",dur:.4,begin:.02,color:"white",r:1.5,easing:EASE.throw},
    {type:"ball",path:"M200,218 L200,288",dur:.4,begin:0,color:"white",r:2.5,easing:EASE.throw},
    {type:"flash",cx:200,cy:290,r:6,dur:.08,begin:.38,color:"rgba(255,200,50,.7)"},
    {type:"text",x:212,y:282,text:"POP!",size:7,color:"rgba(255,200,50,.8)",dur:.4,begin:.38},
    {type:"text",x:200,y:263,text:"STRIKE!",size:10,color:"#f59e0b",dur:1.6,begin:0},
  ],
  strikeout_success:[
    {type:"flash",cx:200,cy:216,r:5,dur:.1,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"trail",path:"M200,218 L200,288",dur:.4,begin:.02,color:"white",r:1.5,easing:EASE.throw},
    {type:"ball",path:"M200,218 L200,288",dur:.4,begin:0,color:"white",r:2.5,easing:EASE.throw},
    {type:"flash",cx:200,cy:290,r:6,dur:.08,begin:.38,color:"rgba(255,200,50,.7)"},
    {type:"text",x:212,y:282,text:"POP!",size:7,color:"rgba(255,200,50,.8)",dur:.4,begin:.38},
    {type:"text",x:200,y:263,text:"STRUCK OUT!",size:13,color:"#ef4444",dur:1.6,begin:0},
  ],
  // Direction variants for steal (default is 1B→2B, add 2B→3B and 3B→Home)
  steal_2to3_success:[
    {type:"dust",cx:200,cy:137,r:6,dur:.3,begin:0,color:"#c4a882"},
    {type:"runner",path:"M200,135 Q152,170 110,210",dur:.55,begin:.08,easing:EASE.runner},
    {type:"ball",path:"M200,300 Q170,210 112,212",dur:.4,begin:.25,color:"white",r:2,easing:EASE.throw,opacity:.8},
    {type:"dust",cx:112,cy:212,r:7,dur:.3,begin:.55,color:"#c4a882"},
    {type:"text",x:110,y:195,text:"SAFE!",size:12,color:"#22c55e",dur:1.3,begin:0},
  ],
  steal_3toHome_success:[
    {type:"dust",cx:112,cy:212,r:6,dur:.3,begin:0,color:"#c4a882"},
    {type:"runner",path:"M110,210 Q160,252 200,290",dur:.55,begin:.08,easing:EASE.runner},
    {type:"ball",path:"M200,300 Q180,250 112,212",dur:.4,begin:.25,color:"white",r:2,easing:EASE.throw,opacity:.8},
    {type:"dust",cx:200,cy:292,r:7,dur:.3,begin:.55,color:"#c4a882"},
    {type:"text",x:200,y:265,text:"SAFE!",size:12,color:"#22c55e",dur:1.3,begin:0},
  ],
  // Direction variants for advance
  advance_2to3_success:[
    {type:"dust",cx:200,cy:137,r:5,dur:.3,begin:0,color:"#c4a882"},
    {type:"runner",path:"M200,135 Q152,170 110,210",dur:.5,begin:.05,easing:EASE.runner},
    {type:"text",x:152,y:183,text:"ADVANCING!",size:9,color:"#3b82f6",dur:1,begin:0},
  ],
  advance_3toHome_success:[
    {type:"dust",cx:112,cy:212,r:5,dur:.3,begin:0,color:"#c4a882"},
    {type:"runner",path:"M110,210 Q160,252 200,290",dur:.5,begin:.05,easing:EASE.runner},
    {type:"text",x:160,y:255,text:"ADVANCING!",size:9,color:"#3b82f6",dur:1,begin:0},
  ],
  // throwHome — default from 2B, variants from OF and SS
  throwHome_success:[
    {type:"line",x1:200,y1:135,x2:200,y2:290,color:"#ef4444",width:2,dash:"6,4",dur:.9,begin:0},
    {type:"ball",path:"M200,135 L200,290",dur:.35,begin:0,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:200,cy:290,r:8,dur:.1,begin:.34,color:"rgba(239,68,68,.4)"},
    {type:"text",x:200,y:265,text:"GOT HIM!",size:10,color:"#ef4444",dur:1.2,begin:0},
  ],
  throwHome_OF_success:[
    {type:"ball",path:"M300,80 Q265,155 248,185",dur:.3,begin:0,color:"white",r:2.5,easing:EASE.throw,glow:true},
    {type:"flash",cx:248,cy:185,r:5,dur:.08,begin:.29,color:"rgba(255,255,255,.4)"},
    {type:"ball",path:"M248,185 L200,290",dur:.3,begin:.35,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:200,cy:290,r:8,dur:.1,begin:.64,color:"rgba(239,68,68,.4)"},
    {type:"text",x:200,y:265,text:"GOT HIM!",size:10,color:"#ef4444",dur:1.2,begin:0},
  ],
  // Hit direction variants (default is RF, add CF and LF)
  hit_CF_success:[
    {type:"flash",cx:200,cy:288,r:8,dur:.1,begin:0,color:"rgba(255,255,255,.9)"},
    {type:"trail",path:"M200,290 Q200,178 200,60",dur:.45,begin:.04,color:"#f59e0b",r:2,easing:EASE.launch},
    {type:"ball",path:"M200,290 Q200,178 200,60",dur:.45,begin:0,color:"#f59e0b",r:3,easing:EASE.launch,glow:true},
    {type:"dust",cx:202,cy:292,r:5,dur:.3,begin:.1,color:"#c4a882"},
    {type:"runner",path:"M200,290 Q248,252 290,210",dur:.6,begin:.15,easing:EASE.runner},
    {type:"text",x:200,y:48,text:"BASE HIT",size:10,color:"#f59e0b",dur:1.3,begin:0},
  ],
  hit_LF_success:[
    {type:"flash",cx:200,cy:288,r:8,dur:.1,begin:0,color:"rgba(255,255,255,.9)"},
    {type:"trail",path:"M200,290 Q148,178 94,75",dur:.45,begin:.04,color:"#f59e0b",r:2,easing:EASE.launch},
    {type:"ball",path:"M200,290 Q148,178 94,75",dur:.45,begin:0,color:"#f59e0b",r:3,easing:EASE.launch,glow:true},
    {type:"dust",cx:198,cy:292,r:5,dur:.3,begin:.1,color:"#c4a882"},
    {type:"runner",path:"M200,290 Q248,252 290,210",dur:.6,begin:.15,easing:EASE.runner},
    {type:"text",x:135,y:112,text:"BASE HIT",size:10,color:"#f59e0b",dur:1.3,begin:0},
  ],
  // Flyout direction variants (default is RF, add CF and LF)
  flyout_CF_success:[
    {type:"flash",cx:200,cy:288,r:7,dur:.1,begin:0,color:"rgba(255,255,255,.7)"},
    {type:"trail",path:"M200,290 Q200,120 200,60",dur:.55,begin:.04,color:"white",r:2,easing:EASE.flyArc},
    {type:"ball",path:"M200,290 Q200,120 200,60",dur:.55,begin:0,color:"white",r:3,easing:EASE.flyArc,glow:true},
    {type:"flash",cx:200,cy:60,r:10,dur:.12,begin:.54,color:"rgba(34,197,94,.5)"},
    {type:"text",x:200,y:48,text:"CAUGHT!",size:10,color:"#22c55e",dur:1.2,begin:0},
  ],
  flyout_LF_success:[
    {type:"flash",cx:200,cy:288,r:7,dur:.1,begin:0,color:"rgba(255,255,255,.7)"},
    {type:"trail",path:"M200,290 Q158,118 118,108",dur:.55,begin:.04,color:"white",r:2,easing:EASE.flyArc},
    {type:"ball",path:"M200,290 Q158,118 118,108",dur:.55,begin:0,color:"white",r:3,easing:EASE.flyArc,glow:true},
    {type:"flash",cx:118,cy:108,r:10,dur:.12,begin:.54,color:"rgba(34,197,94,.5)"},
    {type:"text",x:118,y:95,text:"CAUGHT!",size:10,color:"#22c55e",dur:1.2,begin:0},
  ],
  // Groundout to 1B side (default is SS area, add 1B/2B side)
  groundout_1B_success:[
    {type:"flash",cx:200,cy:288,r:6,dur:.1,begin:0,color:"rgba(255,255,255,.7)"},
    {type:"ball",path:"M200,290 Q230,268 260,248 Q270,240 280,220",dur:.4,begin:0,color:"white",r:2.5,easing:EASE.ground,glow:true},
    {type:"dust",cx:265,cy:245,r:4,dur:.2,begin:.16,color:"#c4a882"},
    {type:"flash",cx:280,cy:220,r:5,dur:.1,begin:.39,color:"rgba(255,255,255,.5)"},
    {type:"text",x:276,y:198,text:"OUT!",size:10,color:"#22c55e",dur:1.4,begin:0},
  ],
  // Freeze variants for runner on 2B and 3B
  freeze_2B_success:[
    {type:"runner",path:"M200,135 Q165,170 140,190",dur:.8,begin:.15,easing:EASE.runner,o:0.3},
    {type:"ball",path:"M200,218 Q180,180 200,140",dur:.3,begin:.2,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:140,cy:190,r:12,dur:.15,begin:.48,color:"rgba(239,68,68,.5)"},
    {type:"text",x:140,y:178,text:"✗ OUT",size:14,color:"#ef4444",dur:1.5,begin:0},
    {type:"text",x:200,y:195,text:"SMART — DON'T RUN INTO AN OUT!",size:10,color:"#f59e0b",dur:2,begin:0},
  ],
  freeze_3B_success:[
    {type:"runner",path:"M110,210 Q140,235 165,255",dur:.8,begin:.15,easing:EASE.runner,o:0.3},
    {type:"ball",path:"M200,218 Q175,250 200,285",dur:.3,begin:.2,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:165,cy:255,r:12,dur:.15,begin:.48,color:"rgba(239,68,68,.5)"},
    {type:"text",x:165,y:243,text:"✗ OUT",size:14,color:"#ef4444",dur:1.5,begin:0},
    {type:"text",x:200,y:195,text:"SMART — DON'T RUN INTO AN OUT!",size:10,color:"#f59e0b",dur:2,begin:0},
  ],
  // AF2: Ghost failure animations — transparent overlay showing what goes wrong
  steal_fail:[
    {type:"runner",path:"M290,210 Q265,190 248,178",dur:.4,begin:.08,easing:EASE.runner,o:0.3},
    {type:"ball",path:"M200,300 Q210,200 200,140",dur:.3,begin:.1,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:230,cy:175,r:10,dur:.12,begin:.4,color:"rgba(239,68,68,.4)"},
    {type:"text",x:230,y:165,text:"OUT!",size:11,color:"#ef4444",dur:1.2,begin:0},
  ],
  hit_fail:[
    {type:"flash",cx:200,cy:288,r:5,dur:.08,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"ball",path:"M200,290 Q230,240 248,195",dur:.4,begin:0,color:"white",r:2.5,easing:EASE.launch},
    {type:"flash",cx:248,cy:195,r:6,dur:.1,begin:.39,color:"rgba(239,68,68,.3)"},
    {type:"ball",path:"M248,195 L290,210",dur:.25,begin:.45,color:"#ef4444",r:2,easing:EASE.throw},
    {type:"text",x:200,y:256,text:"OUT",size:11,color:"#ef4444",dur:1.2,begin:0},
  ],
  score_fail:[
    {type:"ball",path:"M200,135 L200,290",dur:.3,begin:0,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:200,cy:290,r:8,dur:.1,begin:.29,color:"rgba(239,68,68,.4)"},
    {type:"text",x:200,y:265,text:"OUT AT HOME!",size:11,color:"#ef4444",dur:1.2,begin:0},
  ],
  // AF3: Pitch movement variants — curveball drops, slider breaks, changeup floats
  strike_curveball:[
    {type:"flash",cx:200,cy:216,r:5,dur:.1,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"trail",path:"M200,218 Q200,250 202,292",dur:.5,begin:.02,color:"white",r:1.5,easing:EASE.gravity},
    {type:"ball",path:"M200,218 Q200,250 202,292",dur:.5,begin:0,color:"white",r:2.5,easing:EASE.gravity},
    {type:"flash",cx:202,cy:292,r:6,dur:.08,begin:.48,color:"rgba(255,200,50,.7)"},
    {type:"text",x:212,y:282,text:"POP!",size:7,color:"rgba(255,200,50,.8)",dur:.4,begin:.48},
    {type:"text",x:200,y:263,text:"STRIKE!",size:10,color:"#f59e0b",dur:1.6,begin:0},
  ],
  strike_slider:[
    {type:"flash",cx:200,cy:216,r:5,dur:.1,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"trail",path:"M200,218 Q200,254 210,288",dur:.42,begin:.02,color:"white",r:1.5,easing:EASE.throw},
    {type:"ball",path:"M200,218 Q200,254 212,288",dur:.42,begin:0,color:"white",r:2.5,easing:EASE.throw},
    {type:"flash",cx:212,cy:290,r:6,dur:.08,begin:.40,color:"rgba(255,200,50,.7)"},
    {type:"text",x:220,y:282,text:"POP!",size:7,color:"rgba(255,200,50,.8)",dur:.4,begin:.40},
    {type:"text",x:200,y:263,text:"STRIKE!",size:10,color:"#f59e0b",dur:1.6,begin:0},
  ],
  strike_changeup:[
    {type:"flash",cx:200,cy:216,r:5,dur:.1,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"trail",path:"M200,218 Q200,256 200,290",dur:.55,begin:.02,color:"white",r:1.5,easing:EASE.float},
    {type:"ball",path:"M200,218 Q200,256 200,290",dur:.55,begin:0,color:"white",r:2.5,easing:EASE.float},
    {type:"flash",cx:200,cy:290,r:6,dur:.08,begin:.53,color:"rgba(255,200,50,.7)"},
    {type:"text",x:212,y:282,text:"POP!",size:7,color:"rgba(255,200,50,.8)",dur:.4,begin:.53},
    {type:"text",x:200,y:263,text:"STRIKE!",size:10,color:"#f59e0b",dur:1.6,begin:0},
  ],
  groundout_success:[
    {type:"flash",cx:200,cy:288,r:6,dur:.1,begin:0,color:"rgba(255,255,255,.7)"},
    {type:"ball",path:"M200,290 Q220,268 240,250 Q248,242 260,230",dur:.45,begin:0,color:"white",r:2.5,easing:EASE.ground,glow:true},
    {type:"dust",cx:235,cy:255,r:4,dur:.2,begin:.18,color:"#c4a882"},
    {type:"flash",cx:260,cy:230,r:5,dur:.1,begin:.44,color:"rgba(255,255,255,.5)"},
    {type:"ball",path:"M260,230 L290,210",dur:.3,begin:.5,color:"#22c55e",r:2.5,easing:EASE.throw},
    {type:"flash",cx:290,cy:210,r:8,dur:.1,begin:.79,color:"rgba(34,197,94,.4)"},
    {type:"text",x:276,y:198,text:"OUT!",size:10,color:"#22c55e",dur:1.4,begin:0},
  ],
  flyout_success:[
    {type:"flash",cx:200,cy:288,r:7,dur:.1,begin:0,color:"rgba(255,255,255,.7)"},
    {type:"trail",path:"M200,290 Q242,118 282,108",dur:.55,begin:.04,color:"white",r:2,easing:EASE.flyArc},
    {type:"ball",path:"M200,290 Q242,118 282,108",dur:.55,begin:0,color:"white",r:3,easing:EASE.flyArc,glow:true},
    {type:"flash",cx:282,cy:108,r:10,dur:.12,begin:.54,color:"rgba(34,197,94,.5)"},
    {type:"text",x:282,y:95,text:"CAUGHT!",size:10,color:"#22c55e",dur:1.2,begin:0},
  ],
  bunt_success:[
    {type:"flash",cx:200,cy:288,r:4,dur:.08,begin:0,color:"rgba(255,255,255,.5)"},
    {type:"ball",path:"M200,290 Q198,272 192,258",dur:.5,begin:0,color:"white",r:2,easing:EASE.ground},
    {type:"runner",path:"M200,290 Q248,252 290,210",dur:.6,begin:.12,easing:EASE.runner},
    {type:"text",x:180,y:250,text:"BUNT!",size:9,color:"#22c55e",dur:1,begin:0},
  ],
  walk_success:[
    {type:"runner",path:"M200,290 Q248,252 290,210",dur:.7,begin:.1,easing:EASE.runner},
    {type:"text",x:200,y:263,text:"BALL FOUR",size:11,color:"#3b82f6",dur:1.2,begin:0},
  ],
  advance_success:[
    {type:"dust",cx:290,cy:212,r:5,dur:.3,begin:0,color:"#c4a882"},
    {type:"runner",path:"M290,210 Q248,170 200,135",dur:.5,begin:.05,easing:EASE.runner},
    {type:"text",x:248,y:163,text:"ADVANCING!",size:9,color:"#3b82f6",dur:1,begin:0},
  ],
  relay_success:[
    {type:"ball",path:"M300,80 Q265,155 248,185",dur:.3,begin:0,color:"white",r:2.5,easing:EASE.throw,glow:true},
    {type:"flash",cx:248,cy:185,r:5,dur:.08,begin:.29,color:"rgba(255,255,255,.4)"},
    {type:"ball",path:"M248,185 L200,290",dur:.3,begin:.35,color:"#ef4444",r:2.5,easing:EASE.throw},
    {type:"flash",cx:200,cy:290,r:8,dur:.1,begin:.64,color:"rgba(239,68,68,.4)"},
    {type:"text",x:224,y:240,text:"GOT HIM!",size:9,color:"#22c55e",dur:1.2,begin:0},
  ],
};

// === GUY COMPONENT — Full-body proportional player with 10 baseball poses ===
// function declaration (not const) so it's hoisted above AnimPhases and all callers
function Guy({x,y,jersey="#2563eb",cap="#1d4ed8",pants="#eee",o=1,ring=false,bat=false,mask=false,batColor="#c8a060",pose="stand",number=null}){
  const showMask=mask||pose==="catcher"||pose==="catcher-squat";
  const p=({pitcher:'pw','pitcher-windup':'pw','pitcher-set':'ps',catcher:'cs','catcher-squat':'cs',batter:'br','batter-ready':'br','batter-swing':'bs',infielder:'ir','infielder-ready':'ir','infielder-throw':'it',outfielder:'or','outfielder-ready':'or','outfielder-catch':'oc',runner:'rs','runner-sprint':'rs',stand:'or'})[pose]||'or';
  const hy=p==='cs'?-10:-16;
  const pxf=p==='rs'?' rotate(12)':p==='cs'?' translate(0,6)':p==='pw'?' rotate(-6)':p==='bs'?' rotate(-5)':'';
  const legs=(()=>{switch(p){
    case 'pw': return[-4,8,-3,4, 3,14,2,8];
    case 'ps': return[-4,13,-3,7, 4,13,3,7];
    case 'cs': return[-7,8,-6,4, 7,8,6,4];
    case 'br': return[-4,14,-3,8, 4,14,3,8];
    case 'bs': return[-5,13,-4,7, 4,12,3,7];
    case 'ir': return[-5,12,-4,6, 4,12,3,6];
    case 'it': return[-6,13,-5,7, 3,12,2,6];
    case 'rs': return[-6,10,-4,5, 6,10,4,5];
    case 'oc': return[-4,14,-3,8, 4,14,3,8];
    default:   return[-4,14,-3,8, 4,14,3,8];
  }})();
  const [lLx,lLy,lLkx,lLky, lRx,lRy,lRkx,lRky]=legs;
  const arms=(()=>{switch(p){
    case 'pw': return["M-5,-6 Q-10,-2 -12,4","M5,-6 Q12,-10 14,-6"];
    case 'ps': return["M-5,-6 Q-8,-2 -8,0","M5,-6 Q6,-2 6,0"];
    case 'cs': return["M-5,-4 Q-10,0 -12,2","M5,-4 Q10,0 12,2"];
    case 'br': return["M-5,-6 Q-8,-2 -7,2","M5,-6 Q10,-12 8,-16"];
    case 'bs': return["M-5,-6 Q-2,-2 2,0","M5,-6 Q12,-4 16,-8"];
    case 'ir': return["M-5,-6 Q-9,-2 -9,2","M5,-6 Q9,-2 9,2"];
    case 'it': return["M-5,-6 Q-8,-2 -8,2","M5,-6 Q10,-14 12,-16"];
    case 'oc': return["M-5,-6 Q-8,-10 -6,-16","M5,-6 Q8,-10 6,-16"];
    case 'rs': return["M-5,-6 Q-8,0 -10,4","M5,-6 Q8,0 10,4"];
    default:   return["M-5,-6 Q-9,-2 -8,2","M5,-6 Q9,-2 8,2"];
  }})();
  const torsoH=p==='cs'?10:14, torsoY=p==='cs'?-4:-8, torsoW=p==='cs'?12:10;
  const tw=torsoW/2, ty=torsoY, th=torsoH;
  const torsoD=`M${-tw+1},${ty+th} Q${-tw-1.5},${ty+th*0.45} ${-tw-0.5},${ty+1} L${tw+0.5},${ty+1} Q${tw+1.5},${ty+th*0.45} ${tw-1},${ty+th} Z`;
  const showBat=p==='br'||p==='bs';
  const showGlove=p==='pw'||p==='ps'||p==='cs'||p==='ir'||p==='it'||p==='or'||p==='oc';
  const glovePos=(()=>{switch(p){
    case 'pw': return[-12,4]; case 'ps': return[-8,0]; case 'cs': return[-12,2];
    case 'ir': return[-9,2]; case 'it': return[-8,2]; case 'oc': return[-6,-16];
    default: return[-8,2];
  }})();
  return(
  <g transform={`translate(${x},${y})`} opacity={o}>
    {ring&&<><circle r="16" fill="none" stroke="#f59e0b" strokeWidth="2" opacity=".6"><animate attributeName="r" values="16;19;16" dur="1.3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;.2;.6" dur="1.3s" repeatCount="indefinite"/></circle><circle r="16" fill="rgba(245,158,11,.06)"/></>}
    <g transform={`scale(0.6)${pxf}`}>
      <ellipse cy={p==='cs'?10:18} rx={p==='cs'?13:11} ry="3.5" fill="rgba(0,0,0,.25)"/>
      <path d={`M0,4 Q${lLkx},${lLky} ${lLx},${lLy}`} fill="none" stroke={pants} strokeWidth="4.5" strokeLinecap="round"/>
      <path d={`M0,4 Q${lRkx},${lRky} ${lRx},${lRy}`} fill="none" stroke={pants} strokeWidth="4.5" strokeLinecap="round"/>
      <circle cx={lLx} cy={lLy} r="2.2" fill="#333"/><circle cx={lRx} cy={lRy} r="2.2" fill="#333"/>
      <path d={torsoD} fill={jersey}/>
      <path d={`M${-tw+2},${ty+3} L${tw-2},${ty+3}`} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".8"/>
      {ring&&number&&<text x="0" y={ty+th-2} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,.7)" fontWeight="700" fontFamily="monospace">{number}</text>}
      <path d={arms[0]} fill="none" stroke={jersey} strokeWidth="3.5" strokeLinecap="round"/>
      <path d={arms[1]} fill="none" stroke={jersey} strokeWidth="3.5" strokeLinecap="round"/>
      {showGlove&&<circle cx={glovePos[0]} cy={glovePos[1]} r="3.2" fill="#8B5A2B" stroke="#6B3A1B" strokeWidth=".6"/>}
      {showBat&&p==='br'&&<line x1="8" y1="-16" x2="6" y2="-28" stroke={batColor} strokeWidth="2.5" strokeLinecap="round"/>}
      {showBat&&p==='bs'&&<line x1="16" y1="-8" x2="24" y2="-14" stroke={batColor} strokeWidth="2.5" strokeLinecap="round"/>}
      <circle cy={hy} r="7.5" fill="#e8c4a0"/>
      <circle cx="-2.5" cy={hy-1} r="1.1" fill="#333"/><circle cx="2.5" cy={hy-1} r="1.1" fill="#333"/>
      <ellipse cy={hy+2} rx="1.5" ry="1" fill="#c99b6d"/>
      <ellipse cy={hy-5} rx="9" ry="3.5" fill={cap}/><rect x="-9" y={hy-7} width="18" height="4.5" rx="3" fill={cap}/>
      <rect x="-1.5" y={hy-1} width="11" height="2.8" rx="1.5" fill={cap} opacity=".55"/>
      {showMask&&<><rect x="-6" y={hy+1} width="12" height="9" rx="2" fill="none" stroke="#555" strokeWidth="1" opacity=".6"/><line x1="-5" y1={hy+4} x2="5" y2={hy+4} stroke="#555" strokeWidth=".5" opacity=".4"/><line x1="-5" y1={hy+7} x2="5" y2={hy+7} stroke="#555" strokeWidth=".5" opacity=".4"/></>}
    </g>
  </g>
  );
}

// AF1: Generic Animation Renderer — converts ANIM_DATA phases to SVG+SMIL
function AnimPhases({phases,ak}){
  if(!phases||!phases.length)return null;
  return <g key={`ap${ak}`}>{phases.map((p,i)=>{
    const k=`${ak}-${i}`;
    if(p.type==="dust")return <circle key={k} cx={p.cx} cy={p.cy} r="1" fill={p.color||"#c4a882"} opacity="0"><animate attributeName="r" from="1" to={p.r||5} dur={p.dur+"s"} begin={(p.begin||0)+"s"} fill="freeze"/><animate attributeName="opacity" values="0;.45;0" dur={(p.dur+.05)+"s"} begin={(p.begin||0)+"s"} fill="freeze"/></circle>;
    if(p.type==="ball")return <circle key={k} r={p.r||2.5} fill={p.color||"white"} opacity={p.opacity||1} filter={p.glow?"url(#gl)":undefined}><animateMotion dur={p.dur+"s"} begin={(p.begin||0)+"s"} fill="freeze" path={p.path} calcMode="spline" keyTimes="0;1" keySplines={p.easing||EASE.pulse}/></circle>;
    if(p.type==="trail")return <circle key={k} r={p.r||2} fill={p.color||"white"} opacity=".3"><animateMotion dur={p.dur+"s"} begin={(p.begin+.03||.03)+"s"} fill="freeze" path={p.path} calcMode="spline" keyTimes="0;1" keySplines={p.easing||EASE.pulse}/><animate attributeName="opacity" from=".3" to="0" dur={(p.dur*.7)+"s"} begin={(p.begin+.06||.06)+"s"} fill="freeze"/></circle>;
    if(p.type==="runner")return <g key={k} opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin={(p.begin||0)+"s"} fill="freeze"/><animateMotion dur={p.dur+"s"} begin={(p.begin||0)+"s"} fill="freeze" path={p.path} calcMode="spline" keyTimes="0;1" keySplines={p.easing||EASE.runner}/><Guy x={0} y={0} jersey={p.jersey||"#dc2626"} cap={p.cap||"#b91c1c"} pants={p.pants||"#d1d5db"} pose="runner" o={p.o||1}/></g>;
    if(p.type==="flash")return <circle key={k} cx={p.cx} cy={p.cy} r="0" fill={p.color||"rgba(255,255,255,.5)"}><animate attributeName="r" from="0" to={p.r||8} dur={p.dur+"s"} begin={(p.begin||0)+"s"} fill="freeze"/><animate attributeName="opacity" from={p.opacity||".5"} to="0" dur={(p.dur+.05)+"s"} begin={(p.begin||0)+"s"} fill="freeze"/></circle>;
    if(p.type==="text")return <text key={k} x={p.x} y={p.y} textAnchor="middle" fontSize={p.size||10} fill={p.color||"#22c55e"} fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur={p.dur+"s"} fill="freeze"/>{p.text}</text>;
    if(p.type==="line")return <line key={k} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.color||"#ef4444"} strokeWidth={p.width||2} strokeDasharray={p.dash||"6,4"} opacity="0"><animate attributeName="opacity" from=".65" to="0" dur={p.dur+"s"} fill="freeze"/></line>;
    return null;
  })}</g>;
}

// AF2: Ghost runner — render animation phases as transparent overlay showing wrong outcome
function GhostPhases({phases,ak}){
  if(!phases||!phases.length)return null;
  // Render same phases but with reduced opacity and red tint
  const ghosted=phases.map(p=>({...p,
    opacity:p.type==="text"?0:0.25,
    color:p.type==="runner"?undefined:p.type==="text"?undefined:
      p.color?.startsWith("rgba")?p.color.replace(/[\d.]+\)$/,".15)"):
      p.type==="dust"?"rgba(239,68,68,.15)":p.color,
  }));
  return <g style={{opacity:.35}}><AnimPhases phases={ghosted} ak={ak+500}/></g>;
}

const POS_SUGGESTIONS = {pitcher:"catcher",catcher:"pitcher",firstBase:"secondBase",secondBase:"shortstop",shortstop:"secondBase",thirdBase:"firstBase",leftField:"centerField",centerField:"rightField",rightField:"leftField",batter:"baserunner",baserunner:"batter",manager:"pitcher"};
// Curated placement scenarios — hand-picked for diagnostic quality, short reads, clear best answers, diverse concepts
const PLACEMENT_POOL={
  pitcher:{diff1:["p2","p13","p25","p65","p_ba1"],diff2:["p6","p40","p59","p64"],diff3:["p9","p21","p43","p56"]},
  catcher:{diff1:["ct2","ct5","ct6","ct31"],diff2:["ct1","ct3","ct12","ct27"],diff3:["ct7","ct9","ct16","ct32"]},
  firstBase:{diff1:["f5","1b1","1b3","1b17"],diff2:["1b2","1b_new1","1b13","1b_new3"],diff3:["f21","1b4","1b12","f32"]},
  secondBase:{diff1:["f1","f14","2b3","f60"],diff2:["f12","2b5","2b10","2b_new1"],diff3:["f20","2b7","2b14","2b_new5"]},
  shortstop:{diff1:["f13","ss2","ss4","f48"],diff2:["f16","ss1","ss3","ss_new1"],diff3:["f61","ss6","ss8","ss_new5"]},
  thirdBase:{diff1:["3b1","3b5","3b7","3b_new6"],diff2:["3b2","3b11","3b14","3b_new4"],diff3:["3b6","3b8","3b13","3b_new3"]},
  leftField:{diff1:["f9","lf3","lf10","lf23"],diff2:["lf2","lf9","lf18","lf14"],diff3:["lf5","lf8","lf13","lf17"]},
  centerField:{diff1:["f3","cf9","cf17","cf4"],diff2:["cf5","cf14","f27","cf10"],diff3:["f10","cf13","cf6","cf7"]},
  rightField:{diff1:["rf3","rf6","rf2","f55"],diff2:["f7","rf1","rf7","f26"],diff3:["rf8","rf14","rf16","f58"]},
  batter:{diff1:["b1","b13","b25","b5"],diff2:["b4","b9","b2","b37","b_pr1"],diff3:["b12","b21","b32","b49"]},
  baserunner:{diff1:["r1","r2","r12","r44","r11"],diff2:["r9","r16","r36","r48"],diff3:["r5","r20","r51","r22"]},
  manager:{diff1:["m4","m13","m58","m12","m33"],diff2:["m1","m6","m37","m_wp1"],diff3:["m9","m21","m31","m38"]}
};
const STORAGE_KEY = "bsm_v5";
// Phase 4.4: Kid-friendly concept display names for ages 6-10
const CONCEPT_KIDS={"situational-hitting":"Smart Hitting","cutoff-roles":"Teamwork Throws","force-vs-tag":"Outs & Tags","fly-ball-priority":"Who Catches It","backup-duties":"Backing Up","rundown-mechanics":"Rundowns","tag-up":"Tag Up","first-pitch-strike":"First Pitch","wild-pitch-coverage":"Wild Pitch","steal-breakeven":"Smart Stealing","count-leverage":"Using the Count","bunt-re24":"Bunting","double-play-turn":"Double Plays","two-strike-approach":"Two Strikes","infield-fly":"Infield Fly","secondary-lead":"Base Leading","of-communication":"Outfield Calls","catcher-framing":"Framing","pickoff-mechanics":"Pickoffs","dropped-third-strike":"Dropped Third Strike","pitch-sequencing":"Pitch Calling","catcher-leadership":"Being a Leader","steal-window":"Steal Timing","bunt-defense":"Bunt Defense","hit-and-run":"Hit and Run","squeeze-play":"Squeeze Play","relay-double-cut":"Relay Throws","first-third":"First & Third","obstruction-interference":"Rules Knowledge","dp-positioning":"Fielding Position","pre-pitch-routine":"Getting Ready","team-communication":"Talking on Defense","pitch-count-mgmt":"Pitch Counts","ibb-strategy":"Intentional Walks","squeeze-recognition":"Reading the Squeeze","mound-composure":"Staying Calm","defensive-substitution":"Substitutions","of-wall-play":"Wall Play","line-guarding":"Guarding the Line","platoon-advantage":"Matchups","times-through-order":"Batting Order","win-probability":"Game Smarts","leverage-index":"Big Moments","pitch-type-value":"Pitch Types","eye-level-change":"Eye Level","pitch-clock-strategy":"Pitch Clock","balk-rule":"Balks"};
function kidConceptName(tag,ageGroup){return(ageGroup==="6-8"||ageGroup==="9-10")?CONCEPT_KIDS[tag]||tag.replace(/-/g," "):tag.replace(/-/g," ")}
const LB_KEY = "bsm_lb";
function getWeek(){const d=new Date();const jan1=new Date(d.getFullYear(),0,1);return Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7)+"-"+d.getFullYear();}
const BASEBALL_NAMES=["Slugger","Ace","Rookie","MVP","Clutch","Hammer","Flash","Blaze","Storm","Thunder","Captain","Dash","Nitro","Phoenix","Cobra","Falcon","Eagle","Mustang","Raptor","Viking"];
const AGE_GROUPS=[{id:"6-8",label:"Ages 6-8",desc:"Rising Rookie — Learn the game the right way",maxDiff:1},{id:"9-10",label:"Ages 9-10",desc:"Starter — Force plays, cutoffs, stealing",maxDiff:2},{id:"11-12",label:"Ages 11-12",desc:"Competitor — Full game situations",maxDiff:3},{id:"13-15",label:"Ages 13-15",desc:"Travel Ball — Advanced strategy",maxDiff:3},{id:"16-18",label:"Ages 16-18",desc:"Varsity — Analytics & game management",maxDiff:3},{id:"18+",label:"Ages 18+",desc:"College / Pro — Full sabermetrics",maxDiff:3}];
const CONCEPT_GATES = {
  "6-8": {
    allowed: ["force-vs-tag","fly-ball-priority","backup-duties","rundown-mechanics",
              "tag-up","first-pitch-strike","wild-pitch-coverage"],
    forbidden: ["steal-breakeven","count-leverage","bunt-re24","times-through-order",
                "pitch-sequencing","squeeze-play","hit-and-run","relay-double-cut",
                "first-third","pitch-type-value","eye-level-change","win-probability",
                "leverage-index","platoon-advantage","pitch-clock-strategy","ibb-strategy",
                "squeeze-recognition","balk-rule","line-guarding","steal-window"],
    adjustments: {
      stealing: "Almost always correct at this age — catchers can't throw well yet",
      bunting: "Usually effective — fielders struggle to handle bunts",
      errors: "Expect lots of errors — teach what to do AFTER errors happen"
    }
  },
  "9-10": {
    allowed: ["force-vs-tag","fly-ball-priority","backup-duties","rundown-mechanics",
              "tag-up","first-pitch-strike","wild-pitch-coverage","cutoff-roles",
              "count-leverage","double-play-turn","two-strike-approach","infield-fly",
              "secondary-lead","of-communication","catcher-framing","pickoff-mechanics",
              "dropped-third-strike","obstruction-interference"],
    forbidden: ["bunt-re24","times-through-order","pitch-type-value","eye-level-change",
                "win-probability","leverage-index","ibb-strategy","squeeze-recognition",
                "steal-window","line-guarding"],
    adjustments: {
      stealing: "Lower threshold (~60% break-even) due to catcher skill level",
      bunting: "More effective than at higher levels — fielders still developing",
      pitchCount: "Youth pitch limits: 50-75 pitches max per game"
    }
  },
  "11-12": {
    forbidden: ["pitch-type-value","eye-level-change","leverage-index"],
    adjustments: {
      stealing: "Break-even closer to 65% at this age",
      bunting: "Starting to resemble standard RE24 analysis"
    }
  },
  "13-15": {
    forbidden: [],
    adjustments: {
      stealing: "Standard 72% break-even applies",
      bunting: "Full RE24 analysis applies"
    }
  },
  "16-18": {
    forbidden: [],
    adjustments: {
      stealing: "Standard 72% break-even applies",
      bunting: "Full RE24 analysis applies"
    }
  },
  "18+": {
    forbidden: [],
    adjustments: {
      stealing: "Standard 72% break-even applies",
      bunting: "Full RE24 analysis applies"
    }
  },
  "13+": {
    forbidden: [],
    adjustments: {
      stealing: "Standard 72% break-even applies",
      bunting: "Full RE24 analysis applies"
    }
  }
};
const COACH_VOICES = {
  rookie: {
    ageRange: [5, 10],
    system: "You are Coach Rookie — an enthusiastic, encouraging youth baseball coach. Use simple words, exciting analogies, and celebrate effort. Never use statistics or advanced terms. Keep sentences short. Use exclamation marks naturally.",
    lineStyle: "excited"
  },
  varsity: {
    ageRange: [11, 14],
    system: "You are Coach Varsity — a knowledgeable travel ball coach. Reference real MLB players as examples when relevant. Introduce statistics gently. Be encouraging but direct about mistakes.",
    lineStyle: "teaching"
  },
  scout: {
    ageRange: [15, 18],
    system: "You are Coach Scout — an analytical baseball mind who respects the player's intelligence. Use full statistical vocabulary freely. Reference game theory and RE24 when relevant. Talk to the player as a peer analyst.",
    lineStyle: "analytical"
  }
};
function getCoachVoice(stats) {
  const ag = stats?.ageGroup || "11-12"
  const lvl = getLvl(stats?.pts || 0).n
  if (ag === "6-8" || (ag === "9-10" && lvl < 5)) return COACH_VOICES.rookie
  if (ag === "13+" || ag === "13-15" || ag === "16-18" || ag === "18+" || lvl >= 15) return COACH_VOICES.scout
  return COACH_VOICES.varsity
}
// ── Learning Paths (Pillar 3A) — structured multi-session progressions ──
// All concept tags cross-referenced against BRAIN.concepts (46 tags verified)
const LEARNING_PATHS = {
  "defensive_fundamentals": {
    sequence: ["fly-ball-priority", "backup-duties", "wild-pitch-coverage",
               "cutoff-roles", "double-play-turn", "dp-positioning", "relay-double-cut"],
    assessAt: [2, 4, 6],
    positions: ["firstBase", "secondBase", "shortstop", "thirdBase",
                "leftField", "centerField", "rightField"]
  },
  "baserunning_intelligence": {
    sequence: ["force-vs-tag", "tag-up", "secondary-lead", "steal-breakeven",
               "scoring-probability", "baserunning-rates", "steal-window"],
    assessAt: [2, 4, 6],
    positions: ["baserunner"]
  },
  "count_mastery": {
    sequence: ["first-pitch-strike", "count-leverage", "two-strike-approach",
               "first-pitch-value", "pitch-clock-strategy"],
    assessAt: [2, 4],
    positions: ["batter", "pitcher", "catcher"]
  },
  "pitching_strategy": {
    sequence: ["first-pitch-strike", "pitch-count-mgmt", "pitch-sequencing",
               "pitch-clock-strategy", "times-through-order", "pitch-type-value"],
    assessAt: [2, 4, 6],
    positions: ["pitcher", "catcher", "manager"]
  },
  "situational_offense": {
    sequence: ["situational-hitting", "hit-and-run", "bunt-re24",
               "squeeze-play", "squeeze-recognition"],
    assessAt: [2, 4],
    positions: ["batter", "baserunner", "manager"]
  },
  "team_defense": {
    sequence: ["backup-duties", "rundown-mechanics", "double-play-turn",
               "bunt-defense", "first-third", "pickoff-mechanics"],
    assessAt: [2, 4, 6],
    positions: ["firstBase", "secondBase", "shortstop", "thirdBase", "pitcher", "catcher"]
  },
  "outfield_craft": {
    sequence: ["fly-ball-priority", "of-communication", "backup-duties",
               "tag-up", "of-depth-arm-value", "cutoff-roles"],
    assessAt: [2, 4, 6],
    positions: ["leftField", "centerField", "rightField"]
  },
  "game_management": {
    sequence: ["platoon-advantage", "times-through-order", "ibb-strategy",
               "win-probability", "leverage-index", "line-guarding"],
    assessAt: [2, 4, 6],
    positions: ["manager"]
  }
};
const SEASON_STAGES=[
  {name:"Spring Training",emoji:"🌴",games:2,diff:1,color:"#22c55e",
    story:"First day of camp. Coach hands you a glove and says 'Show me what you've got, kid.' The sun is warm, the grass is fresh, and anything feels possible."},
  {name:"Opening Day",emoji:"🎉",games:1,diff:1,color:"#3b82f6",
    story:"The stands are packed. The anthem just finished. The crowd roars as you step onto the field. It's real now."},
  {name:"Regular Season",emoji:"⚾",games:3,diff:2,color:"#f59e0b",
    story:"June heat. Dog days. Every game blends together — but every decision still counts. This is where real players separate themselves."},
  {name:"All-Star Break",emoji:"🌟",games:1,diff:2,color:"#a855f7",
    story:"You made the All-Star team. The best players from every team are here. Time to show the whole league what you're about."},
  {name:"Pennant Race",emoji:"🔥",games:2,diff:3,color:"#ef4444",
    story:"September. The air is electric. Every game matters. One wrong call and the season's over. Every at-bat feels like the last."},
  {name:"Playoffs",emoji:"🏆",games:2,diff:3,color:"#eab308",
    story:"Elimination game. The crowd is deafening. Your heart is pounding. No room for mistakes — this is what you trained for."},
  {name:"World Series",emoji:"👑",games:1,diff:3,color:"#f59e0b",
    story:"Game 7. Bottom of the 9th. The whole world is watching. This is the moment every kid dreams about. Make it count."},
];
const SEASON_TOTAL=SEASON_STAGES.reduce((s,st)=>s+st.games*3,0);
const FIELD_THEMES=[
  {id:"default",name:"Classic",emoji:"🏟️",grass:["#5cd97a","#4ec96c","#40b95e","#32a950"],dirt:["#e0b882","#cca06a"],sky:"#0c1520",skyTop:"#4a90d9",skyBot:"#87ceeb",wall:["#1a6030","#28843e"],fence:"#facc15",inGrass:"#48b85e",mound:["#cca068","#aa8450"],warn:"#b0905e",crowd:["#e74c3c","#3498db","#f1c40f","#2ecc71","#e67e22","#9b59b6"],crowdBg:"#2a5a3a",scoreBd:"#1a3a20",scoreTxt:"#f5d020",banner:["#e74c3c","#3498db","#f1c40f"],foulPole:"#f5d020",unlock:null,desc:"The original"},
  {id:"night",name:"Night Game",emoji:"🌙",grass:["#3a8a4e","#308a44","#26703a","#1c5a30"],dirt:["#c09068","#a87a55"],sky:"#040a14",skyTop:"#060e1a",skyBot:"#0c1a2e",wall:["#102818","#1a4028"],fence:"#e0b010",inGrass:"#308a40",mound:["#b08050","#906840"],warn:"#907048",crowd:["#8b3a3a","#2a6090","#b0902a","#2a8050","#a06020","#6a3a80"],crowdBg:"#0a1a10",scoreBd:"#0a180e",scoreTxt:"#c0a020",banner:["#8b3a3a","#2a6090","#b0902a"],foulPole:"#c0a020",unlock:{type:"gp",val:25},desc:"Under the lights"},
  {id:"sunny",name:"Sunny Day",emoji:"☀️",grass:["#62d880","#54c86c","#46b85e","#38a850"],dirt:["#e8c48a","#d0ac72"],sky:"#0e2040",skyTop:"#60a8f0",skyBot:"#a0d8ff",wall:["#1f7040","#30a050"],fence:"#fcd934",inGrass:"#56d06c",mound:["#dab880","#c0a068"],warn:"#c0a070",crowd:["#ff6b6b","#4ecdc4","#ffe66d","#51cf66","#ffa94d","#cc5de8"],crowdBg:"#2a6a40",scoreBd:"#1a4020",scoreTxt:"#ffe030",banner:["#ff6b6b","#4ecdc4","#ffe66d"],foulPole:"#ffe030",unlock:{type:"gp",val:50},desc:"Perfect weather"},
  {id:"dome",name:"The Dome",emoji:"🏛️",grass:["#40a855","#389848","#2e8840","#247838"],dirt:["#c8a470","#b09060"],sky:"#14142a",skyTop:"#1a1a36",skyBot:"#28284e",wall:["#2a2a4e","#3a3a5e"],fence:"#8080ff",inGrass:"#389848",mound:["#b89060","#987848"],warn:"#988060",crowd:["#6a6aaa","#5050c0","#8080d0","#7070b0","#6060a0","#9090c0"],crowdBg:"#1a1a30",scoreBd:"#14142a",scoreTxt:"#8080ff",banner:["#6a6aaa","#5050c0","#8080d0"],foulPole:"#8080ff",unlock:{type:"ds",val:10},desc:"Indoor arena"},
  {id:"retro",name:"Retro Park",emoji:"📻",grass:["#6a9a50","#5c8a46","#4e7a3c","#407032"],dirt:["#c8a878","#b09060"],sky:"#181410",skyTop:"#c0a060",skyBot:"#e8c880",wall:["#3a3020","#504030"],fence:"#d0a860",inGrass:"#5a8a45",mound:["#b89868","#987850"],warn:"#a89070",crowd:["#c06030","#806030","#d0a040","#607840","#b07030","#906050"],crowdBg:"#2a2018",scoreBd:"#1a1810",scoreTxt:"#d0a860",banner:["#c06030","#806030","#d0a040"],foulPole:"#d0a860",unlock:{type:"cl",val:30},desc:"Old-timey charm"},
  {id:"spring",name:"Spring Training",emoji:"🌸",grass:["#70d888","#62c87a","#54b86c","#46a85e"],dirt:["#e8c890","#d0b078"],sky:"#0e1828",skyTop:"#78b8e8","skyBot":"#c0e0f8",wall:["#2a7840","#3a9850"],fence:"#f8d840",inGrass:"#60c070",mound:["#d8b878","#c0a060"],warn:"#c0a868",crowd:["#f06898","#48c0d0","#f8d060","#60d070","#f0a040","#b870d0"],crowdBg:"#306840",scoreBd:"#204830",scoreTxt:"#f8d840",banner:["#f06898","#48c0d0","#f8d060"],foulPole:"#f8d840",unlock:{type:"gp",val:75},desc:"Fresh start vibes"},
  {id:"worldseries",name:"World Series",emoji:"🏆",grass:["#4ac066","#3cb058","#2ea04a","#20903c"],dirt:["#d8b070","#c09858"],sky:"#080e18",skyTop:"#1a2a40",skyBot:"#2a4060",wall:["#142838","#1e3a4e"],fence:"#f0c010",inGrass:"#38a850",mound:["#c8a058","#a88840"],warn:"#a89058",crowd:["#e84040","#3888d8","#f0c020","#38b858","#e88020","#a050c8"],crowdBg:"#142a28",scoreBd:"#0a1a18",scoreTxt:"#f0c010",banner:["#f0c010","#e84040","#3888d8"],foulPole:"#f0c010",unlock:{type:"gp",val:100},desc:"October classic"},
  {id:"sandlot",name:"Sandlot",emoji:"🏡",grass:["#7ab85a","#6ca84e","#5e9842","#508836"],dirt:["#d0a060","#b88848"],sky:"#121820",skyTop:"#80b8e0",skyBot:"#b0d8f0",wall:["#8a6840","#705030"],fence:"#a08040",inGrass:"#68a04c",mound:["#c09050","#a07838"],warn:"#a08848",crowd:["#c87040","#9070a0","#b0a040","#70a060","#c09030","#808070"],crowdBg:"#3a3020",scoreBd:"#282018",scoreTxt:"#c0a040",banner:["#c87040","#9070a0","#b0a040"],foulPole:"#a08040",unlock:{type:"ds",val:21},desc:"Neighborhood magic"},
  {id:"winter",name:"Winter Classic",emoji:"❄️",grass:["#88b8a0","#78a890","#689880","#588870"],dirt:["#c0b098","#a89880"],sky:"#0a1018",skyTop:"#607888",skyBot:"#98b0c0",wall:["#506068","#607078"],fence:"#90a8b0",inGrass:"#70a888",mound:["#b0a088","#988870"],warn:"#989080",crowd:["#5080a0","#406888","#7090a8","#608898","#507888","#80a0b0"],crowdBg:"#283038",scoreBd:"#1a2028",scoreTxt:"#90a8b0",banner:["#5080a0","#406888","#7090a8"],foulPole:"#90a8b0",unlock:{type:"cl",val:50},desc:"Frosty diamond"},
  {id:"allstar",name:"All-Star Game",emoji:"⭐",grass:["#50c870","#42b862","#34a854","#269846"],dirt:["#e0b878","#c8a060"],sky:"#0a0e1a",skyTop:"#1a2848",skyBot:"#304870",wall:["#18284a","#203860"],fence:"#f8d020",inGrass:"#42b060",mound:["#d0a860","#b89048"],warn:"#b89858",crowd:["#f04848","#4088e0","#f8c828","#40c060","#f09028","#a858d8"],crowdBg:"#182840",scoreBd:"#101830",scoreTxt:"#f8d020",banner:["#f8d020","#f04848","#4088e0"],foulPole:"#f8d020",unlock:{type:"gp",val:150},desc:"Midsummer showcase"},
];
function themeOk(th,s){
  // Pro users get all themes
  if(s.isPro)return true;
  // Free themes always available
  if(FREE_THEMES.includes(th.id))return true;
  // Milestone fallback: grandfather existing free users who earned themes
  if(th.unlock){const{type:t,val:v}=th.unlock;if(t==="gp"&&s.gp>=v)return true;if(t==="ds"&&s.ds>=v)return true;if(t==="cl"&&(s.cl?.length||0)>=v)return true;}
  return false;
}
function proGate(stats,setPanel){if(stats.isPro)return true;setPanel('upgrade');return false;}
function trackFunnel(event,setStats){setStats(p=>({...p,funnel:[...(p.funnel||[]).slice(-99),{event,ts:Date.now()}]}));}
const AVATAR_OPTS={
  jersey:["#2563eb","#ef4444","#22c55e","#f59e0b","#a855f7","#ec4899"],
  cap:["#1d4ed8","#dc2626","#16a34a","#d97706","#7c3aed","#db2777"],
  bat:["#c8a060","#404040","#e8e8e8"]
};
const STADIUM_MILESTONES=[
  {games:50,label:"Scoreboard Lights",desc:"Your scoreboard lights up!",icon:"💡"},
  {games:100,label:"Team Pennants",desc:"Pennant banners fly your colors!",icon:"🚩"},
  {games:200,label:"Fireworks",desc:"Fireworks on perfect answers!",icon:"🎆"},
  {games:330,label:"Legend Stadium",desc:"Golden border + Legend title!",icon:"👑"},
];
const DEFAULT = {pts:0,str:0,bs:0,gp:0,co:0,ps:{},achs:[],cl:[],ds:0,lastDay:null,todayPlayed:0,todayDate:null,sp:0,isPro:false,onboarded:false,soundOn:true,recentWrong:[],dailyDone:false,dailyDate:null,weeklyDone:null,streakFreezes:0,survivalBest:0,ageGroup:"11-12",displayName:"",teamCode:"",teamName:"",seasonGame:0,seasonCorrect:0,seasonComplete:false,fieldTheme:"default",avatarJersey:0,avatarCap:0,avatarBat:0,season:1,proPlan:null,proPurchaseDate:null,proExpiry:null,lastStreakFreezeDate:null,wrongCounts:{},posGrad:{},funnel:[],hist:{},posPlayed:{},firstPlayDate:null,lastPlayDate:null,sessionCount:0,tutorialDone:false,promoCode:null,promoActivatedDate:null,masteryShown:[],masteryData:{concepts:{},errorPatterns:{},sessionHistory:[]},qualitySignals:{},flaggedScenarios:{},explanationLog:{},gapDetectionCache:null,lastWrongConceptTag:null,aiHistory:[],aiMetrics:{correct:0,total:0,flagged:0,scores:[]},hcMetrics:{correct:0,total:0,flagged:0},activePath:null,sitMastery:{},dailySitDone:false,dailySitDate:null,dailySitStreak:0,dailySitBestStreak:0,lastDailySitDate:null,aiSitCount:0,useLLM70B:false,adaptiveDiff:{},placementDiff:{},brainIQ:0,brainExplored:{},brainStreak:0,brainLastVisit:null,brainAchievements:[],brainFactIdx:0,playContextHistory:[],highlights:[]};

// Streak flame visual — grows with daily streak length
function getFlame(ds){
  if(ds>=100)return{icon:"🔷",label:"LEGENDARY",color:"#38bdf8",glow:"rgba(56,189,248,.3)",size:22};
  if(ds>=50)return{icon:"💜",label:"EPIC",color:"#a855f7",glow:"rgba(168,85,247,.3)",size:20};
  if(ds>=30)return{icon:"🔵",label:"BLUE FLAME",color:"#3b82f6",glow:"rgba(59,130,246,.3)",size:19};
  if(ds>=14)return{icon:"🔥",label:"ON FIRE",color:"#ef4444",glow:"rgba(239,68,68,.25)",size:18};
  if(ds>=7)return{icon:"🔥",label:"HOT",color:"#f97316",glow:"rgba(249,115,22,.2)",size:16};
  if(ds>=3)return{icon:"🔥",label:"WARM",color:"#f59e0b",glow:"rgba(245,158,11,.15)",size:14};
  return{icon:"🔥",label:"",color:"#f97316",glow:"none",size:12};
}
const STREAK_MILESTONES=[7,14,30,50,100];

// Daily Diamond Play — deterministic scenario based on date
function getDailyScenario(){
  const today=new Date().toDateString();
  // Simple hash: sum char codes of date string
  let hash=0;for(let i=0;i<today.length;i++)hash=((hash<<5)-hash+today.charCodeAt(i))|0;
  hash=Math.abs(hash);
  // Flatten all scenarios into one pool
  const allSc=Object.entries(SCENARIOS).flatMap(([pos,arr])=>arr.map(s=>({...s,_pos:pos})));
  const idx=hash%allSc.length;
  // Also pick a secondary based on different hash for variety across days
  return allSc[idx];
}

// Sprint D4: Scenario of the Week — hardest scenario, same for all players each week
function getWeeklyScenario(){
  const now=new Date();const jan1=new Date(now.getFullYear(),0,1);
  const weekNum=Math.ceil(((now-jan1)/86400000+jan1.getDay()+1)/7);
  const allSc=Object.entries(SCENARIOS).flatMap(([pos,arr])=>arr.map(s=>({...s,_pos:pos})));
  const hardPool=allSc.filter(s=>(s.diff||1)>=2);
  let hash=weekNum*2654435761;hash=Math.abs(hash)%hardPool.length;
  return hardPool[hash];
}

// Daily Situation — one rotating situation set per day (Pro difficulty)
function getDailySituation(){
  const today=new Date();
  const seed=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();
  const proSets=SITUATION_SETS.filter(s=>s.diff===2);
  return proSets.length>0?proSets[seed%proSets.length]:SITUATION_SETS[0];
}

// Mastery tier for a situation set: Diamond > Gold > Silver > Bronze > none
function getSitTier(setId,sitMastery){
  const sm=sitMastery?.[setId];if(!sm||!sm.bestGrade)return null;
  const g=sm.bestGrade;
  // Diamond requires S grade on the set
  if(g==="S")return{id:"diamond",emoji:"💎",label:"Diamond",color:"#38bdf8",bg:"rgba(56,189,248,"};
  if(g==="A")return{id:"gold",emoji:"🥇",label:"Gold",color:"#f59e0b",bg:"rgba(245,158,11,"};
  if(g==="B")return{id:"silver",emoji:"🥈",label:"Silver",color:"#94a3b8",bg:"rgba(148,163,184,"};
  return{id:"bronze",emoji:"🥉",label:"Bronze",color:"#d97706",bg:"rgba(217,119,6,"};
}

// Situation Room aggregate rank
function getSitRank(sitMastery){
  const tiers=SITUATION_SETS.map(s=>getSitTier(s.id,sitMastery));
  const bronze=tiers.filter(t=>t).length;
  const silver=tiers.filter(t=>t&&(t.id==="silver"||t.id==="gold"||t.id==="diamond")).length;
  const gold=tiers.filter(t=>t&&(t.id==="gold"||t.id==="diamond")).length;
  const diamond=tiers.filter(t=>t&&t.id==="diamond").length;
  const allDiamond=diamond===SITUATION_SETS.length&&SITUATION_SETS.length>0;
  if(allDiamond)return{title:"Hall of Fame Strategist",emoji:"👑",color:"#38bdf8"};
  if(gold>=15)return{title:"Field General",emoji:"🎖️",color:"#f59e0b"};
  if(silver>=8)return{title:"Dugout Genius",emoji:"🧠",color:"#94a3b8"};
  if(bronze>=4)return{title:"Coordinator",emoji:"📋",color:"#d97706"};
  return{title:"Scout",emoji:"🔍",color:"#9ca3af"};
}

// ============================================================================
// AI SCENARIO GENERATION — calls Claude API for personalized content
// ============================================================================
const ANIMS = ["strike","strikeout","hit","groundout","flyout","steal","score","advance","catch","throwHome","doubleplay","bunt","walk","safe","freeze"];
