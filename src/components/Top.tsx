import { useEffect, useState } from 'react'
import { chapter } from '../data/site'

export function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <a href="#top" className="nav__brand" aria-label="IEEE TEMS SRM, back to top">
        <span className="logo" aria-hidden="true" style={{ WebkitMaskImage: 'url(brand/tems.png)', maskImage: 'url(brand/tems.png)' }} />
        <span>IEEE TEMS <b>SRM</b></span>
      </a>
      <nav aria-label="Sections" className="nav__links">
        <a href="#tracks">What we do</a>
        <a href="#events">Events</a>
        <a href="#roulette">Roulette</a>
        <a href="#team">Team</a>
        <a href="#contact" className="pill">{chapter.recruitmentOpen ? 'Join' : 'Contact'}</a>
      </nav>
    </header>
  )
}

export function Hero() {
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(window.matchMedia('(pointer: coarse)').matches), [])
  return (
    <section id="top" className="hero" aria-labelledby="hero-h">
      <div className="hero__inner">
        <h1 id="hero-h" className="hero__title">
          <span className="hero__line">Engineers who</span>
          <span className="hero__line hero__line--wide">lead.</span>
        </h1>
        <div className="hero__foot">
          <p className="hero__sub">
            {chapter.name} is the student chapter where SRM engineers learn to manage, fund and ship what they build.
          </p>
          <div className="hero__cta">
            <a href="#contact" className="pill pill--lg">{chapter.recruitmentOpen ? 'Join the chapter' : 'Get in touch'}</a>
            <a href="#events" className="link">See what we run</a>
          </div>
        </div>
        <p className="hero__hint" aria-hidden="true">{touch ? 'Touch the gear' : 'Run your cursor through the gear'}</p>
      </div>
    </section>
  )
}
