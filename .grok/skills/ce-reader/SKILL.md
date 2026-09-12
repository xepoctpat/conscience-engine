---
name: ce-reader
description: >
  Edit the Floodlit Archive static reader for The Conscience Engine
  (index.html, css/reader.css, js/reader.js, data/chapters.json).
  Use when changing typography, colors, layout, navigation, atmosphere
  hooks, the chapter manifest, or local preview. Use when the user says
  reader, CSS tokens, chapters.json, serve the reader, or /ce-reader.
---

# Conscience Engine reader

Read `AGENTS.md` first. Visual canon stays in `reference/Conscience_Engine_Visual_Production_Guide.md`. Do not copy palettes into this skill.

## Scope

Touch only the shell and the manifest unless the operator also asked for text or plates.

| Change | File |
|---|---|
| Type, color, space, measure, reveal look | `css/reader.css` (`:root` and `[data-atmosphere]`) |
| Load, parse, route, nav, state | `js/reader.js` |
| Landmarks, cover chrome | `index.html` |
| Order, atmosphere, plate, audio paths | `data/chapters.json` |
| Local preview | `tools/serve.ps1` |

Do not move `content/*.md`. Do not add a bundler or framework.

## Manifest

- `id` matches the hash (`#chapter-04`) and the Markdown stem.
- `file` is a repo-relative path under `content/`.
- `plate` is a real path or `null`. Never point at a file that is not on disk.
- `atmosphere` must be a key already listed under `atmospheres` in the same JSON file.
- After a heading change in Markdown, update that chapter’s `title` and `label`.

## Atmosphere

Set weather through `document.body.dataset.atmosphere`. CSS already maps the names. New names need both a JSON `atmospheres` entry and a `[data-atmosphere="…"]` block.

Dispatch `ce:chapterchange` with `{ id, atmosphere, audio, plate }`. Do not play audio from the reader unless the operator asked for an opt-in control. Never autoplay.

## Markdown the parser already understands

- `#` title (stripped into the record header)
- `##`–`####`
- `*em*` `**strong**`
- Hard breaks (`two spaces` + newline)
- Standalone ALL-CAPS lines → civic bulletin
- A paragraph that is only `*…*` or a `:::sir` fence → civic bulletin (SIR voice)
- A paragraph that is only `**…**` → emphasis block
- `>` → `.archive-note`
- `:::hint` `:::reveal` `:::archive-note` `:::bulletin` `:::sir` fences

Extend the parser only when the records need a new mark.

## Preview

```powershell
pwsh -File tools\bootstrap.ps1
pwsh -File tools\serve.ps1
pwsh -File tools\ensure-serve.ps1
```

Use `.venv` only. Bind `127.0.0.1` only. `ensure-serve.ps1` starts a detached preview if one is not already answering; never start a second listener on the same port. Do not invoke global `python` / `py -m http.server`.

## Done when

- Existing chapters still open in order
- Missing plates stay hidden
- Tokens still control the look
- No new fiction landed in the shell
