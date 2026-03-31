export default function CustomCheckbox({ checked, onChange, label, disabled = false, id }) {
  return (
    <label htmlFor={id} className={`custom-checkbox ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className={`custom-checkbox-box ${checked ? 'is-checked' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6">
          <path d="M4 10.5 8 14.5 16 6.5" />
        </svg>
      </span>
      {label ? <span className="text-sm text-[color:var(--text)]">{label}</span> : null}
    </label>
  )
}
