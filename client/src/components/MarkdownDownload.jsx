import { useState } from 'react';
import { createMarkdown, createMarkdownFilename } from '../markdown.js';

export default function MarkdownDownload({ chapters }) {
  const [name, setName] = useState('study-notes');

  function handleDownload() {
    const blob = new Blob([createMarkdown(name, chapters)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = createMarkdownFilename(name);
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="markdown-download">
      <label className="field-label" htmlFor="notes-name">Name your study notes</label>
      <div className="download-controls">
        <input
          autoComplete="off"
          id="notes-name"
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          type="text"
          value={name}
        />
        <button className="primary-button" disabled={!name.trim()} onClick={handleDownload} type="button">
          Download Markdown
        </button>
      </div>
      <p className="field-hint">Your notes are downloaded as a Markdown file to your device.</p>
    </div>
  );
}
