import { crossSite, rateLimited, sheetSafe, str } from './_lib.js'

const TOPICS = new Set(['Sponsorship', 'Collaboration', 'Speaking at an event', 'Press or media', 'Something else'])

/**
 * POST /api/contact
 * Validates a message and forwards it to the same JOIN_WEBHOOK_URL as applications,
 * tagged type: "contact" so the Apps Script files it in a separate Messages tab.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Use POST.' })
  }
  if (crossSite(req)) return res.status(403).json({ error: 'Messages can only be sent from the chapter site.' })
  if (rateLimited(req, 'contact', 5, 10 * 60_000)) {
    return res.status(429).json({ error: 'Too many messages from this connection. Try again in ten minutes.' })
  }

  const b = typeof req.body === 'object' && req.body ? req.body : {}
  if (str(b.company, 100)) return res.status(200).json({ ok: true }) // honeypot

  const msg = {
    name: str(b.name, 80),
    email: str(b.email, 120).toLowerCase(),
    org: str(b.org, 100),
    topic: TOPICS.has(b.topic) ? b.topic : 'Something else',
    message: str(b.message, 1500),
  }
  if (msg.name.length < 2) return res.status(400).json({ error: 'Add your name.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(msg.email)) return res.status(400).json({ error: 'Add an email address we can reply to.' })
  if (msg.message.length < 10) return res.status(400).json({ error: 'Add a little more to your message so we know how to help.' })

  const url = process.env.JOIN_WEBHOOK_URL
  if (!url) {
    console.error('JOIN_WEBHOOK_URL is not set')
    return res.status(503).json({ error: 'The contact form is off on this deployment. Message us on Instagram instead.' })
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'contact',
        secret: process.env.JOIN_WEBHOOK_SECRET || '',
        submittedAt: new Date().toISOString(),
        name: sheetSafe(msg.name),
        email: msg.email,
        org: sheetSafe(msg.org),
        topic: msg.topic,
        message: sheetSafe(msg.message),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const text = await r.text()
    if (!r.ok || !text.includes('"ok":true')) throw new Error(`webhook ${r.status}: ${text.slice(0, 200)}`)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact forward failed', err)
    return res.status(502).json({ error: 'Your message could not be sent. Try again in a minute, or message us on Instagram.' })
  }
}
