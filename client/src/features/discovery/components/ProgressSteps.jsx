const labels = ['Project type', 'Your idea', 'Scope', 'Expectations', 'Review'];

export default function ProgressSteps({ current, onStepClick }) {
  return <nav className="wizard-progress" aria-label="Discovery progress">
    <ol>{labels.map((label, index) => {
      const done = index < current;
      const available = index <= current;
      return <li key={label} className={index === current ? 'current' : done ? 'complete' : ''}>
        <button type="button" disabled={!available} onClick={() => onStepClick(index)} aria-current={index === current ? 'step' : undefined} aria-label={`Step ${index + 1}: ${label}${done ? ', completed' : ''}`}>
          <span className="progress-number">{done ? '✓' : `0${index + 1}`}</span><span className="progress-label">{label}</span>
        </button>
      </li>;
    })}</ol>
    <div className="progress-track" aria-hidden="true"><span style={{ width: `${(current / (labels.length - 1)) * 100}%` }} /></div>
    <p className="progress-mobile-label">Step {current + 1} of {labels.length} <span>·</span> {labels[current]}</p>
  </nav>;
}
