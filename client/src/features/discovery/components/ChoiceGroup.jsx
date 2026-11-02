import { FormHelperText } from '@mui/material';

export default function ChoiceGroup({ label, options, value = [], onChange, error, multiple = true, columns = 2 }) {
  const selected = multiple ? value : [value].filter(Boolean);
  const toggle = (option) => multiple
    ? onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
    : onChange(option === value ? '' : option);
  return <fieldset className="choice-fieldset">
    <legend>{label}</legend>
    <div className={`choice-grid choice-columns-${columns}`} role="group" aria-label={label}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return <button key={option} type="button" className={`choice-button${isSelected ? ' is-selected' : ''}`} aria-pressed={isSelected} onClick={() => toggle(option)}>
          <span className="choice-indicator" aria-hidden="true">{isSelected ? '✓' : ''}</span><span>{option}</span>
        </button>;
      })}
    </div>
    {error && <FormHelperText error>{error}</FormHelperText>}
  </fieldset>;
}
