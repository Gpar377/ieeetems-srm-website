import { useState, type FormEvent } from 'react'
import { chapter } from '../data/site'

const interests = ['Product management', 'Finance', 'Operations', 'Marketing', 'Technology', 'Events']
const years = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate']

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; email: string } | { kind: 'error'; msg: string }

export function Join() {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [picked, setPicked] = useState<string[]>([])

  const toggle = (i: string) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries()) as Record<string, string>
    const payload = { ...body, interests: picked }
    if (!/^[^\s@]+@srmist\.edu\.in$/i.test(body.email ?? '')) {
      setState({ kind: 'error', msg: 'Use your SRM email, the one ending in @srmist.edu.in.' })
      return
    }
    setState({ kind: 'sending' })
    try {
      const r = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json().catch(() => null)
      if (r.ok) setState({ kind: 'sent', email: body.email })
      else setState({ kind: 'error', msg: data?.error ?? 'Your application could not be sent. Try again in a minute.' })
    } catch {
      setState({ kind: 'error', msg: 'Your application could not be sent. Check your connection and try again.' })
    }
  }

  return (
    <section id="contact" className="join" aria-labelledby="join-h">
      <div className="join__intro">
        <h2 id="join-h" className="display display--xl">Join the chapter.</h2>
        <p className="join__aside" aria-hidden="true">Notice the gear put itself back together.</p>
        <p className="lede">
          Open to every department and every year. You don't need a management background, that's what we're for.
        </p>
        <p className="join__ieee">
          IEEE membership is separate. For the member benefits,{' '}
          <a href={chapter.links.ieeeJoin} target="_blank" rel="noopener noreferrer">join IEEE</a> and add TEMS as a society.
        </p>
      </div>

      {state.kind === 'sent' ? (
        <div className="join__done" role="status">
          <p className="join__done-h">Application sent.</p>
          <p>We'll write to {state.email} before the next recruitment round.</p>
        </div>
      ) : (
        <form className="join__form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="j-name">Full name</label>
            <input id="j-name" name="name" required maxLength={80} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="j-email">SRM email</label>
            <input id="j-email" name="email" type="email" required maxLength={80} autoComplete="email" placeholder="ab1234@srmist.edu.in" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="j-dept">Department</label>
              <input id="j-dept" name="department" required maxLength={60} placeholder="CSE, ECE, Mech…" />
            </div>
            <div className="field">
              <label htmlFor="j-year">Year</label>
              <select id="j-year" name="year" required defaultValue="">
                <option value="" disabled>Choose</option>
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <fieldset className="field">
            <legend>What do you want to get better at?</legend>
            <div className="chips">
              {interests.map((i) => (
                <button type="button" key={i} className="chip" aria-pressed={picked.includes(i)} onClick={() => toggle(i)}>
                  {i}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="j-why">Anything you'd like to build or run? <span className="opt">Optional</span></label>
            <textarea id="j-why" name="why" rows={3} maxLength={600} />
          </div>
          {/* Honeypot: hidden from people, filled in by bots. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="j-company">Company</label>
            <input id="j-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          {state.kind === 'error' && (
            <p className="form-error" role="alert">{state.msg}</p>
          )}
          <button className="pill pill--lg" disabled={state.kind === 'sending'}>
            {state.kind === 'sending' ? 'Sending application' : 'Send application'}
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
