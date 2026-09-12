---
name: ce-record
description: >
  Edit or add Conscience Engine chapter Markdown and keep data/chapters.json
  in sync. Use when revising prologue/chapter text, fixing a heading, adding
  a record, or the user says chapter file, content/, rewrite this scene,
  or /ce-record. Do not use for CSS, plates, or reader chrome.
---

# Conscience Engine records

Read `AGENTS.md`. Canon for world and plot lives in:

- `reference/The_Conscience_Engine_World_Bible.md`
- `reference/The_Conscience_Engine_Novel_Architecture.md`

Do not restate those documents here.

## Hard limit

Do not invent story, dialogue, or lore. If the operator did not ask for new prose, stop.

When they do ask to write or revise, stay inside the existing voice: civic, precise, dryly moral, no cyberpunk ornament.

## File shape

- Path: `content/prologue-00.md` or `content/chapter-NN.md`
- First line is the heading:

```markdown
# Prologue: Title
# Chapter 01 — Title
```

- Blank line, then body paragraphs.
- Italics with `*single asterisks*`.
- Civic/system speech as its own ALL-CAPS paragraph (renders as the teal bulletin).
- SIR issued speech as a `:::sir` block, sentence case, same bulletin register. The archive and the machine share one visual voice.
- Named declarations as a lone `**bold line**`.
- Do not add YAML front matter.

## After any heading or file change

1. Open `data/chapters.json`.
2. Match `id`, `file`, `label`, `title`, `order`, `accession`.
3. Leave `plate` `null` unless that image exists under `assets/plates/`.
4. Set `atmosphere` from the JSON `atmospheres` keys already defined. Do not invent a new weather name here.

## New records

Only when asked. Insert in `order`. Do not renumber existing files to make a gap. Prefer `chapter-13.md` over rewriting 01–12.

## Out of scope

Reader CSS/JS → `/ce-reader`.  
Plates → `/floodlit-plate`.
