import { describe, expect, it } from 'vitest'
import { extractApiErrorMessage, extractValidationErrorMessage } from './apiError'

describe('apiError', () => {
  it('extracts first validation message from details arrays', () => {
    const error = {
      response: {
        data: {
          details: {
            email: ['Email already exists.'],
          },
        },
      },
    }

    expect(extractValidationErrorMessage(error)).toBe('Email already exists.')
  })

  it('extracts first validation message from errors arrays', () => {
    const error = {
      response: {
        data: {
          errors: {
            registration_number: ['Registration number is required.'],
          },
        },
      },
    }

    expect(extractValidationErrorMessage(error)).toBe('Registration number is required.')
  })

  it('prefers validation message in extractApiErrorMessage', () => {
    const error = {
      response: {
        data: {
          message: 'Top-level message',
          details: {
            password: ['Password must be at least 8 characters.'],
          },
        },
      },
    }

    expect(extractApiErrorMessage(error, 'Fallback')).toBe('Password must be at least 8 characters.')
  })

  it('falls back to known top-level payload fields', () => {
    const error = {
      response: {
        data: {
          error: 'Unable to sign in.',
        },
      },
    }

    expect(extractApiErrorMessage(error, 'Fallback')).toBe('Unable to sign in.')
  })

  it('uses fallback when no parseable message exists', () => {
    expect(extractApiErrorMessage({}, 'Fallback message')).toBe('Fallback message')
  })
})
