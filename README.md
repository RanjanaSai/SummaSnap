# SummaSnap

SummaSnap turns a chapter-organized study document into notes with main points, formulas, and theorems.

## Run locally

1. Install Node.js 22.13 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add your Groq API key to `.env` on your computer. Never paste the key into source files or commit `.env`.
4. In one terminal, run `npm run dev:server`.
5. In another terminal, run `npm run dev:client`.
6. Open `http://localhost:5173` and try the sample TXT or PDF, or upload your chapter-organized `.txt` or text-based `.pdf` file.

The app accepts plain-text `.txt` files and text-based PDFs. Scanned/image-only PDFs and Word documents are not supported. Extracted document text is sent to Groq for processing; do not upload confidential documents.

Generated notes can be downloaded as either Markdown (`.md`) or plain text (`.txt`).

## Checks

Run `npm test` for the server's document, schema, and request tests. Run `npm run build` to verify the production client build.

## Deploy on Render

Create a Render Web Service from the GitHub repository with:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment variable:** `GROQ_API_KEY` (set the value in Render's Environment settings; do not add it to the repository)
- **Health check path:** `/health`

The Express service serves the built client and API from the same origin and listens on Render's `PORT`. Uploads are processed in memory and are not saved on the server. The free service may sleep while idle and take time to wake.

## Environment

- `GROQ_API_KEY` — required on the server for real summaries.
- `GROQ_MODEL` — optional; defaults to `openai/gpt-oss-20b`.
