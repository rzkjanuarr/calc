// Input angka dengan label, awalan/akhiran (mis. "$", "Rp", "per USD"), dan petunjuk.
// Nilainya string supaya pengguna bisa mengetik "1." atau "1," tanpa dipotong.
export default function NumberInput({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  invalid = false,
  inputMode = 'decimal',
}) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`field__control${invalid ? ' is-invalid' : ''}`}>
        {prefix && <span className="field__affix">{prefix}</span>}
        <input
          id={id}
          className="field__input"
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hintId}
          aria-invalid={invalid || undefined}
        />
        {suffix && <span className="field__affix">{suffix}</span>}
      </div>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
}
