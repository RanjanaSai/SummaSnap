import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { createSummarizeRouter } from './routes/summarize.js';
import { DocumentInputError } from './services/extractDocumentText.js';
import { SummarizerError } from './services/groqSummarizer.js';

const clientBuildPath = fileURLToPath(new URL('../client/dist/', import.meta.url));

export function createApp(options = {}) {
  const app = express();

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.use('/api', createSummarizeRouter(options));
  app.use(express.static(clientBuildPath));
  app.get(/.*/, (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next();
      return;
    }
    response.sendFile(fileURLToPath(new URL('../client/dist/index.html', import.meta.url)));
  });
  app.use((error, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      response.status(413).json({ error: { code: error.code, message: 'The file is too large. Please choose a file smaller than 2 MB.' } });
      return;
    }

    if (error instanceof multer.MulterError) {
      response.status(400).json({ error: { code: error.code, message: 'Choose one .txt or text-based .pdf document.' } });
      return;
    }

    if (error instanceof DocumentInputError) {
      response.status(400).json({ error: { code: error.code, message: error.message } });
      return;
    }

    if (error instanceof SummarizerError) {
      response.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }

    if (error.message === 'Choose a plain-text .txt document or a text-based .pdf document.') {
      response.status(415).json({ error: { code: 'UNSUPPORTED_FILE_TYPE', message: error.message } });
      return;
    }

    console.error('Unexpected request failure:', error.name || 'UnknownError');
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong while processing the document. Please try again.' } });
  });

  return app;
}
