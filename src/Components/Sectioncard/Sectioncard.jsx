import './Sectioncard.css';

export default function SectionCard({ title, children }) {
  
  const headingId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="section-card" role="region" aria-labelledby={headingId}>
      <header className="section-card-header">
        <h2 id={headingId}>{title}</h2>
      </header>
      <div className="section-card-body">
        {children}
      </div>
    </section>
  );
}
