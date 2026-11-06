# The Conscience Engine

A compact civic science-fiction narrative in the Floodlit Archive reader. `content/` is the published text; the static shell presents it.

**Read:** https://xepoctpat.github.io/conscience-engine/

## Current manuscript

The authorised 6 November 2026 rewrite revises the August spine: improved dialogue rhythms, retrospective archive-note asides, a split release/Old Quay sequence, dramatised crisis and hearing, and costs that remain after the Charter. Anika and Amina/Nia are separate identity threads. The world bible and architecture now describe this edition rather than treating the proposed forty-chapter novel as already written.

Fifteen records: prologue, Chapters 01–08, Chapter 08B (*Old Quay*), Chapters 09–12, epilogue. Existing hash URLs remain unchanged; the new record is `#chapter-08b`. This is a compact narrative, not the former 105,000–120,000-word target. The historical Word/PDF export in `drafts/` has not been rewritten or synchronised.

See [revision checkpoint](docs/REVISION-2026-11-06.md) for counts, scope, checks and round-1 and final round-2 changes responding to Tactical and Counselor. Voice differentiation remains an improvement, not a closed finding; critic acceptance is not claimed.

## Reader

Static HTML/CSS/JavaScript, chapter plates, five opt-in atmosphere beds and browser Speak/Voice controls. No required build or account. Archive annotations use existing `:::archive-note` asides; numbered/backlinked footnotes are not implemented.

Portraits are **not a reader feature**. Files in `assets/characters/` remain production references, unwired and not authoritative for the revised Amina age. No new media was generated. Chapter 08B intentionally has no plate. No shell CSS/JavaScript changes were needed for this rewrite.

GitHub Pages serves the repository root from `main`. Source publishing triggers GitHub's Pages build; verify the published chapter files as well as the shell.

## Read locally

Browsers will not fetch chapters from a double-clicked `index.html`. Use the project virtualenv and localhost-only server:

```powershell
pwsh -File tools\bootstrap.ps1
pwsh -File tools\serve.ps1
```

Open http://127.0.0.1:18780/. `serve.ps1` uses `.venv` Python and binds `127.0.0.1` only. Do not use global Python or an all-interface server.

## Layout

- `content/` — published Markdown records
- `data/chapters.json` — order, labels, stable IDs, atmosphere and media paths
- `index.html`, `css/`, `js/` — static reader
- `assets/` — existing hero, plates, opt-in audio and unused character references
- `reference/` — current world bible and architecture; historical visual guide/prompts
- `docs/READER-PLAN.md` — current work and deferred scope
- `docs/SESSION-HANDOFF.md` — current handoff followed by the historical checkpoint
- `AGENTS.md` — editing and local-preview rules

Revise story only when asked. Do not import historical drafts, generate media or wire speculative assets without instruction.
