import { useMemo, useState } from 'react'

export default function PasswordInput({
  className = 'neon-input',
  allowToggle = true,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  const inputType = allowToggle && showPassword ? 'text' : 'password'
  const mergedClassName = useMemo(() => `${className}${allowToggle ? ' pr-20' : ''}`.trim(), [className, allowToggle])

  return (
    <div className={allowToggle ? 'relative' : ''}>
      <input
        {...props}
        type={inputType}
        className={mergedClassName}
      />
      {allowToggle ? (
        <button
          type="button"
          className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--muted)] hover:text-[color:var(--text)]"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.71 6.7A12.4 12.4 0 002 12s3.64 7 10 7a9.8 9.8 0 004.3-.98" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.24A10.66 10.66 0 0112 4c6.36 0 10 8 10 8a19.7 19.7 0 01-3.06 3.92" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.64-8 10-8 10 8 10 8-3.64 8-10 8S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  )
}