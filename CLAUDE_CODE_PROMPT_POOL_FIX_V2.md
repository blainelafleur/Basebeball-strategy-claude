# Claude Code Prompt — Fix Pool Repeat-Serving (Root Cause Found)

## The Root Cause

There are TWO bugs causing the server pool to serve the same scenario in a loop:

### Bug 1: Exclude list silently dropped when >100 items

In `fetchFromServerPool()` (around line 9082), there's this condition:

```javascript
if (excludeIds.length > 0 && excludeIds.length <= 100) {
  params.set("exclude", excludeIds.slice(0, 100).join(","))
}
```

The `<= 100` condition means: if the exclude list has MORE than 100 items, **no exclude parameter is sent at all**. The `.slice(0, 100)` inside never runs because the outer `if` fails first.

The `excludePoolIds` array combines `stats.cl` (completed scenario IDs — can be 100+), `stats.aiHistory` (up to 100 entries), and `_servedScenarioIds`. For any active player, this total easily exceeds 100. Result: the exclude parameter is silently dropped and the server returns the same scenario every time.

### Bug 2: Mixing irrelevant IDs in the exclude list

`excludePoolIds` on line 10433 includes `stats.cl` which contains completed HANDCRAFTED scenario IDs (strings like `"pitcher_1"`, `"catcher_5"`, etc). These are completely irrelevant for filtering D1 pool scenarios (which have IDs like `"pool_a1b2c3d4e5f6"`) — they just bloat the exclude list and push it past the 100-item limit.

---

## The Fix (3 changes)

### Change 1: Fix the exclude condition in fetchFromServerPool

Find the `fetchFromServerPool` function (around line 9078). Find these lines:

```javascript
if (excludeIds.length > 0 && excludeIds.length <= 100) {
  params.set("exclude", excludeIds.slice(0, 100).join(","))
}
```

Replace with:

```javascript
if (excludeIds.length > 0) {
  params.set("exclude", excludeIds.slice(0, 100).join(","))
}
```

This always sends the exclude parameter (capped at 100 items), instead of silently dropping it when the list is large.

### Change 2: Only send pool-relevant IDs to the server pool

Find the `excludePoolIds` construction in `doAI()` (around line 10433). It currently looks like:

```javascript
const excludePoolIds = [...new Set([...(stats.cl || []), ...(stats.aiHistory || []).map(h => h.id), ..._servedScenarioIds])]
```

Replace with:

```javascript
const allExcludeIds = [...new Set([...(stats.cl || []), ...(stats.aiHistory || []).map(h => h.id), ..._servedScenarioIds])]
const poolExcludeIds = allExcludeIds.filter(id => typeof id === "string" && id.startsWith("pool_"))
```

Then update the two places that use `excludePoolIds`:

- For `consumeFromLocalPool`, keep using the full list (it checks local scenarios that may have any ID format):
  ```javascript
  const localPoolSc = consumeFromLocalPool(p, diffForPool, allExcludeIds)
  ```

- For `fetchFromServerPool`, use only pool IDs:
  ```javascript
  const serverPoolSc = await fetchFromServerPool(p, diffForPool, null, poolExcludeIds)
  ```

### Change 3: Also send _servedScenarioIds to the server even if not in aiHistory yet

The `poolExcludeIds` from Change 2 already includes `_servedScenarioIds` (which are pool IDs). But to be extra safe, make sure the `_servedScenarioIds` entries are always included even if the filter somehow misses them. The current code already does this via the spread operator, so this is just a verification — no code change needed here.

---

## Verification

After making these changes:

1. Search for `excludeIds.length <= 100` — should return NO results (the old broken condition is gone)
2. Search for `poolExcludeIds` — should appear in the `fetchFromServerPool` call
3. Search for `allExcludeIds` — should appear in the `consumeFromLocalPool` call
4. Test: Play 3+ scenarios on leftField. Console should show:
   - First pool scenario served once
   - Second scenario is DIFFERENT (either fresh AI or a different pool entry)
   - You should NEVER see the same scenario title twice in a row
5. Check that the console shows `[BSM Pool] Exclude IDs passed:` or similar — if you added any debug logging, verify the exclude list contains the pool ID of the previously served scenario

## DO NOT change anything else — the _servedScenarioIds system, the worker code, and all other pool logic are correct. Only these 2 code changes are needed.
