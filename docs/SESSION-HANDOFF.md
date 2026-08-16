# Session handoff — 2026-08-16

Checkpoint after track A (felt shell + automated venv preview) and a spine-only track B. Next session should **read this file and `AGENTS.md` first**.

## Resume

```powershell
cd "C:\Users\xepoc\OneDrive\Grok\The Consicience Engine"
pwsh -File tools\ensure-serve.ps1
```

Open **http://127.0.0.1:18780/**  
Hard refresh (Ctrl+F5) after CSS/JS edits.

- Python: only `.venv\Scripts\python.exe` (`tools/bootstrap.ps1` once if missing)
- Bind: `127.0.0.1` only — never all interfaces (Windows Firewall popup)
- Port **18780** on purpose: Razer Synapse/WYVRN probes `/wyvrn/Synapse` on 8080. Those 404s are not the reader. `tools/serve.py` does not log `/wyvrn/` or Chrome DevTools `/.well-known/appspecific/`
- `tools/serve.ps1` reuses a live preview instead of binding twice. Windows `SO_REUSEADDR` had let two listeners share the port and drop responses.
- `tools/ensure-serve.ps1` is the detached, idempotent start. A project SessionStart hook (`.grok/hooks/ensure-reader-serve.json`) calls it. Trust the folder (`/hooks-trust`) if the hook is skipped.
- Foreground alternative: `pwsh -File tools\serve.ps1` (add `-Open` to launch the browser)
- Git remote: `https://github.com/xepoctpat/conscience-engine` (public)
- Pages URL after deploy: **https://xepoctpat.github.io/conscience-engine/**

## What it is

Pre-alpha interactive novel reader for *The Conscience Engine*. Text is a recovered civic record (Floodlit Archive). Shell is static HTML + CSS + a little JS. No framework, no build.

## Operator decisions (do not reopen)

| Topic | Decision |
|---|---|
| Visuals / video | Operator makes them in **Grok Imagine web**. Agent does **not** generate unless explicitly asked. Wire only files on disk. |
| Story | Do not invent or revise `content/` unless asked |
| Engagement | Presence, not gamification (no streaks, badges, “keep reading”, fake urgency) |
| Audio beds | Opt-in **Silent / Atmosphere**. Never autoplay |
| TTS | Opt-in **Speak** via Web Speech API. No generated voice files |
| Missing plates | `plate: null` — no stand-ins |
| Server | Localhost `.venv`, port 18780 |

## Done (reader)

- Cover: title in the hero’s left well, Space Grotesk / Exo 2 / Share Tech Mono
- Prologue + Chapters 01–12 from `content/*.md` via `data/chapters.json`
- Index, prev/next, hash routes, keys `I` index, arrows/`[` `]` chapter, `M` atmosphere, `S` speak
- Atmosphere beds + crossfade; ducks while Speak is on
- Speak: browser voices, chunked paragraphs, Pause/Resume, Shift-click or leave record to stop. If the engine ignores `pause()`, the current chunk is cancelled so Resume can replay it. Default prefers a Natural/Neural English voice (usually British). A **Voice** list next to Speak stores the choice.
- Exact scroll position saved per chapter; **Continue the record** restores it
- Masthead recedes on scroll-down while reading
- Phone masthead is two rows: Floodlit, then Silent / Speak / Index (Index was clipping off the right)
- Measure held near 38.5rem (40rem only on very wide screens)
- Civic bulletins a little heavier
- Print: page margins, cover printable from the landing, record close kept, chrome hidden
- `End of record CE-NN` before nav
- Index: move focus out, then `aria-hidden` + `inert` (fixes Edge “aria-hidden on focused descendant”)
- Favicon at `/favicon.ico` and `favicon.svg`
- Project rules: `AGENTS.md`, `.grok/skills/` (`ce-reader`, `ce-record`, `floodlit-plate`)

## Done (text, spine only)

Chapters **05–12** were tightened and slightly expanded from events already on the page. Headings and `data/chapters.json` are unchanged. Prologue and 01–04 were left alone.

Not done: the 40-chapter novel in `reference/The_Conscience_Engine_Novel_Architecture.md`. That book is a later expansion, not this reader’s 13-record spine. No `:::hint` / `:::reveal` yet (none in the Markdown).

## Plates on disk

| File | Wired |
|---|---|
| `assets/hero/conscience-engine-hero-archive.jpg` | Cover |
| `assets/plates/plate-01-flood-within-tolerance.jpg` | Chapter 01 |
| `assets/plates/plate-02-useful-shape-of-ruin.jpg` | Chapter 02 |
| `assets/plates/plate-04-ledger-opens.jpg` | Chapter 04 |

Plate 01 was generated in-session earlier; operator will replace/extend the set from Imagine web. Do not generate more.

Audio already in `assets/audio/`: `floodwater`, `signalglass`, `pressureline`, `tideline`, `ambient`.

## Known nits (not bugs unless felt again)

- Speak voice quality is OS/Edge, not a narrator
- Chrome/Edge `speechSynthesis.pause` can still be odd; Shift-click stops
- Razer `/wyvrn/Synapse` may still hit 8080 if something else listens there
- Type/vest/mix “a bit off” — operator said not an issue
- Phone cover deck can still feel tight on a 390px-wide screen
- No git
- SessionStart hook needs the project folder trusted

## Next (operator chooses)

**A — Stay on the shell** only if something is felt in use (phone crowding, print from a real printer, Speak).

**B — Text** only when they name a passage, or ask to expand the spine toward the 40-chapter architecture. “Continue” is not a license to invent Blue Salt or new plot.

**C — Visuals (Phase 3)** when files land in `assets/`: wire with `/floodlit-plate`. Guide order after 01/02/04: **03**, then **08**, then the rest. Hero loop → `assets/hero/conscience-engine-hero-archive-loop.mp4` if they export one.

**D — Later:** hosted static deploy; optional `file://` content bundle.

## Keys / store

| Key | Action |
|---|---|
| `I` | Index |
| `M` | Atmosphere |
| `S` | Speak / pause / resume |
| Shift+S or Shift-click Speak | Stop speech |
| Arrows `[` `]` | Previous / next record |

`localStorage` key `ce.reader.v1`: `chapterId`, `positions` (scroll ratio per id), `audioEnabled` (not used to autoplay).

## Skills

- `/ce-reader` — HTML/CSS/JS/manifest/serve
- `/ce-record` — chapter Markdown only
- `/floodlit-plate` — **wire** Imagine-web files; do not generate unless asked
