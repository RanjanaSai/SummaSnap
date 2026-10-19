import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentInputError, extractTxtChapters } from '../services/extractDocumentText.js';

test('extracts chapter headings and source text from UTF-8 TXT', () => {
  const text = '\uFEFFChapter 1: First Steps\r\nA first idea.\r\n\r\nChapter 2: Next Steps\nA second idea.';

  assert.deepEqual(extractTxtChapters(Buffer.from(text)), [
    { title: 'Chapter 1: First Steps', text: 'A first idea.' },
    { title: 'Chapter 2: Next Steps', text: 'A second idea.' },
  ]);
});

test('rejects empty and unstructured files with actionable input errors', () => {
  assert.throws(() => extractTxtChapters(Buffer.alloc(0)), (error) => {
    assert.ok(error instanceof DocumentInputError);
    assert.equal(error.code, 'EMPTY_DOCUMENT');
    return true;
  });

  assert.throws(() => extractTxtChapters(Buffer.from('Just some notes without chapter headings.')), (error) => {
    assert.ok(error instanceof DocumentInputError);
    assert.equal(error.code, 'NO_CHAPTERS');
    return true;
  });
});

test('rejects invalid UTF-8 and overlong text', () => {
  assert.throws(() => extractTxtChapters(Buffer.from([0xc3, 0x28])), (error) => error.code === 'UNREADABLE_DOCUMENT');

  const overlong = `Chapter 1: Long\n${'a'.repeat(50001)}`;
  assert.throws(() => extractTxtChapters(Buffer.from(overlong)), (error) => error.code === 'DOCUMENT_TOO_LONG');
});
