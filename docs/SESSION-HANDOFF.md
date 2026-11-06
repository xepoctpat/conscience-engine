# Current handoff — 6 November 2026

The authorised rewrite now lives in content/ (15 records). Read docs/REVISION-2026-11-06.md and docs/READER-PLAN.md first. World bible and architecture have been reconciled. The August PDF remains historical. Existing chapter IDs stay stable; chapter-08b is new. No shell code or media changed. Tactical/Counselor round-1 fixes are applied; round-2 remains with the coordinator.

The checkpoint below is historical, not the current manuscript or asset inventory. Its August statements about 14 records, unwritten expansion and missing plates must not overwrite the current manifest.

---

# Session handoff — 2026-08-16 (checkpoint)

The Floodlit Archive reader is the live product. The public spine is now the 2026-08-16 Word export *The Ledger of Consequences* (prologue + 12 chapters + epilogue). The source PDF sits in `drafts/`. Next session: read this file and `AGENTS.md` first. Do not re-import or invent further story.

## Resume

```powershell
cd "C:\Users\xepoc\OneDrive\Grok\The Consicience Engine"
pwsh -File tools\ensure-serve.ps1
```

| Where | URL |
|---|---|
| Local | http://127.0.0.1:18780/ |
| Public (Grok web) | https://xepoctpat.github.io/conscience-engine/ |

Hard refresh (Ctrl+F5) after CSS/JS edits.

- Python: only `.venv\Scripts\python.exe` (`tools/bootstrap.ps1` once if missing)
- Bind: `127.0.0.1` only
- Port **18780** on purpose (Synapse/WYVRN probes 8080). `serve.py` does not log `/wyvrn/` or Chrome DevTools `/.well-known/appspecific/`
- `tools/ensure-serve.ps1` starts or reuses the preview (venv, detached). SessionStart hook: `.grok/hooks/ensure-reader-serve.json`
- Git: `https://github.com/xepoctpat/conscience-engine` (`main`). After plates or shell edits, commit and push so Pages updates.

## Two tracks (do not merge unasked)

| Track | Where | Role |
|---|---|---|
| **Reader spine** | `content/*.md` + this shell | 14 records (prologue + 01–12 + epilogue). What the public reader shows. |
| **Novel source** | `drafts/The Ledger of Consequences.pdf` (Word export) | Manuscript used for the 2026-08-16 replace. Further extracts only if asked. |

`reference/The_Conscience_Engine_Novel_Architecture.md` is still the structural canon for a later 40-chapter book. The Word file is the operator’s working manuscript. Architecture does not overwrite Word; Word does not overwrite the spine until asked.

## Operator decisions (do not reopen)

| Topic | Decision |
|---|---|
| Visuals / video | Operator makes them in **Grok Imagine web**. Agent does **not** generate unless explicitly asked. Wire only files on disk. |
| Story in the reader | Do not invent or revise `content/` unless asked |
| Full novel | Lives in Word. Do not pour it into Markdown unasked |
| Edition language | No “pre-alpha”, no version number on the reader |
| Engagement | Presence, not gamification |
| Audio beds | Opt-in **Silent / Atmosphere**. Never autoplay |
| TTS | Opt-in **Speak** + Voice list. No generated voice files |
| Missing plates | `plate: null` — no stand-ins |
| Server | Localhost `.venv`, port 18780 |
| Hosting | Public GitHub Pages from `main` |

## Done (reader)

- Cover lockup in the hero well; Space Grotesk / Exo 2 / Share Tech Mono
- Prologue + Chapters 01–12 + Epilogue from `content/*.md` via `data/chapters.json`
- Index, prev/next, hash routes; keys `I` `M` `S` arrows `[` `]`
- Atmosphere colour + CSS fields (floodwater, signal-glass, pressure-line, tideline, provenance)
- Opt-in atmosphere audio; ducks while Speak is on
- Speak: Natural/Neural English preferred; Voice list remembered; Shift-click stops
- Scroll place restored per record (**Continue the record**)
- Phone masthead: Floodlit, then Silent / Speak / Voice / Index
- Print: cover + record close; chrome hidden
- GitHub Pages live for Grok-web review
- Skills: `/ce-reader` `/ce-record` `/floodlit-plate`

## Done (spine text)

Spine replaced from the Word-export PDF. Headings match the manifest. No `:::hint` / `:::reveal`. Chapter 04 is *The Audit of Reality* (no plate). The leftover civic-square still is wired to Chapter 08 *Public Release*, not to 04.

## Plates on disk

| File | Wired |
|---|---|
| `assets/hero/conscience-engine-hero-archive.jpg` | Cover |
| `assets/plates/plate-01-flood-within-tolerance.jpg` | Chapter 01 |
| `assets/plates/plate-02-useful-shape-of-ruin.jpg` | Chapter 02 |
| `assets/plates/plate-04-ledger-opens.jpg` | Chapter 08 (reuse until a dedicated Public Release still exists) |

Operator will replace some or all of these from Imagine web. Next still: **03** (`plate-03-terms-of-existence.jpg`). Do not commission the old shutdown-confrontation prompt as Chapter 08.

Audio in `assets/audio/`: `floodwater`, `signalglass`, `pressureline`, `tideline`, `ambient`.

## Known nits (not bugs unless felt again)

- Speak voice is OS/Edge, not a narrator
- Phone cover now stacks the hero above the lockup; check if that still feels tight
- SessionStart hook needs the folder trusted (`/hooks-trust`)
- Word/PDF manuscript is in `drafts/The Ledger of Consequences.pdf`

## Next (operator chooses)

**A — Shell** only if something is felt in use.

**B — Reader text** only if they name a passage in `content/`. Not “paste the novel in.”

**C — Visuals** when Imagine files land in `assets/`. Wire with `/floodlit-plate`.

**D — Novel** they keep writing in Word. When they drop the `.docx` here or ask to extract a chapter, use `/ce-record` on that named piece only.

Future plan: `docs/READER-PLAN.md`.

## Keys / store

| Key | Action |
|---|---|
| `I` | Index |
| `M` | Atmosphere |
| `S` | Speak / pause / resume |
| Shift+S or Shift-click Speak | Stop speech |
| Arrows `[` `]` | Previous / next record |

`localStorage` key `ce.reader.v1`: `chapterId`, `positions`, `audioEnabled`, `voiceName`.
