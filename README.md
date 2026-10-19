# Chapter Study Notes

A proof of concept that turns a chapter-organized text document into study notes with main points, formulas, and theorems.

## Run locally

1. Install Node.js 22.12 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add your Groq API key to `.env` on your computer. Never paste the key into source files or commit `.env`.
4. In one terminal, run `npm run dev:server`.
5. In another terminal, run `npm run dev:client`.
6. Open `http://localhost:5173` and upload the sample chapter document or a chapter-organized `.txt` file.

The first build slice supports plain-text `.txt` input. Text-based PDFs are added in a later slice. Extracted document text is sent to Groq for processing; do not upload confidential documents.

## Checks

Run `npm test` for the server's document, schema, and request tests. Run `npm run build` to verify the production client build.

## Environment

- `GROQ_API_KEY` — required on the server for real summaries.
- `GROQ_MODEL` — optional; defaults to `openai/gpt-oss-20b`.
