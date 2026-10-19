import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeChapters } from '../services/groqSummarizer.js';

const sourceChapters = [{ title: 'Chapter 1: Fractions', text: 'Fractions represent parts of a whole.' }];
const validSummary = {
  chapters: [{
    title: 'Chapter 1: Fractions',
    main_points: ['Fractions represent parts of a whole.'],
    formulas: [],
    theorems: [],
  }],
};

function fakeClient(content) {
  let request;
  return {
    getRequest: () => request,
    chat: {
      completions: {
        create: async (value) => {
          request = value;
          return { choices: [{ message: { content: JSON.stringify(content) } }] };
        },
      },
    },
  };
}

test('requests strict structured output and validates the chapter response', async () => {
  const client = fakeClient(validSummary);
  const result = await summarizeChapters(sourceChapters, 'Focus on chapter 1', client);

  assert.deepEqual(result, validSummary);
  assert.equal(client.getRequest().model, 'openai/gpt-oss-20b');
  assert.equal(client.getRequest().response_format.json_schema.strict, true);
  assert.match(client.getRequest().messages[1].content, /Focus on chapter 1/);
});

test('rejects a model response that does not match the expected schema', async () => {
  const client = fakeClient({ chapters: [{ title: 'Chapter 1', main_points: [] }] });

  await assert.rejects(
    summarizeChapters(sourceChapters, '', client),
    (error) => error.code === 'INVALID_MODEL_RESPONSE' && error.status === 502,
  );
});

test('reports missing server configuration without making a provider request', async () => {
  const previousKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    await assert.rejects(
      summarizeChapters(sourceChapters),
      (error) => error.code === 'GROQ_NOT_CONFIGURED' && error.status === 503,
    );
  } finally {
    if (previousKey !== undefined) process.env.GROQ_API_KEY = previousKey;
  }
});
