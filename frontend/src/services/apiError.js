function firstString(values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function firstMessageFromObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return ''
  }

  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      const candidate = firstString(value)
      if (candidate) {
        return candidate
      }
      continue
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export function extractValidationErrorMessage(error) {
  const payload = error?.response?.data

  const detailsMessage = firstMessageFromObject(payload?.details)
  if (detailsMessage) {
    return detailsMessage
  }

  const errorsMessage = firstMessageFromObject(payload?.errors)
  if (errorsMessage) {
    return errorsMessage
  }

  return ''
}

export function extractApiErrorMessage(error, fallback = 'Something went wrong.') {
  const validationMessage = extractValidationErrorMessage(error)
  if (validationMessage) {
    return validationMessage
  }

  const payload = error?.response?.data

  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim()
  }

  const directMessage = firstString([
    payload?.message,
    payload?.error,
    payload?.detail,
    error?.message,
  ])

  return directMessage || fallback
}
