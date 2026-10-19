---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Generate chapter study notes from a TXT document**
  Becomes usable: A running React/Express app accepts a plain-text document with chapter headings and an optional chapter/topic instruction, sends it through the selected Groq model, and displays structured chapter notes with main points, formulas, and theorems.
  Why now: This puts the unique chapter-by-chapter study-notes kernel in the first usable slice and checks the selected Groq model and strict structured response before investing in more document formats.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Document Summarization`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Stack`, `spec.md > Components > React Study Workspace`, `spec.md > Components > Summary API`, `spec.md > Components > Groq Chapter Summarizer`, `spec.md > Data Model`, `spec.md > File Structure`
  Build: Bootstrap the separate `client/` and `server/` code in the root project with Vite, React, Express, and the agreed scripts. Build the first workspace and `/api/summarize` vertical path for TXT input: bounded in-memory upload, chapter-heading detection, optional focus instruction, Groq request using `openai/gpt-oss-20b` when available, structured-result validation, and chapter-wise display. Keep the Groq key server-side in local `.env`; never use a fake summary as a fallback.
  Verify (mechanical): Run `npm test` for chapter detection, response-schema validation, and the API's success/error behavior; run `npm run build`; start both local dev processes, submit a multi-chapter TXT fixture, and confirm the visible chapter output comes from the configured Groq request. If the account/model is unavailable, report that explicitly rather than marking the live-provider check passed.
  Learner check: Open the local app, submit the included multi-chapter TXT sample with and without a chapter/topic instruction, and check that the displayed chapters and study sections match what you expected.
  Commit: `Add TXT chapter summarization flow`

- [ ] **2. Summarize text-based PDFs through the same study flow**
  Becomes usable: Students can use either supported input format—TXT or a text-based PDF—and receive the same chapter-organized study notes; unreadable or unstructured files get a clear recovery message.
  Why now: The chapter-summary path is already working on TXT, so this adds the important study-document format while isolating PDF extraction and its known formula/chapter-boundary risks.
  PRD ref: `prd.md > Document Summarization`, `prd.md > States and Boundaries`, `prd.md > What We're Building`
  Spec ref: `spec.md > Components > Document Text Extraction`, `spec.md > Components > Summary API`, `spec.md > Important Failure Modes`
  Build: Add PDF.js text extraction for selectable-text PDFs; route extracted PDF text through the same chapter and Groq flow. Validate supported extensions, MIME/type, empty content, and a bounded upload size. Show an actionable message for scanned, unreadable, or unstructured files; preserve best-effort equation text without promising exact formatting.
  Verify (mechanical): Run `npm test` with a representative text-based PDF and TXT fixture, confirming chapter boundaries and rejection of empty/unstructured input; run `npm run build`; upload the PDF through the local UI and confirm the response is grouped by chapters.
  Learner check: Upload a text-based study PDF and a plain-text file; confirm both produce chapter sections, then try an unsupported or unstructured file and check the recovery message.
  Commit: `Add PDF study-document support`

- [ ] **3. Download named Markdown notes and prepare the Render production app**
  Becomes usable: Students can name and download the generated notes as a readable `.md` file, and the complete client/API app builds and runs from one production Express service ready for the agreed Render deployment.
  Why now: Saving completes the PRD journey; production serving and health checks make the same working app deployable without adding a separate frontend service or any persistent server storage.
  PRD ref: `prd.md > The Core Journey` (step 4), `prd.md > Saving a Summary`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Markdown Download`, `spec.md > Components > Express Static App and Render Runtime`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > External Services and Dependencies`
  Build: Add a name field and browser-side Markdown download with chapter headings and distinct main-points/formulas/theorems sections. Add production scripts so Express serves the Vite build and API from one origin, binds to Render's port on `0.0.0.0`, and provides a health-check route. Document Render's build/start commands and secret configuration; do not deploy or publish the repository before the `6-ship` publication step.
  Verify (mechanical): Run `npm test` and `npm run build`; start with `npm start`, verify the health route succeeds, complete a local summary flow, download the named `.md` file, and inspect its headings and content. Confirm no upload or result is written to server disk and no secret is present in the client build.
  Learner check: Generate a summary, enter a filename, download it, and open the `.md` file outside the app. Confirm its chapter sections are readable and the chosen name appears in the downloaded filename.
  Commit: `Add Markdown export and production serving`

## Hands-on Checkpoints

- [x] Early usable behavior explored — tried the bundled TXT sample; the learner confirmed it worked and clarified that text-based PDF support is needed for their own study material, which is the next slice.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3, before revisions and ship preparation.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Not started.
Route and stops: Not started.
Edit outcome: Not applicable yet.
Reflection: Not offered yet.
Activity mode: Not started.

## Revisions
