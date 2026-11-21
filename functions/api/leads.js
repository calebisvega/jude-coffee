/**
 * POST /api/leads
 * Accepts the Jude booking intake and creates a Cortado lead server-side.
 * Requires Pages secret: CORTADO_API_KEY
 */

const CORTADO_LEADS_URL = 'https://api.cortado.pro/api/v1/ext/leads';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function trim(value, max) {
  const text = String(value == null ? '' : value).trim();
  if (!text) return '';
  return max ? text.slice(0, max) : text;
}

function asInt(value) {
  const n = Number.parseInt(String(value == null ? '' : value).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

function asNumber(value) {
  const n = Number.parseFloat(String(value == null ? '' : value));
  return Number.isFinite(n) ? n : null;
}

/** Normalize to HH:MM (24h). Accepts "10:00", "10:00:00", "9", "9am", "10:30 AM". */
function normalizeEventTime(value) {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';

  const ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)$/i);
  if (ampm) {
    let h = Number.parseInt(ampm[1], 10);
    const m = ampm[2] ? Number.parseInt(ampm[2], 10) : 0;
    const meridiem = ampm[3].toLowerCase();
    if (meridiem === 'pm' && h < 12) h += 12;
    if (meridiem === 'am' && h === 12) h = 0;
    if (h > 23 || m > 59) return '';
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  const twentyFour = raw.match(/^(\d{1,2})(?::(\d{2}))(?::\d{2})?$/);
  if (twentyFour) {
    const h = Number.parseInt(twentyFour[1], 10);
    const m = Number.parseInt(twentyFour[2], 10);
    if (h > 23 || m > 59) return '';
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  const hourOnly = raw.match(/^(\d{1,2})$/);
  if (hourOnly) {
    const h = Number.parseInt(hourOnly[1], 10);
    if (h > 23) return '';
    return String(h).padStart(2, '0') + ':00';
  }

  return '';
}

function buildAdditionalInfo(body) {
  const bits = [];
  const tier = trim(body.tier_label || body.tier, 100);
  if (tier) bits.push('Setup: ' + tier);
  const hours = trim(body.duration_hours || body.event_duration_hours, 20);
  if (hours) bits.push('Hours: ' + hours);
  const guests = trim(body.guest_count || body.event_guest_count, 20);
  if (guests) bits.push('Guests: ' + guests);
  const zip = trim(body.event_zip, 20);
  if (zip) bits.push('ZIP: ' + zip);
  const city = trim(body.event_city, 100);
  if (city) bits.push('City: ' + city);
  const budget = trim(body.budget, 40);
  if (budget) bits.push('Budget: ' + budget);
  const note = trim(body.additional_info || body.notes || body.contact_note, 4000);
  if (note) bits.push(note);
  return bits.join('\n').slice(0, 5000);
}

function buildPayload(body) {
  const email = trim(body.customer_email || body.email, 320);
  const eventDate = trim(body.event_date || body.date, 32);
  if (!email || !eventDate) {
    return { error: 'customer_email and event_date are required' };
  }

  const payload = {
    customer_email: email,
    event_date: eventDate,
    timezone: trim(body.timezone, 64) || 'America/New_York'
  };

  const name = trim(body.customer_name || body.name, 200);
  if (name) payload.customer_name = name;

  const phone = trim(body.customer_phone || body.phone, 50);
  if (phone) payload.customer_phone = phone;

  const company = trim(body.company_name || body.company, 200);
  if (company) payload.company_name = company;

  // Cortado Create Lead currently requires event_time (docs still say optional).
  // Book-preview collects duration, not a clock start — default when missing.
  const time = normalizeEventTime(
    body.event_time || body.eventTime || body.start_time || body.time
  );
  payload.event_time = time || '10:00';

  const guests = asInt(body.event_guest_count || body.guest_count || body.guests);
  if (guests != null && guests >= 0) payload.event_guest_count = guests;

  const hours = asNumber(body.event_duration_hours || body.duration_hours || body.hours);
  if (hours != null && hours >= 0) payload.event_duration_hours = hours;

  const eventType = trim(body.event_type || body.tier_label || body.tier, 100);
  if (eventType) payload.event_type = eventType;

  const location = trim(
    body.event_location ||
      [trim(body.event_city, 100), trim(body.event_zip, 20)].filter(Boolean).join(', ') ||
      body.location,
    500
  );
  if (location) payload.event_location = location;

  const additional = buildAdditionalInfo(body);
  if (additional) payload.additional_info = additional;

  const attribution = {};
  const attrs = body.attribution && typeof body.attribution === 'object' ? body.attribution : body;
  [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
    'referrer_url',
    'landing_page_url'
  ].forEach(function (key) {
    const value = trim(attrs[key], 1000);
    if (value) attribution[key] = value;
  });
  if (Object.keys(attribution).length) payload.attribution = attribution;

  return { payload };
}

export async function onRequestPost(context) {
  const apiKey = context.env && context.env.CORTADO_API_KEY;
  if (!apiKey) {
    return json(503, {
      ok: false,
      error: 'intake_unconfigured',
      message: 'CORTADO_API_KEY is not set on this Pages project.'
    });
  }

  let body;
  try {
    body = await context.request.json();
  } catch (err) {
    return json(400, { ok: false, error: 'invalid_json', message: 'Body must be JSON.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(400, { ok: false, error: 'invalid_body', message: 'Body must be a JSON object.' });
  }

  const built = buildPayload(body);
  if (built.error) {
    return json(400, { ok: false, error: 'invalid_field', message: built.error });
  }

  const idempotency =
    trim(context.request.headers.get('Idempotency-Key') || body.idempotency_key, 255) ||
    crypto.randomUUID();

  let upstream;
  try {
    upstream = await fetch(CORTADO_LEADS_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotency
      },
      body: JSON.stringify(built.payload)
    });
  } catch (err) {
    return json(502, {
      ok: false,
      error: 'upstream_unreachable',
      message: 'Could not reach Cortado.'
    });
  }

  let data = null;
  const text = await upstream.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = { raw: text };
  }

  if (upstream.status === 202) {
    return json(202, {
      ok: true,
      status: 'accepted',
      submission_id: data && data.submission_id ? data.submission_id : null,
      idempotency_key: idempotency
    });
  }

  return json(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
    ok: false,
    error: (data && data.error) || 'cortado_error',
    message: (data && data.message) || 'Cortado rejected the lead.',
    details: data
  });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type, idempotency-key',
        'access-control-max-age': '86400'
      }
    });
  }
  if (context.request.method !== 'POST') {
    return json(405, { ok: false, error: 'method_not_allowed' });
  }
  return onRequestPost(context);
}
