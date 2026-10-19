import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export class DocumentInputError extends Error {
  constructor(message, code = 'INVALID_DOCUMENT') {
    super(message);
    this.name = 'DocumentInputError';
    this.code = code;
  }
}

const chapterHeading = /^\s*Chapter\s+(?:\d+|[ivxlcdm]+)(?:\s*[:.-]\s*.*|\s+.*)?\s*$/i;
const maxTextCharacters = 50000;

function splitTextIntoChapters(text) {
  if (!text.trim()) {
    throw new DocumentInputError('The selected file does not contain readable text.', 'EMPTY_DOCUMENT');
  }

  if (text.length > maxTextCharacters) {
    throw new DocumentInputError('This document is too long for the first demo. Please choose a shorter document.', 'DOCUMENT_TOO_LONG');
  }

  const chapters = [];
  let current = null;

  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (chapterHeading.test(line)) {
      if (current) chapters.push(current);
      current = { title: line.trim(), text: '' };
    } else if (current) {
      current.text += `${line}\n`;
    }
  }

  if (current) chapters.push(current);

  const readableChapters = chapters
    .map((chapter) => ({ ...chapter, text: chapter.text.trim() }))
    .filter((chapter) => chapter.text);

  if (readableChapters.length === 0) {
    throw new DocumentInputError(
      'We could not find readable content under chapter headings. Please choose a document with headings such as “Chapter 1: Introduction”.',
      'NO_CHAPTERS',
    );
  }

  return readableChapters;
}

export function extractTxtChapters(buffer) {
  if (!buffer?.length) {
    throw new DocumentInputError('The selected file is empty.', 'EMPTY_DOCUMENT');
  }

  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
  } catch {
    throw new DocumentInputError('This text file could not be read as UTF-8. Please choose another file.', 'UNREADABLE_DOCUMENT');
  }

  return splitTextIntoChapters(text);
}

export async function extractPdfChapters(buffer) {
  if (!buffer?.length) {
    throw new DocumentInputError('The selected PDF is empty.', 'EMPTY_DOCUMENT');
  }

  let loadingTask;
  try {
    loadingTask = getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const document = await loadingTask.promise;

    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      let line = '';
      const lines = [];

      for (const item of content.items) {
        if (!('str' in item)) continue;
        const text = item.str.trim();
        if (text) line += `${line ? ' ' : ''}${text}`;
        if (item.hasEOL) {
          if (line) lines.push(line);
          line = '';
        }
      }

      if (line) lines.push(line);
      pages.push(lines.join('\n'));
    }

    return splitTextIntoChapters(pages.join('\n'));
  } catch (error) {
    if (error instanceof DocumentInputError) throw error;
    throw new DocumentInputError(
      'This PDF could not be read. Choose a text-based, unprotected PDF; scanned PDFs are not supported.',
      'UNREADABLE_DOCUMENT',
    );
  } finally {
    await loadingTask?.destroy();
  }
}

export async function extractDocumentChapters(buffer, filename) {
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (extension === '.txt') return extractTxtChapters(buffer);
  if (extension === '.pdf') return extractPdfChapters(buffer);

  throw new DocumentInputError('Choose a plain-text .txt document or a text-based .pdf document.', 'UNSUPPORTED_FILE_TYPE');
}
