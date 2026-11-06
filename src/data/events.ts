// Add new events to the top of this list.
// `start` / `end` are ISO dates in IST. If any event's `start` is in the future,
// the site shows a live countdown and register / add-to-calendar buttons for it.

export type ChapterEvent = {
  id: string
  title: string
  start: string // e.g. '2026-02-05T10:00:00+05:30'
  end: string
  dateLabel: string
  location: string
  summary: string
  segments?: { name: string; what: string }[]
  registerUrl?: string
}

export const events: ChapterEvent[] = [
  {
    id: 'ieeextreme-20',
    title: 'IEEEXtreme 20.0',
    // IEEEXtreme runs 24 hours from 00:00 UTC (05:30 IST).
    start: '2026-10-31T05:30:00+05:30',
    end: '2026-11-01T05:30:00+05:30',
    dateLabel: '31 October 2026',
    location: 'SRM IST, Kattankulathur',
    summary:
      "IEEE's global 24-hour programming contest. We ran an on-campus venue at SRM, where teams coded straight through the night against teams from around the world.",
    segments: [
      { name: '24 hours', what: 'One continuous round, start to finish' },
      { name: 'Teams of up to three', what: 'IEEE student members only' },
      { name: 'Global leaderboard', what: 'Ranked live against teams worldwide' },
      { name: 'On campus', what: 'Hosted at SRM with proctors on site' },
    ],
  },
  {
    id: 'pitch-perfect-2',
    title: 'Pitch Perfect 2.0',
    start: '2026-02-05T10:00:00+05:30',
    end: '2026-02-06T16:00:00+05:30',
    dateLabel: '5–6 February 2026',
    location: 'SRM IST, Kattankulathur',
    summary:
      'A two-day program where teams find a real problem, build a startup idea around it and turn it into a structured pitch deck.',
    segments: [
      { name: 'Numbers That Speak', what: 'Market sizing you can defend' },
      { name: 'Money Talks', what: 'Unit economics and how founders get paid' },
      { name: 'Validation Sprint', what: 'Calling real people to test the idea' },
      { name: 'Pitch Roulette', what: 'Round-robin pitching, rated by peers' },
    ],
    registerUrl: 'https://konfhub.com/pitchperfect20',
  },
  {
    id: 'pitch-perfect-1',
    title: 'Pitch Perfect 1.0',
    start: '2024-09-02T10:00:00+05:30',
    end: '2024-09-03T16:00:00+05:30',
    dateLabel: '2–3 September 2024',
    location: 'SRM IST, Kattankulathur',
    summary:
      'The first edition: expert talks, team-built pitch decks and mentoring from young professionals, built around validating before building.',
  },
]
