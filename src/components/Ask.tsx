import { useRef, useState, type FormEvent } from 'react'

type Msg = { role: 'user' | 'model'; text: string }

const starters = ['When does recruitment open?', 'Do I have to be from CSE?', 'What happens at Pitch Perfect?', 'Is IEEE membership required?']

export function Ask() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    const history = msgs.slice(-8)
    setMsgs((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history }),
      })
      const data = await r.json().catch(() => null)
      const answer =
        r.ok && data?.answer
          ? data.answer
          : r.status === 429
            ? 'Too many questions in a row. Wait a minute and ask again.'
            : 'The assistant is offline right now. Message us on Instagram at @ieeetems_srm and a board member will reply.'
      setMsgs((m) => [...m, { role: 'model', text: answer }])
    } catch {
      setMsgs((m) => [
        ...m,
        { role: 'model', text: 'The assistant is offline right now. Message us on Instagram at @ieeetems_srm and a board member will reply.' },
      ])
    } finally {
      setBusy(false)
      requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }))
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  return (
    <section id="questions" className="qa" aria-labelledby="questions-h">
      <div className="qa__intro">
        <h2 id="questions-h" className="display">Questions?</h2>
        <p className="lede">
          Ask anything about the chapter and get an answer straight away. Anything it can't answer, a board member
          will on Instagram.
        </p>
      </div>

      <div className="qa__panel">
        <div className="qa__log" ref={logRef} aria-live="polite">
          {msgs.length === 0 ? (
            <ul className="qa__starters" aria-label="Suggested questions">
              {starters.map((s) => (
                <li key={s}>
                  <button onClick={() => send(s)}>{s}</button>
                </li>
              ))}
            </ul>
          ) : (
            msgs.map((m, i) => (
              <p key={i} className={`bubble bubble--${m.role}`}>
                <span className="visually-hidden">{m.role === 'user' ? 'You asked: ' : 'Answer: '}</span>
                {m.text}
              </p>
            ))
          )}
          {busy && <p className="bubble bubble--model bubble--wait">Thinking</p>}
        </div>
        <form className="qa__form" onSubmit={onSubmit}>
          <label htmlFor="qa-input" className="visually-hidden">Your question</label>
          <input
            id="qa-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={400}
            placeholder="Ask about events, joining, or what we do"
            autoComplete="off"
          />
          <button className="pill" disabled={busy || !input.trim()}>Ask</button>
        </form>
      </div>
    </section>
  )
}
