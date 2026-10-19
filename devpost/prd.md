---
doc: prd
status: approved
---

# AI-Powered Chapter Study Notes — Product Requirements

Turn a multi-chapter study document into chapter-organized study notes for students. Builds on `scope.md > The Unique Kernel`, `The Core Loop`, and `The POC Boundary`.

## The Core Journey

1. The student opens the app and sees a workspace for choosing a study document from their computer.
2. The student selects a document. They may enter a focused instruction naming chapter numbers, chapter titles, or a topic to guide the summary. With no instruction, the app summarizes the document chapter by chapter.
3. The student starts summarization and sees the results organized by chapter, with separate sections for main points, formulas, and theorems when present.
4. The student saves the result as a locally named copy for future reference.

The journey develops `scope.md > The Core Loop` and `What "Working" Looks Like`.

## Screens and Layout

The proof of concept uses one primary workspace that moves from document selection and optional instructions to generated results. It provides:

- A local document selection control.
- A focused instruction field for chapter numbers, chapter titles, or topics.
- A summarization action.
- A chapter-organized results area.
- A save action that lets the student name the copy saved to their computer.

There is no separate blank-page note editor or in-app library of previously saved summaries in this proof of concept. Those belong to the broader product, not the approved scope.

## Look and Feel

The student wants a light, attractive interface using two to four colors. Exact colors are intentionally open for the design/build phase.

## Features and Behavior

### Document Summarization

Develops `scope.md > The Unique Kernel` and `The POC Boundary`.

- The student selects one study document from their local computer.
- The primary summarization action produces notes organized by the document's chapters.
- Each chapter's results separate main points, formulas, and theorems when the source contains them.
- With no focused instruction, the app summarizes all detected chapters.
- The instruction field lets the student focus the summary by naming chapter numbers, chapter titles, or a topic, including when a test covers a topic rather than a named chapter.
- While summarization is underway, the app indicates that it is working.
- **Acceptance criteria**
  - Given a readable multi-chapter study document, the student can start summarization and see results grouped under chapter headings.
  - Each chapter result visibly distinguishes main points, formulas, and theorems when those are present in the source.
  - Given an instruction naming chapters or a topic, the displayed result focuses on the requested material.
  - Without an instruction, results cover the document's detected chapters.

### Saving a Summary

Develops `scope.md > The Core Loop` and `What "Working" Looks Like`.

- The student can save the generated summary as a copy on their computer and provide its name.
- The student can choose a readable Markdown (`.md`) or plain-text (`.txt`) download.
- The saved copy is for the student's future reference.
- The app does not maintain an account-based or in-app library in this proof of concept. Students manage saved copies on their computer.
- **Acceptance criteria**
  - The student can provide a name when saving a generated summary.
  - The student can download the named summary in Markdown or plain-text format.
  - After starting a download, the app identifies the format and filename.

## States and Boundaries

- **First use / no document selected** — Show the document selection control and do not offer a generated result until a document is selected.
- **Processing** — Indicate that the document is being summarized.
- **Successful result** — Show the chapter-organized notes and the option to save a named copy.
- **Unreadable or unstructured document** — Explain that readable chapter sections could not be found, do not show a fabricated summary, and let the student choose another document.
- **Saved result** — Confirm the chosen format and filename are downloading. Reopening or deleting saved copies is handled outside the app in this proof of concept.

## Product Decisions

- Students are the first audience; professionals remain a possible later audience (`scope.md > Who It's For`, `Later`).
- Local document selection is enough to demonstrate the idea; cloud browsing is deferred (`scope.md > The POC Boundary`, `Explicitly Cut`).
- The defining output is organized by chapter and surfaces main points, formulas, and theorems (`scope.md > The Unique Kernel`).
- Students can focus the output by chapter number, title, or topic. The learner said this helps when a test covers only some chapters or a topic.
- The first demo stays smaller: no accounts or per-user server-backed library. The learner wants to revisit those later.
- The exact app name is not chosen; this PRD uses a descriptive working title.

## What We're Building

- A student-facing workspace for selecting one local study document.
- Optional focused instructions by chapter number, chapter title, or topic.
- Chapter-by-chapter summaries with distinct main-points, formulas, and theorems sections when the source contains them.
- A way to save a generated summary as a named Markdown or plain-text copy on the student's computer.
- Clear first-use, processing, successful-result, and unusable-document states.

## Deferred From the POC

- **Writing notes or reports from scratch** — a separate workflow from summarizing a study document.
- **Professional reports and a professional-first experience** — the first demo is for students.
- **Cloud document browsing** — local document selection is sufficient for the proof of concept.
- **Accounts and a per-user saved library** — the learner wants the first demo smaller and to revisit this later.
- **Browsing and deleting saved summaries inside the app** — requires the deferred in-app library; students can manage downloaded copies on their computer for now.
- **General-purpose back-and-forth AI chat** — the first demo uses a focused instruction field for chapter or topic selection.

## Possible Later Enhancements

Add accounts and a personal library for reopening and deleting saved summaries. Explore cloud document sources, notes and reports authored from scratch, and support for professionals.

## Non-Goals

- Creating a complete notes-and-reports product; the proof of concept demonstrates the chapter-summary idea.
- Sharing or collaborating on summaries; neither is needed to demonstrate the core journey.
- Keeping a server-side or in-app history of a student's summaries in the first demo.

## Open Questions

- **Can wait for `4-spec`:** Which document types will the first version accept, and what saved-copy format best fits the demo?
- **Can wait for design/build:** Which exact two to four colors should be used?
- **Can wait for later product planning:** What account and personal-library experience should the expanded product provide?
