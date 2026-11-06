# The Conscience Engine — agent rules

Interactive novel + Floodlit Archive reader. Static HTML shell.

**Current phase:** reader is live (local + GitHub Pages). The published text is the authorised 2026-11-06 revision in `content/` (15 records, including Chapter 08B). The August source PDF in `drafts/` is historical and has not been synchronised. See `docs/REVISION-2026-11-06.md`, `docs/SESSION-HANDOFF.md` and `docs/READER-PLAN.md`. Do not re-import the manuscript or start plate/video work unless the operator asks.

## Hard limits

- Do not invent story text, dialogue, or plot. Revise `content/` only when asked. Do not pour a later Word/PDF draft into the spine unasked.
- Do not invent missing plates, portraits, audio, or video. Hook only files that exist.
- Do not generate image, visual, or video assets unless the operator explicitly asks. They prepare those in Grok Imagine web and drop them into `assets/`. The agent wires paths in `data/chapters.json`.
- Do not move `content/*.md`. Presentation stays out of the records.
- No framework. No build step for basic reading.
- Do not start a server that binds all interfaces. Local preview binds `127.0.0.1` only.
- Do not use global Python. Create `.venv` with `tools/bootstrap.ps1` (system interpreter only for that one command). After that, only `.venv\Scripts\python.exe`.

## Layout

| Path | Role |
|---|---|
| `content/` | Chapter Markdown (source of truth for the text) |
| `data/chapters.json` | Order, accession, atmosphere, plate, audio |
| `index.html` `css/reader.css` `js/reader.js` | Reader shell |
| `assets/` | Hero, plates, audio, character refs |
| `reference/` | Canon (do not paraphrase as sole truth) |
| `tools/bootstrap.ps1` | Create `.venv` (system Python once) |
| `tools/serve.ps1` | Localhost-only static server via `.venv` |
| `requirements.txt` | Pins for anything added to `.venv` |
| `docs/READER-PLAN.md` | Phased work after the MVP |
| `docs/SESSION-HANDOFF.md` | Last checkpoint for the next session |

## Canon (read, do not rewrite as the original)

- Visual: `reference/Conscience_Engine_Visual_Production_Guide.md`
- Prompts: `reference/Conscience_Engine_Grok_Prompts.md`
- Architecture: `reference/The_Conscience_Engine_Novel_Architecture.md`
- World: `reference/The_Conscience_Engine_World_Bible.md`

## Reader

- All visual decisions live in CSS custom properties on `:root` and `[data-atmosphere]`.
- Atmosphere names and media paths live in `data/chapters.json`.
- Future immersive layers listen for `ce:chapterchange` and `data-atmosphere` / `data-audio`. Do not autoplay audio.
- Titles come from each file’s `#` heading. If a heading changes, update the matching `title` / `label` in the manifest. Chapter 08B uses title-only `# Old Quay`; its alphanumeric label comes from the manifest, so no reader parser change is needed.
- Missing `plate` stays `null`. A 404 plate must not leave a broken figure.

## Local preview

```powershell
pwsh -File tools\bootstrap.ps1
pwsh -File tools\serve.ps1
```

Opens `http://127.0.0.1:18780/` only (non-standard port so local RGB/Synapse probes on 8080 miss it). `serve.ps1` refuses to run without `.venv`. If a preview is already up, it reuses that listener instead of binding twice. Agents start it with `pwsh -File tools\ensure-serve.ps1` (venv only, detached, localhost). Do not call `py` / global `python -m http.server`.

## Skills

Use the project skills in `.grok/skills/` when the task matches:

- `/ce-reader` — shell, CSS tokens, manifest, navigation
- `/ce-record` — chapter files and headings
- `/floodlit-plate` — wire Imagine-web files (do not generate unless asked)

## Tone of interface copy

Archive / accession language only (Floodlit Archive, record). Not app chrome. Not new fiction.
