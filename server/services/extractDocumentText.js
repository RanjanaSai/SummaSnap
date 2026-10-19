export class DocumentInputError extends Error {
  constructor(message, code = 'INVALID_DOCUMENT') {
    super(message);
    this.name = 'DocumentInputError';
    this.code = code;
  }
}

const chapterHeading = /^\s*Chapter\s+(?:\d+|[ivxlcdm]+)(?:\s*[:.-]\s*.*|\s+.*)?\s*$/i;
const maxTextCharacters = 50000;

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
