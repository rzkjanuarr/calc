// Dropdown dengan label. options: [{ value, label }]
export default function SelectField({ id, label, value, onChange, options, hint }) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <select
          id={id}
          className="field__input field__select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hintId}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
}
