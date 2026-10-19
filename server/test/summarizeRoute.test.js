import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';
import { createTextPdf } from './helpers/createTextPdf.js';

const expectedSummary = {
  chapters: [{
    title: 'Chapter 1: Fractions',
    main_points: ['Fractions represent parts of a whole.'],
    formulas: [],
    theorems: [],
  }],
};

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('accepts a TXT upload and returns validated summary data', async () => {
  const received = [];
  const app = createApp({
    summarize: async (chapters, instruction) => {
      received.push({ chapters, instruction });
      return expectedSummary;
    },
  });

  await withServer(app, async (baseUrl) => {
    const form = new FormData();
    form.append('document', new Blob(['Chapter 1: Fractions\nFractions represent parts of a whole.']), 'lesson.txt');
    form.append('instruction', 'Focus on fractions');

    const response = await fetch(`${baseUrl}/api/summarize`, { method: 'POST', body: form });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), expectedSummary);
  });

  assert.equal(received[0].instruction, 'Focus on fractions');
  assert.equal(received[0].chapters[0].title, 'Chapter 1: Fractions');
});

test('accepts a text-based PDF upload and passes extracted chapters to summarization', async () => {
  const received = [];
  const app = createApp({
    summarize: async (chapters, instruction) => {
      received.push({ chapters, instruction });
      return expectedSummary;
    },
  });

  await withServer(app, async (baseUrl) => {
    const form = new FormData();
    form.append('document', new Blob([
      createTextPdf(['Chapter 1: Fractions', 'Fractions represent parts of a whole.']),
    ], { type: 'application/pdf' }), 'lesson.pdf');
    form.append('instruction', 'Focus on fractions');

    const response = await fetch(`${baseUrl}/api/summarize`, { method: 'POST', body: form });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), expectedSummary);
  });

  assert.equal(received[0].instruction, 'Focus on fractions');
  assert.deepEqual(received[0].chapters, [
    { title: 'Chapter 1: Fractions', text: 'Fractions represent parts of a whole.' },
  ]);
});

test('returns a clear client error for unstructured input', async () => {
  const app = createApp({ summarize: async () => expectedSummary });

  await withServer(app, async (baseUrl) => {
    const form = new FormData();
    form.append('document', new Blob(['Text without a chapter heading']), 'lesson.txt');

    const response = await fetch(`${baseUrl}/api/summarize`, { method: 'POST', body: form });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'NO_CHAPTERS');
  });
});

test('rejects unsupported upload types', async () => {
  const app = createApp({ summarize: async () => expectedSummary });

  await withServer(app, async (baseUrl) => {
    const form = new FormData();
    form.append('document', new Blob(['not a supported format']), 'lesson.docx');

    const response = await fetch(`${baseUrl}/api/summarize`, { method: 'POST', body: form });
    assert.equal(response.status, 415);
    const result = await response.json();
    assert.equal(result.error.code, 'UNSUPPORTED_FILE_TYPE');
    assert.match(result.error.message, /\.pdf/);
  });
});

test('returns a clear configuration error when no Groq key is set', async () => {
  const previousKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    const app = createApp();
    await withServer(app, async (baseUrl) => {
      const form = new FormData();
      form.append('document', new Blob(['Chapter 1: Fractions\nFractions represent parts of a whole.']), 'lesson.txt');

      const response = await fetch(`${baseUrl}/api/summarize`, { method: 'POST', body: form });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).error.code, 'GROQ_NOT_CONFIGURED');
    });
  } finally {
    if (previousKey !== undefined) process.env.GROQ_API_KEY = previousKey;
  }
});
