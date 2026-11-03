# Jude Coffee — Booking system

## Status (2026-11)

- **Production Book is still Flashquotes** on `/contact`. `/book` redirects there.
- **First-party preview only:** `/book-preview` — unlinked, `noindex`. Phone QA URL: `https://judecoffee.com/book-preview`.
- Packages shown as **Base / Signature / Curated** (ids still `lean` / `standard` / `premium` in the calculator).
- Welcome: full-bleed field-cart photo (`images/book-welcome.jpg`), darkened overlay, edge fade/blur so the image fills any screen height.
- Packages step: cream Elite-style cards; Base starts expanded; Signature / Curated expand as you scroll.
- Nav: prominent circular back/forward arrows + page mark; Jude logo hidden on package/path steps.
- Sage `#69966B` fills booking chrome to the screen edges (fake status / home bar hidden on non-welcome).

## Pricing (confirmed)

Source of truth: `js/booking-calculator.js` (+ tests in `js/booking-calculator.test.js`).

- Per-person staffing: Lean `$75`, Standard `$200`, Premium `$225`
- `staff_count`: **1** if `guests <= 75`, **2** if `guests > 75`
- Resource: Lean `$200`, Standard/Premium `$275`
- Per-guest: Lean `$3.25`, Standard/Premium `$5.13`
- Floor: `$500`
- Travel: first **5** round-trip miles free, then **`$1.25/mi`**
- Tax **7%** computed; live quoted amount uses pre-tax subtotal + travel
- Capacity note (not a hard block): `guests / hours > 50`
- Add-ons still stubbed at `$0` with `pricingPending: true`

## Public flow (preview)

Welcome → packages (Base / Signature / Curated) → (Curated add-ons) → details → contact → review → done.

Custom / budget path: mailto collaboration box on the packages step (“Let us know your budget”).

## 2026-10-02 — Book-only film photos

- Welcome: `images/book-welcome.jpg`
- Base / Signature / Curated: `book-base.jpg`, `book-signature.jpg`, `book-curated.jpg` (and related pour photos as wired in `booking-form.js`)
- Do not reuse book-only photos casually on the rest of the site

## 2026-09-22 — Rebuild started (preview only)

Replacing Flashquotes with a first-party Typeform-style intake in JUDE brand.

- Olive → `--sage` `#69966B`; cream type → `--cream` `#F4F7EE`
- Questions in DM Sans 500

### Still needed

- Final premium add-on prices (still `$0` stubs)
- Supabase project + allowlisted emails for `/admin/quotes` (not built yet)
- Production geocoding (preview tries Nominatim; may fail on CORS)

### Status lifecycle (later)

`partial` (contact blur) → `submitted` (“Get this locked in”) → `confirmed` (Caleb) → `accepted` / `declined`
