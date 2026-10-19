import { useState } from 'react';
import {
  createMarkdown,
  createMarkdownFilename,
  createPlainText,
  createTextFilename,
} from '../markdown.js';

export default function SummaryDownload({ chapters }) {
  const [name, setName] = useState('study-notes');
  const [downloadMessage, setDownloadMessage] = useState('');

  function handleDownload(format) {
    const isMarkdown = format === 'markdown';
    const content = isMarkdown ? createMarkdown(name, chapters) : createPlainText(name, chapters);
    const filename = isMarkdown ? createMarkdownFilename(name) : createTextFilename(name);
    const blob = new Blob([content], {
      type: isMarkdown ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadMessage(`Your notes are downloading as ${filename}.`);
  }

  return (
    <div className="summary-download">
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
        <div className="download-buttons">
          <button className="primary-button" disabled={!name.trim()} onClick={() => handleDownload('markdown')} type="button">
            Download Markdown
          </button>
          <button className="secondary-button" disabled={!name.trim()} onClick={() => handleDownload('text')} type="button">
            Download text (.txt)
          </button>
        </div>
      </div>
      <p className="field-hint">Choose Markdown or plain text; the file is downloaded to your device.</p>
      {downloadMessage && <p aria-live="polite" className="download-message">{downloadMessage}</p>}
    </div>
  );
}
