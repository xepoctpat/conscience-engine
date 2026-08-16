---
name: floodlit-plate
description: >
  Wire Floodlit Archive hero, plate, character, and video files the operator
  prepared in Grok Imagine web. Use when a new file appears in assets/, or the
  user says plate, hero, wire this image, drop-in visual, or /floodlit-plate.
  Do not generate images unless the operator explicitly asks to.
---

# Floodlit plates

Read `AGENTS.md`. The operator makes stills and motion in **Grok Imagine web**. This skill only receives those files and points the reader at them.

## Do not

- Call `image_gen` / `image_edit` unless the operator asked you to generate in this session
- Invent a filename or a `plate` path for a file that is not on disk
- Autoplay video or audio

## Canon (do not duplicate)

Names, 16:9, no-text, no-humanoid-SIR, and palettes live in:

- `reference/Conscience_Engine_Visual_Production_Guide.md`
- `reference/Conscience_Engine_Grok_Prompts.md`

## Destinations

| Kind | Path |
|---|---|
| Hero still | `assets/hero/conscience-engine-hero-archive.jpg` |
| Hero loop | `assets/hero/conscience-engine-hero-archive-loop.mp4` |
| Plates | `assets/plates/plate-NN-<slug>.jpg` (guide delivery table) |
| Character refs | `assets/characters/` |
| Audio | `assets/audio/` |

If the operator’s export uses another name, copy or rename it to the canon name, then wire.

## Wire

1. Confirm the file exists under `assets/`.
2. Set the matching chapter’s `plate` (or leave `null`) in `data/chapters.json`.
3. For motion later, store the path on the chapter or atmosphere object; do not play it until asked.
4. Confirm a missing file still hides the figure.

On disk now: plates **01, 02, 04** and the hero still.
