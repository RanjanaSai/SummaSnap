function StudySection({ items, title }) {
  return (
    <section className="study-section">
      <h4>{title}</h4>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
        </ul>
      ) : (
        <p className="empty-section">No {title.toLowerCase()} identified in this chapter.</p>
      )}
    </section>
  );
}

export default function SummaryResults({ chapters }) {
  if (!chapters?.length) return null;

  return (
    <section aria-label="Chapter study notes" className="results-panel">
      <div className="results-heading">
        <div>
          <p className="eyebrow">Your study notes</p>
          <h2>Chapter-by-chapter</h2>
        </div>
        <span className="chapter-count">{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}</span>
      </div>
      <div className="chapter-list">
        {chapters.map((chapter, index) => (
          <article className="chapter-card" key={`${chapter.title}-${index}`}>
            <h3>{chapter.title}</h3>
            <StudySection items={chapter.main_points} title="Main points" />
            <StudySection items={chapter.formulas} title="Formulas" />
            <StudySection items={chapter.theorems} title="Theorems" />
          </article>
        ))}
      </div>
    </section>
  );
}
