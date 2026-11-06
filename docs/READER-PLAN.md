# Reader and novel plan

## Current checkpoint — 6 November 2026

The authorised full-spine revision is in `content/`, with fifteen manifest records. It supersedes the August text, not the historical PDF file. The public reader remains a static site deployed from `main` to https://xepoctpat.github.io/conscience-engine/.

See `REVISION-2026-11-06.md` for scope and evidence. `reference/The_Conscience_Engine_World_Bible.md` and `reference/The_Conscience_Engine_Novel_Architecture.md` describe the revised compact edition and distinguish future expansion.

## Done in this revision

- Character-rhythm pass and removal of named joke glosses and weight-beat punchlines.
- Archive-note asides through existing renderer support; no numbered-footnote code.
- Chapter 08 split into stable `chapter-08` and new `chapter-08b`; all older paths retained.
- On-page Anika refusal, legal restoration, Amina/Nia provenance and bounded relationship offer.
- Crisis, command refusal, shutdown, testimony, Charter bargaining and insurer challenge enacted as scenes.
- Blue Salt, Saito, Jessa, Front, basin delivery, tenancy, allocation and node-audit threads connected to the compact story.
- Portraits excluded from the current reader pitch. Existing assets retained as references, no media generation.

## Next review

The coordinating agent will arrange two critique–revise rounds with Tactical and Counselor. They have not been claimed as completed here. Review priorities:

1. Does the identity inquiry feel earned at this length, and does Amina remain more than a device for Elias?
2. Do the one-day suspension, human emergency duties and Charter's legal route withstand scrutiny?
3. Do the dialogue voices differ without becoming repetitive tics?
4. Does the twenty-year archival frame justify the disclosed private material without overstating knowledge?
5. Do the new scenes need more breathing room? This is still a compact edition, not a completed long novel.

## Reader / Engineering

No CSS/JavaScript change is required by this pass. Existing hash navigation uses manifest IDs. The new record has a title-only H1 so its manifest label `Chapter 08B` is retained by the current parser. Its plate is `null`.

Optional future Engineering work, not part of acceptance: true numbered/backlinked footnotes; alphanumeric labels parsed directly from headings; an accessible portrait dossier if commissioned. Existing archive-note asides are not described as numbered footnotes. No portrait UI is promised.

New scenes may no longer match every existing decorative plate. Historical visual prompts map a different long-form plan; do not regenerate assets or substitute images automatically. A visual/editorial review is deferred.

## Long form and production constraints

The former 105,000–120,000-word/five-act proposal is future scope. A border riot, deeper faction plots and broader abundance-economy testing remain expansion candidates. The old Word/PDF is historical; a new export must be deliberate, not an automatic import over `content/`.

- Keep story records separate from presentation.
- Generate no plates, portraits, audio or video without an explicit request.
- Wire only existing, checked assets; absent plates remain `null`.
- Preserve stable chapter IDs. Update the manifest with any new record.
- Keep the shell framework-free and audio opt-in.
- Local preview uses the project virtualenv and binds `127.0.0.1:18780` only.
