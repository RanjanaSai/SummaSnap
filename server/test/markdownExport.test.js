import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMarkdown,
  createMarkdownFilename,
  createPlainText,
  createTextFilename,
} from '../../client/src/markdown.js';

test('creates readable chapter Markdown with distinct study sections', () => {
  const markdown = createMarkdown('Algebra Review', [{
    title: 'Chapter 1: Equations',
    main_points: ['Solve by isolating the variable.'],
    formulas: ['ax + b = c'],
    theorems: [],
  }]);

  assert.equal(markdown, [
    '# Algebra Review',
    '',
    '## Chapter 1: Equations',
    '',
    '### Main points',
    '',
    '- Solve by isolating the variable.',
    '',
    '### Formulas',
    '',
    '- ax + b = c',
    '',
    '### Theorems',
    '',
    '- None identified.',
    '',
  ].join('\n'));
});

test('creates a safe Markdown filename from the chosen notes name', () => {
  assert.equal(createMarkdownFilename('Algebra / Week 2'), 'Algebra-Week-2.md');
  assert.equal(createMarkdownFilename('..'), 'study-notes.md');
  assert.equal(createMarkdownFilename('CON'), 'CON-notes.md');
});

test('creates readable plain text with distinct chapter study sections', () => {
  const text = createPlainText('Algebra Review', [{
    title: 'Chapter 1: Equations',
    main_points: ['Solve by isolating the variable.'],
    formulas: ['ax + b = c'],
    theorems: [],
  }]);

  assert.equal(text, [
    'Algebra Review',
    '==============',
    '',
    'Chapter 1: Equations',
    '====================',
    '',
    'Main points',
    '-----------',
    '- Solve by isolating the variable.',
    '',
    'Formulas',
    '--------',
    '- ax + b = c',
    '',
    'Theorems',
    '--------',
    '- None identified.',
    '',
  ].join('\n'));
});

test('creates a safe text filename from the chosen notes name', () => {
  assert.equal(createTextFilename('Algebra / Week 2'), 'Algebra-Week-2.txt');
  assert.equal(createTextFilename('..'), 'study-notes.txt');
  assert.equal(createTextFilename('CON'), 'CON-notes.txt');
});
