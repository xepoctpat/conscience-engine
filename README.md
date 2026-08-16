# The Conscience Engine

Interactive novel. Floodlit Archive reader. Text in `content/` is the record; the HTML shell only presents it.

**Public reader (GitHub Pages):** https://xepoctpat.github.io/conscience-engine/

The published site is public. Local preview stays on this machine.

## Read it locally

Browsers will not load the chapter files from a double-clicked `index.html`. Use the project virtualenv, then serve localhost only:

```powershell
pwsh -File tools\bootstrap.ps1
pwsh -File tools\serve.ps1
```

Then open http://127.0.0.1:18780/

`serve.ps1` runs `.venv` Python and binds `127.0.0.1` only. That should not trigger a Windows Firewall prompt for private/public networks. Do not use global `python` or `py -m http.server`.

## Layout

- `content/` — Prologue + Chapters 01–12 + Epilogue (the published spine)
- `data/chapters.json` — order and metadata
- `index.html`, `css/`, `js/` — reader
- `assets/` — hero, plates, audio
- `reference/` — visual guide, prompts, architecture, world bible
- `docs/READER-PLAN.md` — reader vs novel, what comes next
- `docs/SESSION-HANDOFF.md` — last checkpoint
- `AGENTS.md` — rules for Grok in this folder

The full novel is written in a separate Word document. It is not this folder’s `content/` until a chapter is extracted on purpose.

## Do not

Invent missing story. Do not generate plates, video, or audio unless asked — those come from Grok Imagine web into `assets/`. Do not start a server that listens on every network interface. Do not run project Python outside `.venv`.
