Original prompt: Build and iterate a playable web game in this workspace, validating changes with a Playwright loop. I want an oh&S game, so an hazard hunt on a construction site. Anything to do with safety.

- Set up a new standalone game entry at `games/hazard-hunt/`.
- Plan: top-down construction-site hazard hunt with canvas rendering, keyboard movement, space-to-secure interaction, deterministic `advanceTime(ms)`, and `render_game_to_text()`.
- Integration target: add the game to `mini-games.html` so it is reachable from the existing mini-games menu.
- First Playwright run showed the game rendering correctly, but the inspect input was consumed twice so hazards could not be secured and risk climbed to 100%.
- Adjusted gameplay loop: explicit inspect press handling, slower hazard exposure, passive risk recovery, slightly larger secure radius, and reset overlay cleanup.
- Added direct click-to-flag hazard support on the canvas so deterministic Playwright runs can validate full hazard clearance without relying on a brittle movement-only route.
- Validation completed:
- `output/web-game/hazard-hunt-run4/` confirms full clear via Playwright client (`mode: won`, `hazardsFound: 5`), and the screenshot shows all hazards marked safe.
- Supplemental Playwright checks confirmed keyboard movement, keyboard inspect for the first hazard, pause/resume, win flow, and restart reset.
- Timeout fail state was confirmed by advancing virtual time to 91 seconds and observing `mode: lost`.
- Fullscreen toggle key was exercised in headless Chromium, but `document.fullscreenElement` stayed false there, so fullscreen should be rechecked in a headed browser if that behavior matters.
