export default function RichDateInput({ id, value, onChange, label, min, max }) {
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0]
    onChange?.(today)
  }

  return (
    <div>
      {label ? <label htmlFor={id} className="field-label">{label}</label> : null}
      <div className="rich-date-wrap">
        <input
          id={id}
          type="date"
          className="neon-input"
          value={value || ''}
          min={min}
          max={max}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <div className="rich-date-actions">
          <button type="button" className="neon-btn-ghost" onClick={setToday}>Today</button>
          <button type="button" className="neon-btn-ghost" onClick={() => onChange?.('')}>Clear</button>
        </div>
      </div>
    </div>
  )
}
