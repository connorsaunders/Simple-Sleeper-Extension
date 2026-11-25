# Handoff: Sleeper new UI support (Nov 2026)

Sleeper redesigned the league pages (new UI lives under `/beta/leagues/...`).
Accounts can switch back with **⋯ → Back to Classic Fantasy**, and Sleeper then
redirects `/beta/...` to the classic `/leagues/...` pages. The extension supports
**both** and picks the right code per page.

## Build / reload

```
node build.js        # writes dist/bundle.js (no npm install needed)
```
Then `chrome://extensions` → reload "Sleeper.com Matchup Extension" → refresh Sleeper.
(`webpack.config.js` / `notes/cmd.txt` are the old build; there is no package.json.)

## Layout of the code

| File | Purpose |
|---|---|
| `src/content-script.js` | MutationObserver (batched per animation frame). If `.player-section` exists → Classic path, else new-UI path. |
| `classic/*` | Original pre-redesign code, unchanged (restored from git). Classic heatmap, "Winning/Losing by", score resize. |
| `utils/sleeper-dom.js` | All new-UI DOM lookups. Anchors on meaning, not Tailwind classes: "proj." labels inside the **Starters** `<section>`; the `Open Sleeperzone` button sits between the two team scores. |
| `utils/add-heat-map.js` | New-UI heatmap + per-player +/- (inserted between score and "proj." line). |
| `elems/score-difference.js` | New-UI "Winning/Losing by" box under the score card; tints card halves with an edge→center fade (`EDGE`/`CENTER` alphas) and hides Sleeper's two blurred corner glows. |
| `elems/league-median.js` | "Current League Median" + "Projected League Median" box under Winning/Losing by — both UIs. |
| `utils/text-styles.js` | Label font (Google Sans Flex 500) vs number font (Google Sans Flex Wide 900, wdth 140), like Sleeper's "48% win". |
| `elems/projected-median.js` | Old classic League-tab median scraper (has uncommitted-era expandable table work). **Not imported anymore.** |

## League median data

1. Fetch new-UI League tab HTML `/beta/leagues/{id}/leagues?week=N`:
   - Current = Sleeper's `League Median: <!-- -->X` element (projected before kickoff, actual after).
   - Projected = median of every team's visible "proj." value (12 teams).
2. If that request is redirected (account on Classic) → compute from public API:
   `api.sleeper.app/v1/league/{id}/matchups/{week}` (actual points) and
   `api.sleeper.app/projections/nfl/{season}/{week}` scored with the league's
   `scoring_settings` (matches Sleeper's proj exactly).
- Week: `?week=N` (new UI) → selected `Wk. N` (Classic; don't match "Week N", the hidden
  dropdown options) → current NFL week from `/v1/state/nfl`.
- Cached per league+week; current week refreshes every 60s.

Verified values (league 1347755795344809984): Wk 11 → 103.10 / 122.73, Wk 12 → 124.14 / 124.14.

## Status

- Verified live in Claude's built-in browser (by injecting the bundle) on both UIs,
  Weeks 11 and 12, including week switching.
- **Not yet verified in real Chrome** with the extension reloaded.
- Classic UI: median box uses classic plain styling; new fonts only on new UI.

## Ideas / open items

- Tint the play-by-play strip at the bottom of the new-UI score card?
- Heatmap toggle button (`addHeatmapToggleButton`) exists but is not wired up (was already commented out).
- Live game-day check (scores changing during games) hasn't been observed yet.
