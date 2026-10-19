import express from 'express';
import multer from 'multer';
import { createSummarizeRouter } from './routes/summarize.js';
import { DocumentInputError } from './services/extractDocumentText.js';
import { SummarizerError } from './services/groqSummarizer.js';

export function createApp(options = {}) {
  const app = express();

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.use('/api', createSummarizeRouter(options));
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
      response.status(400).json({ error: { code: error.code, message: 'Choose one .txt document to summarize.' } });
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

    if (error.message === 'For this first version, choose a plain-text .txt document.') {
      response.status(415).json({ error: { code: 'UNSUPPORTED_FILE_TYPE', message: error.message } });
      return;
    }

    console.error('Unexpected request failure:', error.name || 'UnknownError');
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong while processing the document. Please try again.' } });
  });

  return app;
}
