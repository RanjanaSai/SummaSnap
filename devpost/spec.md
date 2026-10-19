---
doc: spec
status: approved
---

# AI-Powered Chapter Study Notes — Technical Spec

## How This Works, In Plain Language

The app has two separately organized parts in one project: a React client that runs in the browser, and a Node/Express server that handles document processing and talks to Groq. Render runs the combined app at one public URL.

The student chooses a text-based PDF or `.txt` file in the browser and enters an optional chapter or topic instruction. The browser packages both in a file-upload request; Multer is the Express helper that unpacks the file and instruction for the server. It keeps the upload in temporary memory, not on disk. The server reads the text, asks Groq to return chapter notes in a predictable structured format, and sends those notes back to React. The browser displays them and downloads a named Markdown (`.md`) copy when the student saves.

The app itself does not keep uploaded files or summaries after the request or browser session. There is no MongoDB, account system, or saved library in this proof of concept. The tradeoff is that students must download a summary they want to keep, and Groq receives the extracted document text to generate it.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. **Open the app:** Render serves the built React client from the same Express service that provides the API.
2. **Choose a document and optional focus:** React holds the selected file and instruction in browser memory. Supported inputs are text-based PDF and plain-text `.txt`.
3. **Request a summary:** React sends the file and instruction to `POST /api/summarize`. Express validates the file type and size, extracts text, and checks for recognizable chapter sections.
4. **Generate notes:** Express sends the extracted text and instruction to Groq's Chat Completions API. Groq returns structured chapter results; the server validates the response shape before returning it to the browser.
5. **Review and save:** React displays each chapter's main points, formulas, and theorems when present. The student names and downloads a `.md` file. The browser handles the download; the server does not save a copy.

```text
Local PDF / TXT + optional instruction
                 |
                 v
        React client in browser
                 |
        POST /api/summarize
                 v
     Express server on Render
       |                 |
  extract/check       Groq API
       |                 |
       +---- structured notes
                 |
                 v
        React results view
                 |
           download .md
```

## Stack

