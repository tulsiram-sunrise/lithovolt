import { useState } from 'react'

export default function ProductImage({ src, alt, className = '', fallbackText = 'No image' }) {
  const [failed, setFailed] = useState(false)
  const hasImage = Boolean(src) && !failed

  if (!hasImage) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-[color:var(--border)]/40 bg-[color:var(--panel)]/45 text-xs text-[color:var(--muted)] ${className}`}>
        {fallbackText}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-lg border border-[color:var(--border)]/40 bg-white object-cover ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
