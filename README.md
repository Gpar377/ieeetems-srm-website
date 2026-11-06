# IEEE TEMS SRM website

The chapter site. The hero is the TEMS logo rebuilt from ~34,000 WebGL particles: your cursor parts them, scrolling scatters them into a starfield you fly through, and they reassemble at "Join the chapter". Then come pinned kinetic type, a horizontal events gallery, slot-machine Pitch Roulette, and the board as a physics pile you can grab and throw.

Vite + React + TypeScript · Three.js (custom shaders) · GSAP ScrollTrigger · Lenis · Matter.js · two Vercel serverless functions. Font: Archivo (variable width axis), self-hosted.

Performance: Three.js is lazy-loaded after the page text; particle count drops on phones and low-core devices; rendering pauses in background tabs; `prefers-reduced-motion` turns off smooth scroll, particle flight, pinned animation and the falling pile (the team defaults to a list); no-WebGL browsers get a static logo.

## Run locally

```bash
npm install
npm run dev          # site only, at localhost:5173
npx vercel dev       # site + /api functions (needs `vercel login` once)
```

## Deploy (Vercel)

1. Push this folder to a GitHub repo and import it in Vercel. The framework preset is Vite; the defaults are correct.
2. In **Settings → Environment Variables**, add the values from `.env.example`:
   - `GEMINI_API_KEY`: a **new** key from Google AI Studio. The old site's key was public in its JS bundle, so revoke that one.
   - `GEMINI_MODEL`: optional, defaults to `gemini-2.5-flash`.
   - `JOIN_WEBHOOK_URL` and `JOIN_WEBHOOK_SECRET`: see below.
3. Redeploy.

Never name a secret `VITE_…`. Vite copies those into the public bundle, which is how the old key leaked.

## Recruitment open or closed

`recruitmentOpen` in `src/data/site.ts` controls the end of the page:

- `false` (now): a **Contact** section with Instagram and LinkedIn links plus a message form (sponsorship, collaboration, speaking, press). Messages go to a `Messages` tab.
- `true`: the **Join** form comes back, and the nav, hero and event buttons say "Join" again. Applications go to an `Applications` tab.

Both forms use the same Google Sheet and webhook. Also update the Recruitment line in `api/ask.js` so the assistant gives the right answer.

## Forms → Google Sheet

1. Create a Google Sheet (for example "TEMS applications") using the chapter's Google account.
2. Go to **Extensions → Apps Script** and paste in `tools/google-apps-script.gs`. Set `SECRET` to a long random string.
3. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*. Copy the URL.
4. On Vercel, set `JOIN_WEBHOOK_URL` to that URL and `JOIN_WEBHOOK_SECRET` to the same secret.

Applications land in an `Applications` tab and contact messages in a `Messages` tab. `/api/join` checks for an `@srmist.edu.in` email, `/api/contact` for any valid email. Both rate-limit each IP, drop bot submissions caught by a hidden honeypot field, and escape cells that start with `=`, `+`, `-` or `@` so nobody can inject spreadsheet formulas.

## Editing content

Everything lives in `src/data/`:

| File | What's in it |
| --- | --- |
| `site.ts` | Chapter name, one-liner, member count, links, the three tracks (with their verbs) |
| `events.ts` | Events. Give an event a future `start` date and the site shows a live countdown plus Register and Add to calendar buttons for it. |
| `team.ts` | Board and advisors. Photos go in `public/team/` as 4:5 portraits, about 560×700. They become cards in the physics pile automatically. |
| `roulette.ts` | What's on the Pitch Roulette reels: problems, customers and constraints |

The assistant's facts are in `api/ask.js` (`FACTS`). Update them when events or the board change, because the assistant is told to answer only from them.

## Notes

- Rate limits are in-memory per function instance. That's enough for a club site; move to Vercel KV / Upstash if anyone abuses it.
- The design respects `prefers-reduced-motion`, has visible keyboard focus everywhere, and works down to 320px wide.