- **JavaScript** — the learner's established language from their React and BookMyShow-inspired project.
- **React** — the learner has built with it before; it powers the browser interface.
- **Vite** — builds and serves the React client during development. The compiled client files are served by Express in production. [Vite guide](https://vite.dev/guide/).
- **Node.js** — local development works with Node 22.12 or newer; the project pins Node 24 for Render using `.node-version`. Node 24 is an LTS release. [Node.js release schedule](https://nodejs.org/en/about/previous-releases).
- **Express 5** — handles the summary API and serves the built React files. [Express static files](https://expressjs.com/en/starter/static-files/).
- **Multer** — an Express helper that unpacks a browser file-upload request; configure memory storage and a size limit so uploads are temporary and are not written to the service's filesystem. [Multer documentation](https://expressjs.com/en/resources/middleware/multer/).
- **PDF.js (`pdfjs-dist`)** — extracts selectable text from PDFs; plain-text `.txt` files are decoded as UTF-8. This does not perform OCR or guarantee exact equation layout. [PDF.js getting started](https://mozilla.github.io/pdf.js/getting_started/).
- **Groq TypeScript/JavaScript SDK (`groq-sdk`)** — makes the server-side model request using the learner-selected Groq provider. [Groq SDK](https://github.com/groq/groq-typescript).
- **Zod** — validates the structured summary returned by the model before the server sends it to the client. [Zod documentation](https://zod.dev/).

Use compatible current stable package versions and commit the generated lockfile during `5-build`; verify the PDF.js Node API and Render's Node 24 support when scaffolding. Keep the Node version pinned consistently in the project and deployment.

## Where It Runs and How Someone Tries It

- **Local development:** Requires Node.js 22.12 or newer and a Groq API key. Keep the key in a local `.env` file, ignored by the existing `.gitignore`; never put a real key in source code, `.env.example`, the browser, or chat.
- **Local start:** From the repository root, run `npm install`. Start the Express server with `npm run dev:server` in one terminal and the Vite client with `npm run dev:client` in a second terminal. Open `http://localhost:5173`. Vite proxies `/api` calls to the local Express server.
- **Render deployment:** Deploy one Render Web Service from the public GitHub repository. Build with `npm install && npm run build`; start with `npm start`. Express must listen on `process.env.PORT` and `0.0.0.0`, serve the client build, and expose a simple health-check route. Configure `GROQ_API_KEY` as a Render secret/environment variable.
- **Free-plan behavior:** Render's free web service can spin down after 15 minutes idle and take about a minute to wake. Its filesystem is ephemeral. The app's no-server-storage design avoids relying on that filesystem, but the cold start can delay a demo. [Render web services](https://render.com/docs/web-services), [Render free services](https://render.com/docs/free).
- **Submission:** Deployment is required by the learner. The hackathon also requires a short demo video and a public GitHub repository; deployment does not replace either. Record the deployed app, including one successful summary and its Markdown download.

## Look and Feel

Implement a light, attractive study workspace with a restrained two-to-four-color palette. Exact colors remain open, as the learner requested. Use clear typography and chapter headings so the three kinds of study material are easy to scan. Do not invent a branded visual reference or dark AI-chat aesthetic.

## Components

### React Study Workspace

Owns the document picker, instruction field, summarize action, processing/error messages, and result display. Keeps the selected `File`, instruction, and current result in browser memory only.

Implements `prd.md > Screens and Layout`, `Document Summarization`, and `States and Boundaries`.

### Summary API

Express `POST /api/summarize` accepts one PDF or TXT upload and an optional instruction, validates the request, invokes text extraction and summarization, then returns validated chapter data as JSON. Use in-memory upload handling and a bounded request size; do not write uploaded files to disk.

Implements `prd.md > Document Summarization` and `States and Boundaries`.

### Document Text Extraction

Uses PDF.js to extract text from text-based PDFs and UTF-8 decoding for TXT. Detect explicit chapter headings and divide the text into chapter sections. If there is no readable text or no recognizable chapter structure, return a clear error rather than inventing divisions or summaries. Formula text is best-effort; preserve it when extraction allows, without promising exact equation formatting.

Implements `prd.md > Document Summarization` and `States and Boundaries`.

### Groq Chapter Summarizer

Runs only on the Express server. Sends the extracted document text and optional focus instruction to Groq, asking for only source-supported chapter information: chapter title, main points, formulas, and theorems. A topic instruction may select relevant chapters even if the student did not name a chapter. Empty sections are allowed when a source chapter contains none of that material.

Use the `openai/gpt-oss-20b` model if it is available to the learner's Groq account and supports the required structured-output mode. Validate the response with a Zod schema before returning it. Do not substitute a fabricated or sample summary when Groq is unavailable.

Implements `prd.md > Document Summarization`.

### Markdown Download

Formats the displayed chapter results as a readable `.md` document and starts a browser download using the name entered by the student. The download is not retained by the app.

Implements `prd.md > Saving a Summary`.

### Express Static App and Render Runtime

Serves the production React build and API from the same Node process and same origin. Reads the Render-assigned port, binds to `0.0.0.0`, and provides a health-check route. No MongoDB or other database is used.

Implements `prd.md > Core Journey`, `Screens and Layout`, and `Saving a Summary`.

## Data Model

- **Selected source file:** Browser `File` object; held in React memory until cleared or the page is closed. Sent once to Express as a multipart upload. Express holds the bytes in memory for that request only; it does not write the upload to disk.
- **Instruction:** Browser string held in React memory and sent with the upload. It is not saved after the page is closed.
- **Extracted chapter text:** Temporary server-side value created from PDF.js or TXT parsing. Sent to Groq for summarization, then discarded when the request completes.
- **Summary result:** JSON object returned by Express with a list of chapters; each chapter has a title and arrays for main points, formulas, and theorems. Held in browser memory until the page is closed or another summary replaces it.
- **Saved copy:** Markdown generated in the browser and downloaded to the student's chosen location. The app cannot reopen or delete that file in this POC.
- **Secrets:** `GROQ_API_KEY` exists only in the local server environment or Render's secret configuration, never in client code or API responses.

No data survives a page reload or server restart except a Markdown file the student explicitly downloads.

## File Structure

```text
project/
├── client/
│   ├── index.html
│   ├── vite.config.js            # Development API proxy
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # Study workspace and interaction states
│       ├── api.js                 # Calls the Express summary endpoint
│       ├── components/
│       │   ├── DocumentForm.jsx   # File selection, focus, summarize action
│       │   ├── SummaryResults.jsx
│       │   └── SaveMarkdownButton.jsx
│       └── styles.css
├── server/
│   ├── app.js                     # Express app factory and request error handling
│   ├── index.js                   # Server startup entry point
│   ├── routes/
│   │   └── summarize.js           # Upload validation and summary endpoint
│   ├── services/
│   │   ├── extractDocumentText.js # PDF/TXT extraction and chapter detection
│   │   └── groqSummarizer.js      # Groq request and structured result validation
│   ├── schemas/
│   │   └── summary.js             # Chapter result schema
│   └── test/                      # Node's built-in test runner
│       ├── extractDocumentText.test.js
│       ├── groqSummarizer.test.js
│       └── summarizeRoute.test.js
├── devpost/                       # Learning plan documents
├── .env.example                   # Variable names only; no real credentials
├── .gitignore
├── package.json                   # Workspace scripts and dependencies
├── package-lock.json
└── README.md                      # Local run and Render setup instructions
```

## External Services and Dependencies

### Groq Chat Completions API

- **Call:** `POST https://api.groq.com/openai/v1/chat/completions`.
- **Authentication:** `Authorization: Bearer [key from GROQ_API_KEY]`, supplied by the server environment.
- **Request:** JSON with `model: "openai/gpt-oss-20b"`, system/user messages containing the summarization rules, extracted chapter text, and optional focus instruction, plus `response_format: { type: "json_schema", json_schema: ... }` in strict mode. The schema is an object with a required `chapters` array; each chapter has required string `title` and string-array fields `main_points`, `formulas`, and `theorems`, with no additional properties.
- **Response:** Chat completion JSON; read `choices[0].message.content` as the structured summary and validate it before responding to the browser.
- **References:** [Groq text chat](https://console.groq.com/docs/text-chat), [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs), [Groq rate limits](https://console.groq.com/docs/rate-limits), [Groq models](https://console.groq.com/docs/models).
- **Limits and cost:** The learner chose Groq's free tier. Current exact rate limits are account-specific; check the account Limits page during setup. A `429` or unavailable model should produce an actionable retry message, not a fake success. Model availability on the learner's account is not verified yet.
- **Privacy:** Extracted text is sent to Groq for processing. Do not claim the provider does not retain it; students should not upload confidential material.

### Render Web Service

- **Role:** Hosts the React build and Express API at one public URL.
- **Configuration:** Build command `npm install && npm run build`; start command `npm start`; set `GROQ_API_KEY` as a secret; bind to `process.env.PORT` on `0.0.0.0`.
- **References:** [Render web services](https://render.com/docs/web-services), [Render free services](https://render.com/docs/free).
- **Tradeoff:** The selected free plan can sleep and has ephemeral disk storage. Neither is used for persistent app data, but waking may take about a minute.

## Important Failure Modes

- **Unreadable, scanned, empty, or unstructured file** → Explain that readable chapter sections were not found; do not fabricate a result; let the student select another text-based PDF or TXT file.
- **Groq unavailable, rate-limited, or model not enabled** → Show a clear retry/configuration message; preserve no success-shaped fallback.
- **Oversized upload or model input** → Reject it before or during processing with a useful size/length message; the exact safe limit must be checked against sample documents and the selected model during `5-build`.
- **PDF equation extraction is imperfect** → Show the extracted best-effort formula text; do not promise exact visual equation layout.
- **Render free service is asleep** → The first request may wait while the service wakes; show the available loading state and allow retry if the request fails.

## What Was Simplified and Why

- A single Express web service serves React and the API rather than deploying the client and server separately — one Render deployment and one URL are simpler for this demo; source code remains separated under `client/` and `server/`.
- Groq receives extracted text rather than the original PDF — this avoids adding a separate file-understanding workflow and keeps supported inputs limited to text-based PDFs and TXT.
- Uploaded files and generated results stay temporary — the learner agreed to defer MongoDB, accounts, and a per-user library; students download a Markdown copy instead.
- PDF formula handling is best-effort, and scanned PDFs are not supported — OCR and exact equation reconstruction add disproportionate complexity to the proof of concept.

## Decisions and Open Issues

- **Learner choice:** JavaScript, React, Node, and Express, building on their prior project experience.
- **Learner choice:** Render deployment is required; use a free web service despite cold starts and temporary server storage.
- **Learner choice:** Keep client and server in separate source folders but deploy them together as one Render service.
- **Learner choice:** Use Groq's free tier; the extracted document text is sent to Groq, and the app itself keeps no server-side copy.
- **Learner-approved recommendation:** Start with `openai/gpt-oss-20b` if available to their account; use Groq strict structured output so the response follows the chapter schema.
- **Learner choice:** Accept text-based PDF and `.txt` inputs; defer Word and scanned-PDF support.
- **Learner choice:** Download summaries as Markdown now; revisit PDF/Word export later.
- **Clarified:** PDF export is technically possible but is deferred; the first version downloads Markdown only.
- **Clarified:** The learner is comfortable opening downloaded Markdown files outside the app; an in-app saved-summary list is not needed for the POC.
- **Learner choice:** Best-effort formula extraction is acceptable; exact formula rendering is not promised.
- **Useful clarification:** The learner asked whether the client and server can remain separate in a combined deployment. The distinction is now explicit: separate folders and responsibilities, one deployed service.
- **Useful clarification:** The learner was unsure which file types to include. We distinguished source-file formats from export formats; they accepted PDF/TXT input and Markdown output, with Word/scanned input and PDF/Word export deferred.
- **Useful clarification:** The learner asked what Multer does and whether summaries can be saved locally as PDFs. Explained that Multer receives uploaded input files, while PDF output needs a separate generation step; the learner confirmed Markdown-only output for the first demo.
- **Can wait until `5-build`:** Verify the selected model is available on the learner's Groq free account, confirm its current limits, and verify the structured-output request against the current SDK/API.
- **Can wait until `5-build`:** Test PDF.js text extraction with a representative text-based study PDF, especially chapter boundaries and formulas.
- **Can wait until `5-build`:** Set and test a safe upload/text-length limit for the chosen Groq model and Render free service.
- **Can wait until `5-build`:** Pin compatible package versions and confirm Render's Node 24 runtime behavior.
