export default function PublicSectionHeader({
  eyebrow,
  title,
  description,
  className = '',
  align = 'left',
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={`flex flex-col gap-2 ${alignClass} ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-3xl text-sm text-[color:var(--muted)] md:text-base">{description}</p>
      ) : null}
    </div>
  )
}
