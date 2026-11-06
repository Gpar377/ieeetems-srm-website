import { useEffect, useRef, useState } from 'react'
import { constraints, customers, problems } from '../data/roulette'
import { reducedMotion } from '../lib/motion'

const LIMIT = 60
const COPIES = 5
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

type ReelProps = { label: string; items: string[]; target: number | null; spin: number; delay: number }

/** One slot-machine reel. The strip repeats the list so a spin travels a long way before landing. */
function Reel({ label, items, target, spin, delay }: ReelProps) {
  const [strip] = useState(() => Array.from({ length: COPIES }, () => items).flat())
  const [pos, setPos] = useState(0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (target === null) return
    // Jump back to the first copy without animation, then spin forward to the last copy.
    setAnimate(false)
    setPos((p) => p % items.length)
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true)
        setPos(items.length * (COPIES - 1) + target)
      }),
    )
    return () => cancelAnimationFrame(id)
  }, [spin]) // eslint-disable-line react-hooks/exhaustive-deps

  const rm = reducedMotion()
  return (
    <div className="reel">
      <span className="reel__label">{label}</span>
      <div className={`reel__window ${target === null ? 'is-down' : ''}`}>
        <span className="reel__cover" aria-hidden="true">?</span>
        <ul
          className="reel__strip"
          style={{
            transform: `translateY(calc(${-pos} * var(--item-h)))`,
            transition: animate && !rm ? `transform ${1.6 + delay}s cubic-bezier(.12,.75,.18,1.02)` : 'none',
          }}
          aria-hidden="true"
        >
          {strip.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <p className="visually-hidden" aria-live="polite">{target === null ? '' : `${label}: ${items[target]}`}</p>
      </div>
    </div>
  )
}

export function Roulette() {
  const [lists] = useState(() => ({ p: shuffle(problems), c: shuffle(customers), k: shuffle(constraints) }))
  const [pick, setPick] = useState<{ p: number; c: number; k: number } | null>(null)
  const [spin, setSpin] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [left, setLeft] = useState(LIMIT)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const pull = () => {
    window.clearInterval(timer.current)
    setRunning(false)
    setLeft(LIMIT)
    const r = (n: number, prev?: number) => {
      let v = Math.floor(Math.random() * n)
      if (n > 1 && v === prev) v = (v + 1) % n
      return v
    }
    setPick((old) => ({ p: r(lists.p.length, old?.p), c: r(lists.c.length, old?.c), k: r(lists.k.length, old?.k) }))
    setSpin((s) => s + 1)
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), reducedMotion() ? 0 : 2300)
  }

  const start = () => {
    setLeft(LIMIT)
    setRunning(true)
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(timer.current)
          setRunning(false)
          return 0
        }
        return l - 1
      })
    }, 1000)
  }
  useEffect(() => () => window.clearInterval(timer.current), [])

  return (
    <section id="roulette" className="roulette" aria-labelledby="roulette-h">
      <div className="roulette__head">
        <h2 id="roulette-h" className="display">Pitch Roulette</h2>
        <p className="lede">
          The closing round of Pitch Perfect, playable here. Pull the lever, get a problem, a customer and a constraint,
          then pitch it out loud in 60 seconds. No slides.
        </p>
      </div>

      <div className={`machine ${spinning ? 'is-spinning' : ''}`}>
        <Reel label="Problem" items={lists.p} target={pick?.p ?? null} spin={spin} delay={0} />
        <Reel label="Customer" items={lists.c} target={pick?.c ?? null} spin={spin} delay={0.25} />
        <Reel label="Constraint" items={lists.k} target={pick?.k ?? null} spin={spin} delay={0.5} />
      </div>

      <div className="roulette__controls">
        <button className="lever" onClick={pull} disabled={spinning}>
          <span className="lever__knob" aria-hidden="true" />
          {pick ? 'Pull again' : 'Pull the lever'}
        </button>
        <button className="pill pill--ghost" onClick={start} disabled={!pick || spinning || running}>
          {running ? 'Pitching' : 'Start 60 seconds'}
        </button>
        <p className={`clock ${running && left <= 10 ? 'is-low' : ''}`} role="timer" aria-label={`${left} seconds left`}>
          0:{String(left).padStart(2, '0')}
        </p>
      </div>
      <p className="roulette__after" aria-live="polite">
        {pick && left === 0 ? 'Time. Would you put your own money into that? If you hesitated, so will an investor.' : ' '}
      </p>
    </section>
  )
}
