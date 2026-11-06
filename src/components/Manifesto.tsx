import { useLayoutEffect, useRef } from 'react'
import { tracks } from '../data/site'
import { gsap, reducedMotion } from '../lib/motion'

/**
 * Pinned scene. Each verb starts condensed and scattered, then stretches out on
 * Archivo's width axis and its letters snap into line as you scroll; the matching
 * track's details come in beside it.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || reducedMotion()) return
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.verb-row')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${window.innerHeight * 2.6}`, scrub: 0.6, pin: '.manifesto__stage' },
      })
      rows.forEach((row, i) => {
        const word = row.querySelector('.verb')!
        const chars = row.querySelectorAll('.verb__c')
        const info = row.querySelector('.verb-info')!
        tl.fromTo(word, { fontStretch: '62%', opacity: 0 }, { fontStretch: '125%', opacity: 1, duration: 1, ease: 'power2.out' }, i)
          .fromTo(
            chars,
            { yPercent: (k) => (k % 2 ? 60 : -60), rotate: (k) => (k % 2 ? 8 : -8) },
            { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.03, ease: 'back.out(2)' },
            i,
          )
          .fromTo(info, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.6 }, i + 0.35)
      })
      tl.to({}, { duration: 0.6 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="tracks" className="manifesto" ref={root} aria-labelledby="tracks-h">
      <div className="manifesto__stage">
        <h2 id="tracks-h" className="kicker">You can already build it. We teach the rest.</h2>
        <ol className="verbs">
          {tracks.map((t) => (
            <li className="verb-row" key={t.name}>
              <p className="verb" aria-label={t.verb}>
                {t.verb.split('').map((c, i) => (
                  <span className="verb__c" aria-hidden="true" key={i}>
                    {c === ' ' ? ' ' : c}
                  </span>
                ))}
              </p>
              <div className="verb-info">
                <h3>{t.name}</h3>
                <p>{t.body}</p>
                <p className="verb-info__do">{t.weDo}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
