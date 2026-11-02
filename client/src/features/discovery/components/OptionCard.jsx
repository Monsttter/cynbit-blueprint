export default function OptionCard({ title, description, icon, selected, onClick }) {
  return <button type="button" className={`project-option${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onClick}>
    <span className="project-option-icon" aria-hidden="true">{icon}</span>
    <span className="project-option-copy"><strong>{title}</strong><small>{description}</small></span>
    <span className="project-option-indicator" aria-hidden="true">{selected ? '✓' : ''}</span>
  </button>;
}
