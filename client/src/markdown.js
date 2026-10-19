export function createMarkdown(name, chapters) {
  const sections = chapters.map((chapter) => [
    `## ${chapter.title}`,
    '',
    '### Main points',
    '',
    ...markdownList(chapter.main_points),
    '',
    '### Formulas',
    '',
    ...markdownList(chapter.formulas),
    '',
    '### Theorems',
    '',
    ...markdownList(chapter.theorems),
  ].join('\n'));

  return `# ${name.trim()}\n\n${sections.join('\n\n')}\n`;
}

export function createMarkdownFilename(name) {
  return createFilename(name, '.md');
}

export function createPlainText(name, chapters) {
  const title = name.trim();
  const sections = chapters.map((chapter) => [
    chapter.title,
    '='.repeat(chapter.title.length),
    '',
    formatTextSection('Main points', chapter.main_points),
    '',
    formatTextSection('Formulas', chapter.formulas),
    '',
    formatTextSection('Theorems', chapter.theorems),
  ].join('\n'));

  return `${title}\n${'='.repeat(title.length)}\n\n${sections.join('\n\n')}\n`;
}

export function createTextFilename(name) {
  return createFilename(name, '.txt');
}

function createFilename(name, extension) {
  const sanitized = name.trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/[\s-]+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80)
    .replace(/[.-]+$/g, '');
  const safeName = sanitized || 'study-notes';
  const stem = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(safeName)
    ? `${safeName}-notes`
    : safeName;

  return `${stem}${extension}`;
}

function markdownList(items) {
  return items.length > 0 ? items.map((item) => `- ${item}`) : ['- None identified.'];
}

function formatTextSection(title, items) {
  return `${title}\n${'-'.repeat(title.length)}\n${markdownList(items).join('\n')}`;
}
