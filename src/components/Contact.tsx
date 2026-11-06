import { useState, type FormEvent } from 'react'
import { chapter } from '../data/site'

const topics = ['Sponsorship', 'Collaboration', 'Speaking at an event', 'Press or media', 'Something else']

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; name: string } | { kind: 'error'; msg: string }

/** End of the page while recruitment is closed: ways to reach the board, plus a message form. */
export function Contact() {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [topic, setTopic] = useState(topics[0])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const body = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? '')) {
      setState({ kind: 'error', msg: 'Add an email address we can reply to.' })
      return
    }
    if ((body.message ?? '').trim().length < 10) {
      setState({ kind: 'error', msg: 'Add a little more to your message so we know how to help.' })
      return
    }
    setState({ kind: 'sending' })
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, topic }),
      })
      const data = await r.json().catch(() => null)
      if (r.ok) setState({ kind: 'sent', name: (body.name || '').split(' ')[0] })
      else setState({ kind: 'error', msg: data?.error ?? 'Your message could not be sent. Try again in a minute, or message us on Instagram.' })
    } catch {
      setState({ kind: 'error', msg: 'Your message could not be sent. Check your connection, or message us on Instagram.' })
    }
  }

  return (
    <section id="contact" className="join contact" aria-labelledby="contact-h">
      <div className="join__intro">
        <h2 id="contact-h" className="display display--xl">Let's talk.</h2>
        <p className="join__aside" aria-hidden="true">Notice the gear put itself back together.</p>
        <p className="lede">
          Sponsoring an event, planning a collaboration, or want someone from the chapter to speak? Write to the board.
        </p>
        <p className="contact__closed">
          <span className="contact__dot" aria-hidden="true" />
          Recruitment is closed for now. Follow us on Instagram to hear when it opens.
        </p>
        <ul className="contact__links">
          <li>
            <a href={chapter.links.instagram} target="_blank" rel="noopener noreferrer">
              <span>Instagram</span>
              <b>@ieeetems_srm</b>
            </a>
          </li>
          <li>
            <a href={chapter.links.linkedin} target="_blank" rel="noopener noreferrer">
              <span>LinkedIn</span>
              <b>IEEE TEMS SRM</b>
            </a>
          </li>
        </ul>
      </div>

      {state.kind === 'sent' ? (
        <div className="join__done" role="status">
          <p className="join__done-h">Message sent.</p>
          <p>Thanks{state.name ? `, ${state.name}` : ''}. A board member will reply by email.</p>
        </div>
      ) : (
        <form className="join__form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="c-name">Your name</label>
            <input id="c-name" name="name" required maxLength={80} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="c-email">Email</label>
            <input id="c-email" name="email" type="email" required maxLength={120} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="c-org">Organisation <span className="opt">Optional</span></label>
            <input id="c-org" name="org" maxLength={100} autoComplete="organization" />
          </div>
          <fieldset className="field">
            <legend>What's it about?</legend>
            <div className="chips">
              {topics.map((t) => (
                <button type="button" key={t} className="chip" aria-pressed={topic === t} onClick={() => setTopic(t)}>
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="c-msg">Message</label>
            <textarea id="c-msg" name="message" rows={4} required maxLength={1500} />
          </div>
          {/* Honeypot: hidden from people, filled in by bots. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="c-company">Company</label>
            <input id="c-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          {state.kind === 'error' && <p className="form-error" role="alert">{state.msg}</p>}
          <button className="pill pill--lg" disabled={state.kind === 'sending'}>
            {state.kind === 'sending' ? 'Sending message' : 'Send message'}
          </button>
        </form>
      )}

      <footer className="site-foot">
        <span className="logo logo--sm" aria-hidden="true" style={{ WebkitMaskImage: 'url(brand/tems.png)', maskImage: 'url(brand/tems.png)' }} />
        <p>{chapter.fullName}</p>
        <ul>
          <li><a href={chapter.links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href={chapter.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href={chapter.links.temsGlobal} target="_blank" rel="noopener noreferrer">IEEE TEMS</a></li>
        </ul>
      </footer>
    </section>
  )
}
