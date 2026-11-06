import { crossSite, rateLimited, sheetSafe, str } from './_lib.js'

const INTERESTS = new Set(['Product management', 'Finance', 'Operations', 'Marketing', 'Technology', 'Events'])
const YEARS = new Set(['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate'])

/**
 * POST /api/join
 * Validates an application and forwards it to JOIN_WEBHOOK_URL
 * (a Google Apps Script web app that appends a row to a Sheet; see README).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Use POST.' })
  }
  if (crossSite(req)) return res.status(403).json({ error: 'Applications can only be sent from the chapter site.' })
  if (rateLimited(req, 'join', 5, 10 * 60_000)) {
    return res.status(429).json({ error: 'Too many applications from this connection. Try again in ten minutes.' })
  }

  const b = typeof req.body === 'object' && req.body ? req.body : {}

  // Honeypot filled in: pretend success so bots don't retry.
  if (str(b.company, 100)) return res.status(200).json({ ok: true })

  const app = {
    name: str(b.name, 80),
    email: str(b.email, 80).toLowerCase(),
    department: str(b.department, 60),
    year: str(b.year, 20),
    interests: Array.isArray(b.interests) ? b.interests.filter((i) => INTERESTS.has(i)).slice(0, 6) : [],
    why: str(b.why, 600),
  }

  if (app.name.length < 2) return res.status(400).json({ error: 'Add your full name.' })
  if (!/^[a-z0-9._%+-]+@srmist\.edu\.in$/.test(app.email)) {
    return res.status(400).json({ error: 'Use your SRM email, the one ending in @srmist.edu.in.' })
  }
  if (!app.department) return res.status(400).json({ error: 'Add your department.' })
  if (!YEARS.has(app.year)) return res.status(400).json({ error: 'Choose your year.' })

  const url = process.env.JOIN_WEBHOOK_URL
  if (!url) {
    console.error('JOIN_WEBHOOK_URL is not set')
    return res.status(503).json({ error: 'Applications are closed on this deployment. Message us on Instagram instead.' })
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'application',
        secret: process.env.JOIN_WEBHOOK_SECRET || '',
        submittedAt: new Date().toISOString(),
        name: sheetSafe(app.name),
        email: app.email,
        department: sheetSafe(app.department),
        year: app.year,
        interests: app.interests.join(', '),
        why: sheetSafe(app.why),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const text = await r.text()
    if (!r.ok || !text.includes('"ok":true')) throw new Error(`webhook ${r.status}: ${text.slice(0, 200)}`)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('join forward failed', err)
    return res.status(502).json({ error: 'Your application could not be saved. Try again in a minute.' })
  }
}
