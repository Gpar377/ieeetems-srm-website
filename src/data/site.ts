// Everything a board member might need to edit lives in src/data/.
// Change text here; no component code needs touching.

export const chapter = {
  name: 'IEEE TEMS SRM',
  fullName: 'IEEE Technology and Engineering Management Society, SRM Student Chapter',
  campus: 'SRM Institute of Science and Technology, Kattankulathur',
  oneLiner:
    'The student chapter where SRM engineers learn to manage, fund and pitch what they build.',
  members: '100+',
  // Flip to true when recruitment opens: the page ends with the join form instead of Contact,
  // and the nav, hero and events buttons switch back to "Join".
  recruitmentOpen: false,
  links: {
    linkedin: 'https://www.linkedin.com/company/ieee-tems-srm/',
    instagram: 'https://www.instagram.com/ieeetems_srm/',
    ieeeJoin: 'https://www.ieee.org/membership/join',
    temsGlobal: 'https://www.ieee-tems.org/',
  },
}

export const tracks = [
  {
    verb: 'Shape it.',
    name: 'Innovation management',
    body: 'Taking an idea through its whole life: from a problem worth solving to a product someone uses.',
    weDo: 'Validation sprints, market sizing, product teardown sessions',
  },
  {
    verb: 'Lead it.',
    name: 'Strategic leadership',
    body: 'The soft skills and foresight it takes to lead technical teams, not just sit in them.',
    weDo: 'Talks from engineers who became managers, team-run projects, mentoring',
  },
  {
    verb: 'Ship it.',
    name: 'Entrepreneurship',
    body: 'Resources and mentorship for students who want to start something of their own.',
    weDo: 'Pitch Perfect, founder sessions, feedback on real pitch decks',
  },
]
