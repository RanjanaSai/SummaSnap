import { useState } from 'react';
import { summarizeDocument } from './api.js';
import DocumentForm from './components/DocumentForm.jsx';
import SummaryResults from './components/SummaryResults.jsx';

export default function App() {
  const [file, setFile] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(event) {
    setFile(event.target.files?.[0] ?? null);
    setChapters([]);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setError('');
    setChapters([]);
    try {
      const result = await summarizeDocument(file, instruction.trim());
      setChapters(result.chapters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Chapter Study Notes home">
          <span aria-hidden="true" className="brand-mark">C</span>
          <span>Chapter Study Notes</span>
        </a>
        <span className="header-note">A clearer way to review</span>
      </header>

      <section className="hero">
        <p className="eyebrow">Study with focus</p>
        <h1>Make a long document<br />easier to learn.</h1>
        <p className="hero-copy">
          Turn a long document into a clear study guide with key points, formulas, and theorems.
        </p>
      </section>

      <section className="workspace">
        <div className="workspace-intro">
          <div className="step-number">01</div>
          <div>
            <h2>Start with your material</h2>
            <p>Choose a document, then tell us what you need to focus on.</p>
          </div>
        </div>

        <DocumentForm
          file={file}
          instruction={instruction}
          isLoading={isLoading}
          onFileChange={handleFileChange}
          onInstructionChange={(event) => setInstruction(event.target.value)}
          onSubmit={handleSubmit}
        />

        {isLoading && (
          <p aria-live="polite" className="status-message">
            Reading your document and organizing the chapters…
          </p>
        )}
        {error && <p aria-live="assertive" className="error-message" role="alert">{error}</p>}
      </section>

      <SummaryResults chapters={chapters} />

      <footer className="privacy-note">
        Your document is processed for this request and is not saved by this app. Its text is sent to Groq to create the notes.
      </footer>
    </main>
  );
}
