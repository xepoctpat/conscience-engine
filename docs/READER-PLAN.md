# Reader plan

Queue for the Floodlit Archive reader. Not a license to invent story or assets.

**Current phase:** felt shell polish and a spine-only text pass are in. Wait for the operator: more shell nits, further text, or Imagine-web files to wire. Last checkpoint: `docs/SESSION-HANDOFF.md`.

## Done

- Static shell: `index.html`, `css/reader.css`, `js/reader.js`, `data/chapters.json`
- Prologue + Chapters 01–12 load from `content/`
- Cover lockup in the hero well; Space Grotesk / Exo 2 / Share Tech Mono
- Opt-in atmosphere audio (Silent → Atmosphere; no autoplay; crossfade)
- Local preview: `.venv` + `tools/serve.ps1` on `127.0.0.1:18780` (exclusive bind; `tools/ensure-serve.ps1` reuses a live preview)
- Probe noise on `/wyvrn/` and Chrome DevTools paths is not logged
- Project rules: `AGENTS.md`, `.grok/skills/` (`ce-reader`, `ce-record`, `floodlit-plate`)
- Plates already on disk (01, 02, 04) show when listed; missing plates stay `null`

## Constraints

- Content stays in `content/*.md`
- No framework, no required build
- Local servers bind `127.0.0.1` only; Python only from `.venv`
- No new story unless asked
- Do not generate image, video, or audio assets unless asked
- No placeholder visuals

## Phase 1 — Lock the reader (current)

Shell should stay stable so later assets drop in without restructuring.

**This pass (done):**

- Cover is a single frame (colophon hidden on the landing)
- Touch-sized chrome, selection colour, skip-link target
- Chapter load/plate races ignored; index focus returns only on dismiss
- Atmosphere pauses when the tab is hidden; fade respects reduced motion
- Key `M` toggles atmosphere
- `serve.py` names a bind collision instead of a traceback
- Exact place restored per record (`Continue the record`)
- Masthead recedes while reading; returns on scroll-up
- Quiet “End of record CE-NN” before previous/next
- Opt-in **Speak** via Web Speech API (no files). Shift-click or leave the record to stop. Key: `S`

**This pass (2026-08-16):** narrower measure, stronger bulletins, phone masthead no longer wraps, print keeps the cover and the record close, Speak pause cancels a stuck chunk so Resume can replay it.

**Still in this phase if felt in use:** Speak voice quality (OS/Edge), leftover phone crowding, print from a real printer.

**Do not** add accounts, analytics, a visual gallery, or a `file://` bundle unless asked.

## Phase 2 — Text (when asked)

- Revise in `content/*.md`; sync titles in `data/chapters.json`
- Expand the spine only from `reference/The_Conscience_Engine_Novel_Architecture.md`
- Add `:::hint` / `:::reveal` in the records first; then hook behaviour if needed

## Phase 3 — Visuals (later)

Operator produces files in Grok Imagine web, then the agent wires paths (`/floodlit-plate`).

- Remaining chapter plates (guide order after 01/02/04: 03, 08, then the rest)
- Hero loop, if exported
- Character refs in `assets/characters/`
- Chapter video loops
- Spoiler-safe plate unlock, only if needed after plates exist

## Phase 4 — Later still

- Hosted static deploy
- Optional `data/content.js` for `file://` reading (generate from Markdown; do not replace the `.md` files)

## Decision log

| Decision | Choice |
|---|---|
| Current focus | Reader polish, not new visuals |
| Visuals | Operator, Imagine web; wire only |
| Server | Localhost `.venv`, port 18780 |
| file:// bundle | Deferred |
| Audio | Opt-in; never autoplay |
| Missing plates | `null`, no stand-ins |
