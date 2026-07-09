---
mode: plan
task: Reimagine interactive museum exhibits
created_at: "2026-07-09T15:26:30-04:00"
complexity: complex
---

# Plan: Reimagine interactive museum exhibits

## Goal

- Replace both lightweight canvas mini-games with two polished, responsive art games that each sustain approximately 5–10 minutes of first-time play and feel native to the site's high-end museum identity.

## Scope

- In: replace Orbital with the scientific light-routing puzzle **Lumen Cabinet**.
- In: replace Courier with the tactile restoration puzzle **Palimpsest Archive**.
- In: create shared responsive canvas, input, progress, sound, accessibility, and exhibit-shell utilities.
- In: add curated progression, onboarding, saved progress, replay scoring, responsive bento layouts, new navigation labels, and stable E2E state hooks.
- In: support pointer, touch, keyboard, light/dark themes, and reduced motion.
- Out: backend accounts, remote leaderboards, deployment, homepage/About redesign, or required external game assets.

## Assumptions / Dependencies

- The existing React 18, TypeScript, Vite, Tailwind, Framer Motion, and Canvas 2D stack remains in place.
- The established paper, ink, forest, oxide, serif, sans, and mono design tokens remain the visual foundation.
- Game artwork will be generated from canvas geometry and code so GitHub Pages remains self-contained.
- Sound will be optional, generative through Web Audio, and muted by default.
- Progress will use versioned localStorage records and degrade safely when storage is unavailable.
- No push or deployment is authorized; implementation remains local unless requested separately.

## Phases

1. **Shared exhibit foundation** — responsive/DPR-safe canvas measurement, pausable animation loop, unified pointer/touch/keyboard input, versioned persistence, optional sound, accessible HUD, and museum exhibit shell.
2. **Lumen Cabinet** — five hand-authored optical plates using movable lenses, rotatable mirrors, apertures, filters, prisms, split/recombined beams, undo/reset/hints, completion art, and saved plate progression.
3. **Palimpsest Archive** — four hand-authored works using translucent fragments, raking-light inspection, translation/rotation/depth ordering, registration clues, restorative scoring, completion animation, and saved work progression.
4. **Museum integration** — replace the old sections, copy, components, navigation, and anchors with asymmetric bento compositions that remain first-class on mobile.
5. **Verification and polish** — Playwright acceptance coverage, build checks, responsive/theme/reduced-motion passes, console cleanup, performance tuning, and regression review.

## Tests & Verification

- TypeScript and production bundle -> `npm run build`.
- Shared engine and level invariants -> `npm test` using focused Node-compatible tests where practical.
- Lumen start/reset/hint/progression/persistence -> Playwright acceptance tests.
- Palimpsest start/reset/inspection/progression/persistence -> Playwright acceptance tests.
- Responsive layout -> Playwright screenshots at 1440x1000, 1024x768, 390x844, and 320x700.
- Theme and motion -> Playwright light, dark, and `prefers-reduced-motion` checks.
- Input -> pointer, touch-equivalent, and keyboard flows with visible focus and no trapped global shortcuts.
- Runtime -> complete smoke playthrough with no console errors, clipped controls, or horizontal overflow.
- Performance -> DPR capped at 2, animation paused when offscreen/hidden, and effects bounded to stable object counts.

## Issue CSV

- Path: `issues/2026-07-09_15-26-30-museum-game-exhibits.csv`
- Shares the same timestamp and slug as this plan.
- Column spec: `references/issue-csv-spec.md` from the issue-driven workflow skill.

## Acceptance Checklist

- [x] Orbital and Courier are fully removed from the rendered experience.
- [x] Lumen Cabinet contains five progressive optical plates and multiple interacting mechanics.
- [x] Palimpsest Archive contains four progressive restoration works and multiple interacting mechanics.
- [x] Each exhibit supports approximately 5–10 minutes of first-time play.
- [x] Both exhibits provide onboarding, reset, restrained hints, progress, completion, and replay affordances.
- [x] Both exhibits work with mouse, touch, and keyboard at desktop and mobile widths.
- [x] Progress survives reload and invalid persisted data fails safely.
- [x] Light, dark, and reduced-motion presentations are intentional.
- [x] No required game imagery, fonts, or audio are fetched at runtime beyond the app's existing bundled dependencies.
- [x] Build, acceptance, responsive, and regression checks pass without console errors.

## Risks / Blockers

- Five-to-ten-minute depth can inflate scope; curated plates/works and reusable engines keep complexity bounded.
- Canvas coordinate E2E can be brittle; stable DOM controls and `data-game-state` hooks provide reliable assertions.
- Layered glow and translucent fragments can be expensive on mobile; DPR, particles, and cached layers will be capped.
- Keyboard parity for spatial manipulation can become cumbersome; selected objects receive explicit nudge/rotate/depth commands and visible instructions.
- Canvas-only content can be opaque to assistive technology; each exhibit includes semantic instructions, status announcements, and DOM-based controls/progress.

## References

- `src/styles/tokens.css` — gallery day/night tokens and reduced-motion policy.
- `src/components/about/page.tsx` — current museum/bento layout language.
- `src/components/arcade/OrbitalGame.tsx` — game being replaced.
- `src/components/arcade/CourierGame.tsx` — game being replaced.
- `src/components/arcade/OrbitalSection.tsx` — section being recomposed.
- `src/components/arcade/CourierSection.tsx` — section being recomposed.
- `src/components/Navbar.tsx` — navigation labels and anchors.
- `src/components/arcade/useRafLoop.ts` — animation loop to extend or replace.

## Tools / MCP

- `functions:apply_patch` — scoped source, test, plan, and Issue CSV edits.
- `functions:exec_command` — inspection, build, test, and local preview commands.
- `playwright-cli:run-code` — responsive interaction, theme, motion, console, and screenshot verification.
- `functions:view_image` — visual review of captured screenshots.

## Rollback / Recovery

- Preserve the existing game implementation in Git history; revert the exhibit commits if recovery is needed.
- Keep new persistence keys versioned and separate from the existing `benji-orbital-best` and `benji-courier-best` keys.
- Avoid database, remote, deployment, or irreversible state changes.

## Checkpoints

- Checkpoint 1: shared exhibit foundation builds and renders independently.
- Checkpoint 2: Lumen Cabinet is playable through all five plates.
- Checkpoint 3: Palimpsest Archive is playable through all four works.
- Checkpoint 4: museum integration and responsive layouts are complete.
- Checkpoint 5: full acceptance and regression pass; no push or deployment.
