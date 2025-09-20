import './Sectioncard.css';

export default function SectionCard({ title, children, hideHeader = false }) {
  const headingId = title
    ? title.toLowerCase().replace(/\s+/g, '-')
    : undefined;

  return (
    <section
      className="section-card"
      role="region"
      aria-labelledby={!hideHeader && headingId ? headingId : undefined}
      aria-label={hideHeader && title ? title : undefined}
    >
      {!hideHeader && (
        <header className="section-card-header">
          <h2 id={headingId}>{title}</h2>
        </header>
      )}

      <div className="section-card-body">
        {children}
      </div>
    </section>
  );
}
