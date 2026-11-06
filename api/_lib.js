// Shared helpers for the serverless functions. Files starting with "_" in /api
// are not exposed as routes by Vercel.

const buckets = new Map()

/**
 * Best-effort per-IP rate limit. It lives in the function instance's memory, so
 * it resets on cold starts and isn't shared between instances. It stops casual
 * abuse; for hard guarantees, swap it for Vercel KV / Upstash.
 */
export function rateLimited(req, key, max, windowMs) {
  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  const id = `${key}:${ip}`
  const now = Date.now()
  const hits = (buckets.get(id) || []).filter((t) => now - t < windowMs)
  hits.push(now)
  buckets.set(id, hits)
  if (buckets.size > 5000) buckets.clear()
  return hits.length > max
}

/** Rejects requests from other sites' browsers. Not a security boundary; it only cuts drive-by use. */
export function crossSite(req) {
  const origin = req.headers.origin
  if (!origin) return false
  try {
    return new URL(origin).host !== req.headers.host
  } catch {
    return true
  }
}

export const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Stops spreadsheet formula injection (=, +, -, @ at the start of a cell). */
export const sheetSafe = (v) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v)
