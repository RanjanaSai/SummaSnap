import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DocumentInputError, extractPdfChapters, extractTxtChapters } from '../services/extractDocumentText.js';
import { createTextPdf } from './helpers/createTextPdf.js';

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

test('extracts chapter headings and text from a text-based PDF', async () => {
  const pdf = createTextPdf([
    'Chapter 1: Fractions',
    'Fractions represent parts of a whole.',
    'Chapter 2: Equations',
    'An equation states that two expressions are equal.',
  ]);

  assert.deepEqual(await extractPdfChapters(pdf), [
    { title: 'Chapter 1: Fractions', text: 'Fractions represent parts of a whole.' },
    { title: 'Chapter 2: Equations', text: 'An equation states that two expressions are equal.' },
  ]);
});

test('sample PDF contains the expected chapter-organized study text', async () => {
  const pdf = await readFile(new URL('../../client/public/sample-chapters.pdf', import.meta.url));

  assert.deepEqual(await extractPdfChapters(pdf), [
    {
      title: 'Chapter 1: Fractions',
      text: [
        'Fractions describe equal parts of a whole.',
        'The numerator counts chosen parts; the denominator counts total equal parts.',
        'Formula: a/b + c/d = (ad + bc)/bd',
        'Theorem: Fractions with the same denominator can be added by adding their numerators.',
      ].join('\n'),
    },
    {
      title: 'Chapter 2: Linear Equations',
      text: [
        'A linear equation has the form ax + b = c.',
        'Use inverse operations to isolate x.',
        'Formula: x = (c - b)/a, when a is not zero.',
        'Theorem: Adding the same value to both sides preserves equality.',
      ].join('\n'),
    },
  ]);
});

test('rejects malformed and unstructured PDFs without inventing chapters', async () => {
  await assert.rejects(
    extractPdfChapters(Buffer.from('not a PDF')),
    (error) => error instanceof DocumentInputError && error.code === 'UNREADABLE_DOCUMENT',
  );

  await assert.rejects(
    extractPdfChapters(createTextPdf(['Notes without a chapter heading.'])),
    (error) => error instanceof DocumentInputError && error.code === 'NO_CHAPTERS',
  );
});
