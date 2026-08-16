# Reader and novel plan

Queue after the 2026-08-16 checkpoint. Not a license to invent story or assets. Last restore point: `docs/SESSION-HANDOFF.md`.

**Current phase:** reader is public and stable. Operator writes the **full novel in a separate Word document**. The 13-record spine in `content/` stays the reader until they name a chapter to extract.

## Two documents, two jobs

| Document | Path | Job |
|---|---|---|
| Floodlit Archive spine | `content/*.md` | What the reader publishes (prologue + 01–12) |
| Novel manuscript | Operator’s Word file (not in `content/`) | Full book. Keep it there. |
| Architecture | `reference/The_Conscience_Engine_Novel_Architecture.md` | Structure for a later long form. Do not treat as the manuscript. |

When the Word file should live in this repo, drop it **outside** `content/` (for example `drafts/`). Presentation stays out of the records. Do not auto-split Word into Markdown.

## Done

- Static reader: `index.html`, `css/reader.css`, `js/reader.js`, `data/chapters.json`
- Spine loads; cover lockup; atmosphere fields + opt-in audio; Speak + Voice
- Local `.venv` preview on `127.0.0.1:18780`
- Public Pages: https://xepoctpat.github.io/conscience-engine/
- Git: `https://github.com/xepoctpat/conscience-engine`
- Plates 01, 02, 04 + hero still on disk
- Edition chrome is archive language only (no version stamp)

## Constraints

- Do not invent story. Revise `content/` only when asked, and only the named passage
- Do not generate image, video, or audio unless asked
- Operator makes stills and motion in Grok Imagine web; agent wires paths
- Missing plates stay `null`
- No framework, no required build
- Local servers bind `127.0.0.1` only

## Next work (when they choose)

### 1. Visuals (most useful for the live reader)

Imagine web → drop into `assets/` → `/floodlit-plate`.

1. Chapter **03**, then **08**
2. Replace 01 / 02 / 04 / hero if better frames exist
3. Remaining plates
4. Optional hero loop: `assets/hero/conscience-engine-hero-archive-loop.mp4`
5. Character refs → `assets/characters/`
6. Chapter video only after the still exists

Then commit and push so Pages matches.

### 2. Novel (Word, separate)

Write and revise the book in Word. Do not expand the 13 Markdown files “to match” the novel unless they ask.

Later, if they want a chapter in the reader:

1. They name the record (or drop the `.docx` and point at a section)
2. Extract only that piece into `content/`
3. Sync `title` / `label` in `data/chapters.json`
4. Do not add `:::hint` / `:::reveal` until the Markdown uses those marks

### 3. Shell

Only if something is felt: phone cover type, print from a real printer, Speak.

Do not add accounts, analytics, a gallery, or a `file://` bundle unless asked.

## Decision log

| Decision | Choice |
|---|---|
| Reader vs novel | Spine in Markdown; full book in Word until extract is asked |
| Visuals | Operator, Imagine web; wire only |
| Hosting | GitHub Pages from `main` |
| Server | Localhost `.venv`, port 18780 |
| Audio | Opt-in; never autoplay |
| Missing plates | `null`, no stand-ins |
| Version chrome | None |
