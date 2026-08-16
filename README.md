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

- `content/` — Prologue + Chapters 01–12 (Markdown)
- `data/chapters.json` — order and metadata
- `index.html`, `css/`, `js/` — reader
- `assets/` — hero, plates, audio
- `reference/` — visual guide, prompts, architecture, world bible
- `docs/READER-PLAN.md` — what comes after the MVP
- `docs/SESSION-HANDOFF.md` — last session checkpoint
- `AGENTS.md` — rules for Grok in this folder

## Do not

Invent missing story. Do not generate plates, video, or audio unless asked — those come from Grok Imagine web into `assets/`. Do not start a server that listens on every network interface. Do not run project Python outside `.venv`.
