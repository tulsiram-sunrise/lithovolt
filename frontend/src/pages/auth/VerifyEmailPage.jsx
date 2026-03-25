import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../services/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Missing token.')
      return
    }

    let mounted = true

    authAPI.verifyEmailToken(token)
      .then((response) => {
        if (!mounted) {
          return
        }
        setStatus('success')
        setMessage(response.data?.message || 'Email verified successfully. You can now login.')
      })
      .catch((error) => {
        if (!mounted) {
          return
        }
        setStatus('error')
        setMessage(error.response?.data?.error || 'Verification failed. Link may be invalid or expired.')
      })

    return () => {
      mounted = false
    }
  }, [searchParams])

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="text-3xl font-semibold neon-title">Email Verification</h2>
        <p className="mt-4 text-[color:var(--muted)]">{message}</p>

        <div className="mt-8 space-y-3">
          <Link to="/login" className="neon-btn block w-full text-center">
            Go To Login
          </Link>
          {status === 'error' ? (
            <Link to="/register" className="neon-btn-secondary block w-full text-center">
              Back To Register
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
