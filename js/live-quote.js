(function () {
  'use strict';

  var calc = window.JudeBooking;
  if (!calc) return;

  /** Central FL hubs — instant suggestions before Nominatim returns. */
  var LOCAL_PLACES = [
    { label: 'Lakeland, FL', lat: 28.0395, lng: -81.9498 },
    { label: 'Orlando, FL', lat: 28.5383, lng: -81.3792 },
    { label: 'Tampa, FL', lat: 27.9506, lng: -82.4572 },
    { label: 'St. Petersburg, FL', lat: 27.7676, lng: -82.6403 },
    { label: 'Clearwater, FL', lat: 27.9659, lng: -82.8001 },
    { label: 'Kissimmee, FL', lat: 28.2916, lng: -81.4076 },
    { label: 'Winter Haven, FL', lat: 28.0222, lng: -81.7329 },
    { label: 'Plant City, FL', lat: 28.0186, lng: -82.1129 },
    { label: 'Brandon, FL', lat: 27.9378, lng: -82.2859 },
    { label: 'Clermont, FL', lat: 28.5494, lng: -81.7729 },
    { label: 'Bartow, FL', lat: 27.8964, lng: -81.8431 },
    { label: 'Auburndale, FL', lat: 28.0653, lng: -81.7887 },
    { label: 'Sarasota, FL', lat: 27.3364, lng: -82.5307 },
    { label: 'Bradenton, FL', lat: 27.4989, lng: -82.5748 },
    { label: 'Sebring, FL', lat: 27.4956, lng: -81.4409 },
    { label: 'Celebration, FL', lat: 28.3200, lng: -81.5500 },
    { label: 'Davenport, FL', lat: 28.1614, lng: -81.6017 },
    { label: 'Haines City, FL', lat: 28.1142, lng: -81.6179 },
    { label: 'Lake Wales, FL', lat: 27.9014, lng: -81.5859 },
    { label: 'Wesley Chapel, FL', lat: 28.2397, lng: -82.3279 }
  ];

  var state = {
    tier: 'standard',
    guests: 0,
    hours: 0,
    location: '',
    miles: null,
    distanceStatus: 'idle',
    addOns: 0
  };

  var placeTimer = 0;
  var placeSeq = 0;
  var geocodeTimer = 0;
  var geocodeSeq = 0;
  var placeActive = -1;

  var els = {
    form: document.getElementById('live-quote-form'),
    guests: document.getElementById('lq-guests'),
    hours: document.getElementById('lq-hours'),
    location: document.getElementById('lq-location'),
    suggestList: document.getElementById('lq-suggest-list'),
    distance: document.getElementById('lq-distance'),
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

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function roundTripFromCoords(lat, lng) {
    var oneWay = calc.haversineMiles(calc.ORIGIN.lat, calc.ORIGIN.lng, lat, lng);
    return Math.round(oneWay * 2 * 10) / 10;
  }

  function readInputs() {
    var guests = parseInt(els.guests.value, 10);
    var hours = parseFloat(els.hours.value);
    var addOns = parseInt(els.addons.value, 10);

    state.guests = Number.isFinite(guests) && guests > 0 ? guests : 0;
    state.hours = Number.isFinite(hours) && hours > 0 ? hours : 0;
    state.location = (els.location.value || '').trim();
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

  function updateDistanceStatus() {
    if (!els.distance) return;
    if (state.distanceStatus === 'calculating') {
      els.distance.textContent = 'Calculating round-trip from Lakeland…';
      return;
    }
    if (state.distanceStatus === 'ready' && state.miles != null) {
      els.distance.textContent =
        '~' + state.miles + ' mi round trip from Lakeland · travel ' +
        calc.formatMoney(calc.travelFeeFromRoundTrip(state.miles));
      return;
    }
    if (state.distanceStatus === 'error') {
      els.distance.textContent = 'Couldn’t map that yet — try a city or fuller address.';
      return;
    }
    els.distance.textContent = state.location
      ? 'Pick a suggestion (or finish typing) to lock travel miles.'
      : 'Type a city or address — distance fills in automatically.';
  }

  function render() {
    readInputs();
    updateDistanceStatus();
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
      els.travel.textContent = state.miles == null ? 'TBD' : calc.formatMoney(calc.travelFeeFromRoundTrip(state.miles || 0));
      els.addonsRow.hidden = state.tier !== 'premium';
      els.addonsLine.textContent = dash();
      els.subtotal.textContent = dash();
      els.tax.textContent = dash();
      els.totalLine.textContent = dash();
      els.guard.hidden = true;
      els.meta.textContent = state.location ? ('Location: ' + state.location) : '';
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
      els.travel.textContent = 'TBD — pick a location';
    } else {
      els.travel.textContent =
        calc.formatMoney(b.travel) +
        ' (' + state.miles + ' mi RT × $' + calc.RATES.travelRatePerMile.toFixed(2) + ')';
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
    if (state.location) metaParts.push(state.location);
    if (state.miles != null) metaParts.push(state.miles + ' mi RT');
    metaParts.push(
      Math.round(result.drinksPerHour * 10) / 10 + ' guests/hr' +
      (result.overCapacity ? ' (over capacity guide)' : '')
    );
    els.meta.textContent = metaParts.join(' · ');
  }

  function placeSuggestionLabel(row) {
    var address = row.address || {};
    var city = address.city || address.town || address.village || address.hamlet || address.municipality;
    var st = address.state;
    var road = address.road || address.pedestrian;
    if (address.house_number && road && city && st) {
      return address.house_number + ' ' + road + ', ' + city + ', ' + st;
    }
    if (road && city && st) return road + ', ' + city + ', ' + st;
    if (city && st) return city + ', ' + st;
    var parts = String(row.display_name || '').split(',').map(function (part) {
      return part.trim();
    }).filter(Boolean);
    if (parts.length >= 3 && /united states/i.test(parts[parts.length - 1])) {
      return parts[0] + ', ' + parts[parts.length - 2];
    }
    return parts.slice(0, 2).join(', ');
  }

  function hidePlaceSuggest() {
    placeActive = -1;
    els.suggestList.hidden = true;
    els.suggestList.innerHTML = '';
    els.location.setAttribute('aria-expanded', 'false');
  }

  function paintPlaceActive() {
    var options = els.suggestList.querySelectorAll('[data-place-label]');
    Array.prototype.forEach.call(options, function (option, i) {
      var on = i === placeActive;
      option.classList.toggle('is-active', on);
      if (on) option.scrollIntoView({ block: 'nearest' });
    });
  }

  function localMatches(query) {
    var q = query.toLowerCase();
    return LOCAL_PLACES.filter(function (place) {
      return place.label.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 5);
  }

  function renderPlaceSuggest(items) {
    if (!items.length) {
      hidePlaceSuggest();
      return;
    }
    placeActive = -1;
    els.suggestList.innerHTML = items.map(function (item) {
      return (
        '<li role="presentation">' +
          '<button type="button" class="live-quote__suggest-option" role="option"' +
          ' data-place-label="' + escapeHtml(item.label) + '"' +
          ' data-lat="' + item.lat + '"' +
          ' data-lng="' + item.lng + '">' +
          escapeHtml(item.label) +
          '</button>' +
        '</li>'
      );
    }).join('');
    els.suggestList.hidden = false;
    els.location.setAttribute('aria-expanded', 'true');
  }

  function applyPlace(label, lat, lng) {
    els.location.value = label;
    state.location = label;
    hidePlaceSuggest();
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      state.miles = roundTripFromCoords(lat, lng);
      state.distanceStatus = 'ready';
      render();
      return;
    }
    scheduleGeocode();
  }

  function schedulePlaceSuggest() {
    window.clearTimeout(placeTimer);
    var query = String(els.location.value || '').trim();
    if (query.length < 2) {
      hidePlaceSuggest();
      return;
    }

    var locals = localMatches(query).map(function (place) {
      return { label: place.label, lat: place.lat, lng: place.lng };
    });
    if (locals.length) renderPlaceSuggest(locals);

    placeTimer = window.setTimeout(function () {
      fetchPlaceSuggest(query, locals);
    }, 280);
  }

  function fetchPlaceSuggest(query, locals) {
    var seq = ++placeSeq;
    var bias = query + (/,\s*(fl|florida)\b/i.test(query) ? '' : ', Florida');
    var url =
      'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6' +
      '&countrycodes=us&q=' + encodeURIComponent(bias);
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('suggest ' + res.status);
        return res.json();
      })
      .then(function (rows) {
        if (seq !== placeSeq || document.activeElement !== els.location) return;
        var seen = {};
        var items = (locals || []).slice();
        items.forEach(function (item) {
          seen[item.label.toLowerCase()] = true;
        });
        (rows || []).forEach(function (row) {
          var label = placeSuggestionLabel(row);
          var lat = parseFloat(row.lat);
          var lng = parseFloat(row.lon);
          if (!label || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
          if (seen[label.toLowerCase()]) return;
          seen[label.toLowerCase()] = true;
          items.push({ label: label, lat: lat, lng: lng });
        });
        renderPlaceSuggest(items.slice(0, 6));
      })
      .catch(function () {
        if (seq !== placeSeq) return;
        if (!(locals && locals.length)) hidePlaceSuggest();
      });
  }

  function scheduleGeocode() {
    window.clearTimeout(geocodeTimer);
    var address = String(els.location.value || '').trim();
    if (address.length < 2) {
      state.miles = null;
      state.distanceStatus = 'idle';
      render();
      return;
    }

    var exactLocal = LOCAL_PLACES.find(function (place) {
      return place.label.toLowerCase() === address.toLowerCase();
    });
    if (exactLocal) {
      applyPlace(exactLocal.label, exactLocal.lat, exactLocal.lng);
      return;
    }

    state.distanceStatus = 'calculating';
    render();
    geocodeTimer = window.setTimeout(function () {
      geocodeAddress(address);
    }, 550);
  }

  function geocodeAddress(address) {
    var seq = ++geocodeSeq;
    var query = address + (/,\s*(fl|florida)\b/i.test(address) ? '' : ', Florida');
    var url =
      'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=' +
      encodeURIComponent(query);
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('geocode ' + res.status);
        return res.json();
      })
      .then(function (rows) {
        if (seq !== geocodeSeq) return;
        if (!rows || !rows[0]) throw new Error('no result');
        var lat = parseFloat(rows[0].lat);
        var lng = parseFloat(rows[0].lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('bad coords');
        state.miles = roundTripFromCoords(lat, lng);
        state.distanceStatus = 'ready';
        state.location = String(els.location.value || '').trim();
        render();
      })
      .catch(function () {
        if (seq !== geocodeSeq) return;
        state.miles = null;
        state.distanceStatus = 'error';
        render();
      });
  }

  els.tierButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTier(btn.getAttribute('data-tier'));
    });
  });

  els.form.addEventListener('input', function (event) {
    if (event.target === els.location) {
      state.miles = null;
      state.distanceStatus = 'idle';
      schedulePlaceSuggest();
      render();
      return;
    }
    render();
  });

  els.form.addEventListener('change', function (event) {
    if (event.target === els.location) return;
    render();
  });

  els.location.addEventListener('keydown', function (event) {
    var open = !els.suggestList.hidden;
    var options = els.suggestList.querySelectorAll('[data-place-label]');
    if (open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      var count = options.length;
      if (!count) return;
      placeActive = event.key === 'ArrowDown'
        ? Math.min(count - 1, placeActive + 1)
        : Math.max(0, placeActive - 1);
      paintPlaceActive();
      return;
    }
    if (open && event.key === 'Escape') {
      event.preventDefault();
      hidePlaceSuggest();
      return;
    }
    if (event.key === 'Enter') {
      if (open && options.length) {
        event.preventDefault();
        var picked = options[placeActive >= 0 ? placeActive : 0];
        applyPlace(
          picked.getAttribute('data-place-label'),
          parseFloat(picked.getAttribute('data-lat')),
          parseFloat(picked.getAttribute('data-lng'))
        );
        return;
      }
      event.preventDefault();
      hidePlaceSuggest();
      scheduleGeocode();
    }
  });

  els.location.addEventListener('blur', function () {
    window.setTimeout(function () {
      if (document.activeElement === els.location) return;
      hidePlaceSuggest();
      if (state.distanceStatus !== 'ready') scheduleGeocode();
    }, 160);
  });

  els.suggestList.addEventListener('mousedown', function (event) {
    var option = event.target.closest('[data-place-label]');
    if (!option) return;
    event.preventDefault();
    applyPlace(
      option.getAttribute('data-place-label'),
      parseFloat(option.getAttribute('data-lat')),
      parseFloat(option.getAttribute('data-lng'))
    );
  });

  setTier('standard');
})();
