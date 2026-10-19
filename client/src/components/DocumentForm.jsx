export default function DocumentForm({
  file,
  instruction,
  isLoading,
  onFileChange,
  onInstructionChange,
  onSubmit,
}) {
  return (
    <form className="document-form" onSubmit={onSubmit}>
      <label className="field-label" htmlFor="study-document">
        Choose a study document
      </label>
      <input
        id="study-document"
        accept=".txt,.pdf,text/plain,application/pdf"
        className="file-input"
        onChange={onFileChange}
        type="file"
      />
      <p className="field-hint">
        Choose a chapter-organized text file or a text-based PDF. Scanned PDFs are not supported.{' '}
        Try the sample: <a href="/sample-chapters.txt" download>TXT</a> or{' '}
        <a href="/sample-chapters.pdf" download>PDF</a>.
      </p>

      <label className="field-label" htmlFor="focus-instruction">
        Focus your study notes <span className="optional-label">Optional</span>
      </label>
      <textarea
        id="focus-instruction"
        maxLength={500}
        onChange={onInstructionChange}
        placeholder="For example: focus on Chapter 2, or on fractions"
        rows={3}
        value={instruction}
      />
      <p className="field-hint">Name chapter numbers, chapter titles, or a topic.</p>

      <button className="primary-button" disabled={isLoading || !file} type="submit">
        {isLoading ? 'Creating your study notes…' : 'Summarize chapters'}
      </button>
    </form>
  );
}
