(function () {
  'use strict';

  var calc = window.JudeBooking;
  if (!calc) return;

  var state = {
    tier: 'standard',
    guests: 0,
    hours: 0,
    location: '',
    miles: null,
    addOns: 0
  };

  var els = {
    form: document.getElementById('live-quote-form'),
    guests: document.getElementById('lq-guests'),
    hours: document.getElementById('lq-hours'),
    location: document.getElementById('lq-location'),
    miles: document.getElementById('lq-miles'),
    addons: document.getElementById('lq-addons'),
    addonsWrap: document.getElementById('lq-addons-wrap'),
    tierBadge: document.getElementById('lq-tier-badge'),
    total: document.getElementById('lq-total'),
    subtotalNote: document.getElementById('lq-subtotal-note'),
    guard: document.getElementById('lq-guard'),
    meta: document.getElementById('lq-meta'),
    staffing: document.getElementById('lq-line-staffing'),
    resources: document.getElementById('lq-line-resources'),
    guestsLine: document.getElementById('lq-line-guests'),
    travel: document.getElementById('lq-line-travel'),
    addonsRow: document.getElementById('lq-line-addons-row'),
    addonsLine: document.getElementById('lq-line-addons'),
    subtotal: document.getElementById('lq-line-subtotal'),
    tax: document.getElementById('lq-line-tax'),
    totalLine: document.getElementById('lq-line-total'),
    tierButtons: Array.prototype.slice.call(document.querySelectorAll('.live-quote__tier'))
  };

  function readInputs() {
    var guests = parseInt(els.guests.value, 10);
    var hours = parseFloat(els.hours.value);
    var milesRaw = els.miles.value.trim();
    var addOns = parseInt(els.addons.value, 10);

    state.guests = Number.isFinite(guests) && guests > 0 ? guests : 0;
    state.hours = Number.isFinite(hours) && hours > 0 ? hours : 0;
    state.location = (els.location.value || '').trim();
    state.miles = milesRaw === '' ? null : Math.max(0, parseFloat(milesRaw) || 0);
    state.addOns = Number.isFinite(addOns) && addOns > 0 ? addOns : 0;
  }

  function setTier(tier) {
    state.tier = tier;
    els.tierButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-tier') === tier;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    els.addonsWrap.hidden = tier !== 'premium';
    render();
  }

  function dash() {
    return '—';
  }

  function render() {
    readInputs();
    var label = calc.TIER_LABELS[state.tier] || state.tier;
    els.tierBadge.textContent = label;

    var result = calc.calculate({
      tier: state.tier,
      guestCount: state.guests,
      durationHours: state.hours,
      roundTripMiles: state.miles,
      addOnCount: state.addOns
    });

    var b = result.breakdown;

    if (!result.ready) {
      els.total.textContent = dash();
      els.subtotalNote.textContent = 'Fill in guests and service time to see a live quote.';
      els.staffing.textContent = dash();
      els.resources.textContent = dash();
      els.guestsLine.textContent = dash();
      els.travel.textContent = state.miles == null ? 'TBD' : calc.formatMoney(0);
      els.addonsRow.hidden = state.tier !== 'premium';
      els.addonsLine.textContent = dash();
      els.subtotal.textContent = dash();
      els.tax.textContent = dash();
      els.totalLine.textContent = dash();
      els.guard.hidden = true;
      els.meta.textContent = state.location
        ? ('Location: ' + state.location)
        : '';
      return;
    }

    els.total.textContent = calc.formatMoney(result.total);
    els.subtotalNote.textContent = b.minimumApplied
      ? 'Pre-tax subtotal includes the $500 minimum.'
      : ('Pre-tax subtotal ' + calc.formatMoney(result.quotedSubtotal));

    els.staffing.textContent =
      calc.formatMoney(b.staffing) +
      ' (' + b.staffCount + ' × $' + b.staffingRate + '/hr × ' + state.hours + ' hr)';
    els.resources.textContent =
      calc.formatMoney(b.resourceFee) +
      ' (' + b.resourceCount + ' × ' + calc.formatMoney(b.resourceFee / Math.max(1, b.resourceCount)) + ')';
    els.guestsLine.textContent =
      calc.formatMoney(b.perGuest) +
      ' (' + state.guests + ' × ' +
      calc.formatMoney(calc.RATES[state.tier].perGuest) + ')';

    if (b.travelPending) {
      els.travel.textContent = 'TBD — add round-trip miles';
    } else {
      els.travel.textContent =
        calc.formatMoney(b.travel) +
        ' (' + state.miles + ' mi × $' + calc.RATES.travelRatePerMile.toFixed(2) + ')';
    }

    if (state.tier === 'premium') {
      els.addonsRow.hidden = false;
      els.addonsLine.textContent = b.addOnCount
        ? (calc.formatMoney(b.addOns) + ' (' + b.addOnCount + ' × $250)')
        : calc.formatMoney(0);
    } else {
      els.addonsRow.hidden = true;
    }

    els.subtotal.textContent = calc.formatMoney(result.quotedSubtotal);
    els.tax.textContent = calc.formatMoney(result.tax);
    els.totalLine.textContent = calc.formatMoney(result.total);

    els.guard.hidden = !result.overCapacity;

    var metaParts = [];
    if (state.location) metaParts.push('Location: ' + state.location);
    metaParts.push(
      Math.round(result.drinksPerHour * 10) / 10 + ' guests/hr' +
      (result.overCapacity ? ' (over capacity guide)' : '')
    );
    els.meta.textContent = metaParts.join(' · ');
  }

  els.tierButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTier(btn.getAttribute('data-tier'));
    });
  });

  ['input', 'change'].forEach(function (evt) {
    els.form.addEventListener(evt, render);
  });

  setTier('standard');
})();
