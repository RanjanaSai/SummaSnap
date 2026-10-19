import { Router } from 'express';
import multer from 'multer';
import { extractTxtChapters } from '../services/extractDocumentText.js';
import { summarizeChapters } from '../services/groqSummarizer.js';

const maxUploadBytes = 2 * 1024 * 1024;

export function createSummarizeRouter({ summarize = summarizeChapters } = {}) {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxUploadBytes,
      files: 1,
      fields: 1,
      parts: 2,
    },
    fileFilter(_request, file, callback) {
      const extensionMatches = file.originalname.toLowerCase().endsWith('.txt');
      const typeMatches = !file.mimetype || file.mimetype === 'text/plain' || file.mimetype === 'application/octet-stream';
      if (extensionMatches && typeMatches) {
        callback(null, true);
      } else {
        callback(new Error('For this first version, choose a plain-text .txt document.'));
      }
    },
  });

  router.post('/summarize', upload.single('document'), async (request, response, next) => {
    if (!request.file) {
      response.status(400).json({ error: { code: 'MISSING_DOCUMENT', message: 'Choose a .txt study document first.' } });
      return;
    }

    const rawInstruction = request.body?.instruction;
    if (rawInstruction !== undefined && typeof rawInstruction !== 'string') {
      response.status(400).json({ error: { code: 'INVALID_INSTRUCTION', message: 'Enter one focus instruction under 500 characters.' } });
      return;
    }

    const instruction = rawInstruction?.trim() ?? '';
    if (instruction.length > 500) {
      response.status(400).json({ error: { code: 'INVALID_INSTRUCTION', message: 'Keep the focus instruction under 500 characters.' } });
      return;
    }

    try {
      const chapters = extractTxtChapters(request.file.buffer);
      const result = await summarize(chapters, instruction);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
