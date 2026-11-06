import { useEffect } from 'react'
import { Backdrop } from './components/Backdrop'
import { Hero, Nav } from './components/Top'
import { Manifesto } from './components/Manifesto'
import { Events } from './components/Events'
import { Roulette } from './components/Roulette'
import { TeamWall } from './components/TeamWall'
import { Ask } from './components/Ask'
import { Join } from './components/Join'
import { Contact } from './components/Contact'
import { chapter } from './data/site'
import { handleAnchorClick, ScrollTrigger, startSmoothScroll } from './lib/motion'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
    document.addEventListener('click', handleAnchorClick)
    // Fonts change text widths, which changes pinned-scene lengths.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return (
    <>
      <a className="skip" href="#contact">{chapter.recruitmentOpen ? 'Skip to joining' : 'Skip to contact'}</a>
      <Backdrop />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Events />
        <Roulette />
        <TeamWall />
        <Ask />
        {chapter.recruitmentOpen ? <Join /> : <Contact />}
      </main>
    </>
  )
}
