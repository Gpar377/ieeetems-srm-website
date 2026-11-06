/**
 * Form sink for the site: join applications and contact messages.
 * Paste into a Google Sheet via Extensions → Apps Script.
 * 1. Set SECRET below to a long random string (same value as JOIN_WEBHOOK_SECRET on Vercel).
 * 2. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 * 3. Copy the web app URL into JOIN_WEBHOOK_URL on Vercel.
 * Applications land in an "Applications" tab, messages in a "Messages" tab.
 */
const SECRET = 'CHANGE-ME-to-a-long-random-string';

const SHEETS = {
  application: {
    name: 'Applications',
    headers: ['Submitted at', 'Name', 'Email', 'Department', 'Year', 'Interests', 'Wants to build or run'],
    row: (d) => [d.submittedAt, d.name, d.email, d.department, d.year, d.interests, d.why],
  },
  contact: {
    name: 'Messages',
    headers: ['Submitted at', 'Name', 'Email', 'Organisation', 'Topic', 'Message'],
    row: (d) => [d.submittedAt, d.name, d.email, d.org, d.topic, d.message],
  },
};

function doPost(e) {
  const out = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad json' }); }
  if (d.secret !== SECRET) return out({ ok: false, error: 'forbidden' });
  const kind = SHEETS[d.type] || SHEETS.application;

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(kind.name) || book.insertSheet(kind.name);
    if (sheet.getLastRow() === 0) sheet.appendRow(kind.headers);
    sheet.appendRow(kind.row(d));
  } finally {
    lock.releaseLock();
  }
  return out({ ok: true });
}
