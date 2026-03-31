export function normalizeImageUrlInput(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  if (raw.startsWith('//')) {
    return `https:${raw}`
  }

  return `https://${raw}`
}

export function isValidHttpImageUrl(value) {
  const normalized = normalizeImageUrlInput(value)
  if (!normalized) {
    return true
  }

  try {
    const url = new URL(normalized)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
