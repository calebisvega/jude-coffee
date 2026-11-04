# Session Handoff

## 2026-11-03 21:20 — SEO + geo landing pages (Tampa / Orlando / Lakeland)

### Goal
Review and optimize Jude Coffee site SEO. Create city landing pages at clean paths like `/tampa`, `/orlando`, `/lakeland` (lowercase preferred). Pages should **not** appear in the main nav (“hidden in the traditional view”) but should be indexable for searches like “coffee cart Tampa,” similar to Solo Coffee Cart’s city/service SEO approach: https://www.solocoffeecart.com/

### Progress
- Done: request captured; Solo homepage + service-section pattern reviewed; Solo-inspired screenshot saved for copy reference.
- In progress: none (this chat is out of context — hand off).
- Not started: SEO audit, city page HTML/CSS, sitemap/robots updates, Cloudflare redirects if needed, photo selection/import.

### Decisions / requirements
- URLs: `judecoffee.com/tampa`, `/orlando`, `/lakeland` (user said slash-city; use lowercase for SEO).
- Not linked from primary site nav; discoverable via search + sitemap.
- Use uploaded photos (user said they dropped a bunch — **not found in repo/assets yet**; new chat must ask Caleb to re-drop or point to the folder).
- Copy inspiration: Solo “Coffee catering for weddings, offices, and parties” service list (Corporate Events, Conferences, Brand Activations, Brand Pop-Ups, Office Coffee, Weddings, Private Parties, Holiday Parties). Write original Jude voice — do not copy Solo verbatim.
- Reference screenshot: `context/references/solo-services-section.png`
- Keep Jude brand (sage `#69966B`, cream `#F4F7EE`, existing site system). Follow frontend design rules when building pages.
- Workspace: `/Users/CalebVega/jude-coffee` (synced with GitHub `calebisvega/jude-coffee`).

### Blockers
- New photo drop location unknown in this chat. Ask Caleb where the new images are, or have him attach them again.

### Next action
1. Confirm photo folder / re-attach images.
2. Audit current SEO (`index.html`, `sitemap.xml`, `robots.txt`, meta tags).
3. Build `/tampa`, `/orlando`, `/lakeland` city pages + add to sitemap without main-nav links.
4. Push live for phone/search QA.

### Read first
- `context/session-handoff.md` (this entry)
- `context/references/solo-services-section.png`
- `context/WHERE-EVERYTHING-LIVES.md`
- `index.html`, `sitemap.xml`, `robots.txt`, `_redirects`
- `css/styles.css` (brand tokens)
- Solo reference: https://www.solocoffeecart.com/

---

## 2026-11-03 19:05 — Continue Jude booking + durable backups

### Goal
Keep building the first-party Jude booking preview (`/book-preview`) to replace Flashquotes eventually, without losing work if Cursor access goes away. User asked to start a **new chat** because this thread’s context is nearly full.

### Progress
- Done:
  - Booking preview lives at `https://judecoffee.com/book-preview` (unlinked, `noindex`). Production `/contact` Flashquotes untouched.
  - Welcome: full-bleed field-cart photo, edge fade/blur, darker overlay, wide tracking on “Let’s talk about your event.”
  - Packages: Base / Signature / Curated cream sheets; expand-on-scroll; sage to screen edges; logo removed; circular nav arrows.
  - Durable backup: code on GitHub `calebisvega/jude-coffee`; Mac `/Users/CalebVega/jude-coffee`; Boris `/Volumes/Boris/JUDE/jude-coffee-github`; Desktop `~/Desktop/JUDE-CODE-BACKUP.txt`.
  - Notes committed: `context/WHERE-EVERYTHING-LIVES.md`, `context/booking-system.md`.
- In progress: none (paused for context handoff).
- Not started: ship first-party form to production Book; add-on prices; Supabase quotes admin; production geocoding.

### Decisions
- Preview-only until Caleb says swap production Book.
- Package UI names Base / Signature / Curated; calculator ids stay lean / standard / premium.
- Staff threshold: 1 staff if guests ≤ 75, 2 if > 75.
- Workspace for new chat: `/Users/CalebVega/jude-coffee` (synced with `origin/main`). Avoid relying on emptied `/Volumes/Boris/JUDE/JUDE-SITE` stub.

### Blockers
- None for continuing booking UI work. New chat should confirm what Caleb wants next (welcome type/kerning, packages scroll, push live preview, etc.).

### Next action
Ask Caleb what to work on next for `/book-preview`, then continue from the current live/local preview state. Read recovery + booking notes first if needed.

### Read first
- `context/session-handoff.md` (this file, latest entry)
- `context/WHERE-EVERYTHING-LIVES.md`
- `context/booking-system.md`
- `book-preview.html`
- `js/booking-form.js`
- `css/booking.css`
