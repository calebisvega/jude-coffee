# Jude — where everything lives (no Cursor required)

Use this if you lose Cursor access. The site source of truth is **GitHub + copies on this Mac / Boris drive**, not Cursor chat history.

## Code (primary)

| What | Where |
| --- | --- |
| GitHub (source of truth) | `https://github.com/calebisvega/jude-coffee` |
| Default branch | `main` |
| Live site | `https://judecoffee.com` (Cloudflare Pages from `main`) |
| Mac working copy | `/Users/CalebVega/jude-coffee` |
| Boris drive clone | `/Volumes/Boris/JUDE/jude-coffee-github` |

Clone anytime (any computer, any account):

```bash
git clone https://github.com/calebisvega/jude-coffee.git
cd jude-coffee
```

Serve locally:

```bash
python3 -m http.server 8788
# open http://127.0.0.1:8788/book-preview.html
```

## Booking preview (hidden)

- URL: `https://judecoffee.com/book-preview` (unlinked, `noindex`)
- Local: `book-preview.html`
- Do **not** swap production Book (`/contact` Flashquotes) until you intentionally ship the first-party form
- Notes: `context/booking-system.md`

## Key files

- `js/booking-calculator.js` — pricing (Lean/Standard/Premium, staffing, travel, tax)
- `js/booking-calculator.test.js` — pricing tests
- `js/booking-form.js` — Typeform-style stepper UI
- `css/booking.css` — booking preview styles
- `book-preview.html` — preview shell (iPhone frame on desktop)
- `contact.html` — production Book (Flashquotes still live)
- `css/styles.css` — brand tokens (`--sage`, `--cream`, fonts)

## Brand tokens

- Sage `#69966B`
- Cream `#F4F7EE`
- Questions: DM Sans 500; body: Inter

## What Cursor does *not* keep for you

Cursor chats, agent transcripts, and local “agent stores” live under Cursor’s app data. They are **not** the project backup. Anything important from a chat must be written into this repo (usually under `context/`) and pushed to GitHub.

Optional Cursor-local chat transcripts on this Mac:

- `/Users/CalebVega/.cursor/projects/Volumes-Boris-JUDE-JUDE-SITE/agent-transcripts/`
- `/Users/CalebVega/.cursor/projects/Volumes-Boris-07-JUDE-JUDE-SITE/agent-transcripts/` (if present)

Do not rely on those folders if you change computers or lose the Cursor account.

## Design / brand assets (outside this git repo)

Large Illustrator files and photo dumps live on the Boris drive under `/Volumes/Boris/` (not all of that is in git — by design). Keep those on the external drive / Time Machine / another cloud backup separately from the site repo.

## Last checked

- 2026-11-03: GitHub `main` matched `/Users/CalebVega/jude-coffee`. Booking notes + this recovery map live under `context/` in the repo.
