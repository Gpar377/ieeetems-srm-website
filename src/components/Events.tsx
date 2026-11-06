import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { chapter } from '../data/site'
import { events, type ChapterEvent } from '../data/events'
import { gsap, reducedMotion } from '../lib/motion'

const toIcs = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
function downloadIcs(e: ChapterEvent) {
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1')
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IEEE TEMS SRM//Events//EN', 'BEGIN:VEVENT', `UID:${e.id}@ieeetems-srm`,
    `DTSTAMP:${toIcs(new Date().toISOString())}`, `DTSTART:${toIcs(e.start)}`, `DTEND:${toIcs(e.end)}`, `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.location)}`, `DESCRIPTION:${esc(e.summary)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  Object.assign(document.createElement('a'), { href: url, download: `${e.id}.ics` }).click()
  URL.revokeObjectURL(url)
}

function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const ms = Math.max(0, new Date(to).getTime() - now)
  const parts = [[Math.floor(ms / 864e5), 'days'], [Math.floor(ms / 36e5) % 24, 'hrs'], [Math.floor(ms / 6e4) % 60, 'min'], [Math.floor(ms / 1e3) % 60, 'sec']] as const
  return (
    <div className="countdown" role="timer">
      {parts.map(([v, l]) => (
        <span key={l}><b>{String(v).padStart(2, '0')}</b>{l}</span>
      ))}
    </div>
  )
}

const short = (iso: string) => {
  const d = new Date(iso)
  return { m: d.toLocaleString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' }), y: String(d.getFullYear()).slice(2) }
}

/** Horizontal gallery: vertical scroll drives the track sideways (desktop). Stacks on mobile. */
export function Events() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const now = Date.now()
  const upcoming = events.filter((e) => +new Date(e.start) > now).sort((a, b) => +new Date(a.start) - +new Date(b.start))[0]
  const past = events.filter((e) => +new Date(e.end) <= now).sort((a, b) => +new Date(a.start) - +new Date(b.start))

  useLayoutEffect(() => {
    const el = root.current
    const tr = track.current
    if (!el || !tr || reducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const dist = () => tr.scrollWidth - window.innerWidth
      const tween = gsap.to(tr, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist()}`, scrub: 0.5, pin: true, invalidateOnRefresh: true },
      })
      gsap.utils.toArray<HTMLElement>('.ev__num').forEach((n) => {
        gsap.fromTo(n, { fontStretch: '62%' }, {
          fontStretch: '125%', ease: 'none',
          scrollTrigger: { trigger: n, containerAnimation: tween, start: 'left 95%', end: 'left 35%', scrub: true },
        })
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="events" className="events" ref={root} aria-labelledby="events-h">
      <div className="events__track" ref={track}>
        <div className="events__intro">
          <h2 id="events-h" className="kicker">What we've run</h2>
          <p className="events__big">
            <span>{chapter.members}</span> members. Two editions of Pitch Perfect. One 24-hour IEEEXtreme, coded on campus.
          </p>
          <p className="events__nudge" aria-hidden="true">Keep scrolling</p>
        </div>

        {past.map((e) => {
          const d = short(e.start)
          return (
            <article className="ev" key={e.id} aria-labelledby={`ev-${e.id}`}>
              <p className="ev__num" aria-hidden="true">{d.m}<br />’{d.y}</p>
              <div className="ev__body">
                <p className="ev__date">{e.dateLabel}, {e.location}</p>
                <h3 id={`ev-${e.id}`}>{e.title}</h3>
                <p>{e.summary}</p>
                {e.segments && (
                  <ul className="ev__segs">
                    {e.segments.map((s) => (
                      <li key={s.name}><b>{s.name}</b><span>{s.what}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          )
        })}

        <article className="ev ev--next" aria-labelledby="ev-next">
          <p className="ev__num ev__num--next" aria-hidden="true">{upcoming ? short(upcoming.start).m : 'Next'}</p>
          <div className="ev__body">
            {upcoming ? (
              <>
                <p className="ev__date">{upcoming.dateLabel}, {upcoming.location}</p>
                <h3 id="ev-next">{upcoming.title}</h3>
                <p>{upcoming.summary}</p>
                <Countdown to={upcoming.start} />
                <div className="row">
                  {upcoming.registerUrl && <a className="pill" href={upcoming.registerUrl} target="_blank" rel="noopener noreferrer">Register</a>}
                  <button className="link" onClick={() => downloadIcs(upcoming)}>Add to calendar</button>
                </div>
              </>
            ) : (
              <>
                <p className="ev__date">Being planned now</p>
                <h3 id="ev-next">The next one</h3>
                <p>Follow us on Instagram and you'll hear about it before the posters go up.</p>
                <a className="pill" href={chapter.links.instagram} target="_blank" rel="noopener noreferrer">Follow @ieeetems_srm</a>
              </>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
