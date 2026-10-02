(function () {
  'use strict';

  var calc = window.JudeBooking;
  if (!calc) return;

  var CAPACITY_NOTE = 'For this many guests in this window, we\'d usually recommend more time or an extra staff member — we\'ll follow up with the right setup before confirming.';

  var ADD_ONS = [
    { id: 'stamp', title: 'Custom stamp', image: '/images/book-table.jpg' },
    { id: 'menu_design', title: 'Custom menu design', image: '/images/book-table.jpg' },
    { id: 'stamp_design', title: 'Custom stamp design', image: '/images/book-latte.jpg' },
    { id: 'specialty_drink', title: 'Custom drink', image: '/images/book-hand.jpg' }
  ];

  var COLLAB_MAILTO = 'mailto:info@judecoffee.com?subject=' +
    encodeURIComponent('Event budget') +
    '&body=' +
    encodeURIComponent('Hi Jude team,\n\nBudget doesn\'t quite line up with the packages — I\'d still love to tell you about the event.\n\n');

  var TIER_CARDS = [
    {
      id: 'lean',
      title: 'Base',
      image: '/images/book-base.jpg',
      extraClass: 'booking-tier-row--base',
      includes: ['Cold brew', 'Iced coffee', 'Hot drip']
    },
    {
      id: 'standard',
      title: 'Signature',
      image: '/images/book-signature.jpg',
      extraClass: 'booking-tier-row--signature',
      includes: ['Lattes & cappuccinos', 'Cold brew', 'Drip']
    },
    {
      id: 'premium',
      title: 'Curated',
      image: '/images/book-curated.jpg',
      extraClass: 'booking-tier-row--curated',
      includes: ['Full espresso bar', 'Custom drink', 'Menu & stamp']
    }
  ];

  var state = {
    tier: null,
    guestCount: '',
    durationHours: '',
    addOns: [],
    eventDate: '',
    locationAddress: '',
    locationMiles: null,
    locationStatus: 'idle',
    budget: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    partialCaptured: false,
    submitted: false
  };

  var steps = [];
  var index = 0;
  var animating = false;
  var displayedAmount = 0;
  var amountFrame = 0;
  var geocodeTimer = 0;
  var geocodeSeq = 0;

  var stage = document.getElementById('booking-stage');
  var pageEl = document.getElementById('booking-page');
  var estimateEl = document.getElementById('booking-estimate');
  var estimateLabel = document.getElementById('booking-estimate-label');
  var estimateValue = document.getElementById('booking-estimate-value');
  var prevBtn = document.getElementById('booking-prev');
  var nextBtn = document.getElementById('booking-next');
  var tiersEl = document.getElementById('booking-tiers');
  var mediaAmount = document.getElementById('booking-media-amount');
  var mediaCopy = document.getElementById('booking-media-copy');
  var mediaEyebrow = document.getElementById('booking-media-eyebrow');

  function el(html) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function firstName() {
    var name = String(state.contactName || '').trim();
    return name ? name.split(/\s+/)[0] : '';
  }

  function questionTitle(title) {
    return '<h2 class="booking-question">' + title + '</h2>';
  }

  function tierById(id) {
    var i;
    for (i = 0; i < TIER_CARDS.length; i++) {
      if (TIER_CARDS[i].id === id) return TIER_CARDS[i];
    }
    return null;
  }

  function chevron(dir) {
    if (dir === 'up') return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg>';
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
  }

  function stepperField(opts) {
    return (
      '<div class="booking-stepper">' +
        '<label class="booking-label" for="' + opts.id + '">' + opts.label + '</label>' +
        '<div class="booking-stepper__row">' +
          '<input class="booking-input booking-input--stepper"' +
            ' id="' + opts.id + '"' +
            ' name="' + opts.id + '"' +
            ' type="number"' +
            ' inputmode="' + (opts.inputmode || 'numeric') + '"' +
            ' min="' + (opts.min || '1') + '"' +
            ' step="' + (opts.step || '1') + '"' +
            (opts.value ? ' value="' + escapeHtml(opts.value) + '"' : '') +
          '>' +
          '<div class="booking-stepper__btns">' +
            '<button type="button" class="booking-stepper__btn" data-step-for="' + opts.id + '" data-step-dir="1" data-step-amt="' + (opts.step || '1') + '" aria-label="Increase ' + opts.label + '">' + chevron('up') + '</button>' +
            '<button type="button" class="booking-stepper__btn" data-step-for="' + opts.id + '" data-step-dir="-1" data-step-amt="' + (opts.step || '1') + '" aria-label="Decrease ' + opts.label + '">' + chevron('down') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function continueArrow(aria) {
    return (
      '<div class="booking-actions">' +
        '<button type="button" class="booking-ok booking-ok--arrow" data-ok aria-label="' + (aria || 'Continue') + '">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>' +
        '</button>' +
      '</div>'
    );
  }

  function lockedInButton() {
    return (
      '<div class="booking-actions booking-actions--submit">' +
        '<button type="button" class="booking-ok booking-ok--label" data-ok>Submit Estimate for Approval</button>' +
      '</div>'
    );
  }

  function inputBlock(opts) {
    return (
      '<div class="booking-field">' +
        (opts.label ? '<label class="booking-label" for="' + opts.id + '">' + opts.label + '</label>' : '') +
        '<input class="booking-input"' +
          ' id="' + opts.id + '"' +
          ' name="' + (opts.name || opts.id) + '"' +
          (opts.type ? ' type="' + opts.type + '"' : '') +
          (opts.inputmode ? ' inputmode="' + opts.inputmode + '"' : '') +
          (opts.autocomplete ? ' autocomplete="' + opts.autocomplete + '"' : '') +
          (opts.placeholder ? ' placeholder="' + opts.placeholder + '"' : '') +
          (opts.min ? ' min="' + opts.min + '"' : '') +
          (opts.step ? ' step="' + opts.step + '"' : '') +
          (opts.value ? ' value="' + escapeHtml(opts.value) + '"' : '') +
        '>' +
        (opts.hint ? '<p class="booking-hint" data-hint>' + opts.hint + '</p>' : '') +
        (opts.error !== false ? '<p class="booking-error" data-error hidden></p>' : '') +
      '</div>'
    );
  }

  function buildSteps() {
    var list = [{ id: 'welcome' }, { id: 'path' }];
    if (state.tier === 'premium') list.push({ id: 'addons' });
    list.push({ id: 'details' });
    list.push({ id: 'contact' });
    list.push({ id: 'review' });
    list.push({ id: 'done' });
    return list;
  }

  function renderStep(step) {
    var node;
    switch (step.id) {
      case 'welcome':
        node = el(
          '<section class="booking-step booking-welcome" data-step="welcome">' +
            '<div class="booking-welcome__stage">' +
              '<span class="booking-welcome__media" aria-hidden="true">' +
                '<img src="/images/book-welcome.jpg" alt="" width="1200" height="1800">' +
                '<span class="booking-welcome__shade"></span>' +
              '</span>' +
              '<div class="booking-step__inner booking-step__inner--welcome">' +
                '<h1 class="booking-question">' +
                  '<span class="booking-welcome__lockup">' +
                    '<span class="booking-welcome__lead">Let\'s talk about</span>' +
                    '<span class="booking-welcome__line">' +
                      'your event.' +
                      '<button type="button" class="booking-ok booking-ok--arrow booking-ok--bare" data-ok aria-label="Start">' +
                        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>' +
                      '</button>' +
                    '</span>' +
                  '</span>' +
                '</h1>' +
              '</div>' +
            '</div>' +
            '<footer class="booking-welcome__footer">' +
              '<a href="mailto:info@judecoffee.com" class="booking-welcome__footer-email">info@judecoffee.com</a>' +
              '<p class="booking-welcome__footer-tagline">Coffee Anytime Coffee Anywhere</p>' +
            '</footer>' +
          '</section>'
        );
        break;
      case 'path':
        node = el(
          '<section class="booking-step booking-step--fill" data-step="path">' +
            '<div class="booking-step__inner booking-step__inner--wide booking-step__inner--fill">' +
              questionTitle('We\'ve got options.') +
              '<div class="booking-path-list" role="listbox" aria-label="Setup">' +
                TIER_CARDS.map(function (item) { return tierRow(item); }).join('') +
              '</div>' +
              customQuoteBox() +
              budgetNote() +
              '<p class="booking-error" data-error hidden></p>' +
            '</div>' +
          '</section>'
        );
        break;
      case 'budget':
        node = el(
          '<section class="booking-step" data-step="budget">' +
            '<div class="booking-step__inner">' +
              questionTitle('What budget are you working with?') +
              inputBlock({ id: 'booking-budget', label: 'Event budget', type: 'text', inputmode: 'numeric', placeholder: 'e.g. 1800', value: state.budget }) +
              continueArrow() +
            '</div>' +
          '</section>'
        );
        break;
      case 'details':
        node = el(
          '<section class="booking-step" data-step="details">' +
            '<div class="booking-step__inner">' +
              questionTitle('Tell us about the event.') +
              '<div class="booking-details">' +
                '<div class="booking-details__pair">' +
                  stepperField({ id: 'booking-guests', label: 'Guests', inputmode: 'numeric', min: '1', step: '1', value: state.guestCount }) +
                  stepperField({ id: 'booking-hours', label: 'Hours', inputmode: 'decimal', min: '1', step: '0.5', value: state.durationHours }) +
                '</div>' +
                '<p class="booking-hint' + (overCapacity() ? '' : ' is-hidden') + '" data-capacity>' + CAPACITY_NOTE + '</p>' +
                calendarMarkup() +
                inputBlock({
                  id: 'booking-location',
                  label: 'Address',
                  type: 'text',
                  autocomplete: 'street-address',
                  placeholder: 'Street, city',
                  value: state.locationAddress,
                  error: false
                }) +
                '<p class="booking-hint" data-travel-status>' + travelHint() + '</p>' +
                '<p class="booking-error" data-error hidden></p>' +
              '</div>' +
            '</div>' +
          '</section>'
        );
        break;
      case 'addons':
        node = el(
          '<section class="booking-step booking-step--fill" data-step="addons">' +
            '<div class="booking-step__inner booking-step__inner--wide booking-step__inner--fill">' +
              questionTitle('Want anything extra?') +
              '<div class="booking-path-list" role="group" aria-label="Extras">' +
                ADD_ONS.map(function (item) { return addonRow(item); }).join('') +
              '</div>' +
              '<button type="button" class="booking-skip" data-ok>Skip</button>' +
            '</div>' +
          '</section>'
        );
        break;
      case 'contact':
        node = el(
          '<section class="booking-step" data-step="contact">' +
            '<div class="booking-step__inner">' +
              questionTitle(firstName() ? 'Ok, ' + escapeHtml(firstName()) + ' — how can we reach you?' : 'How can we reach you?') +
              inputBlock({ id: 'booking-name', label: 'Name', type: 'text', autocomplete: 'name', placeholder: 'Jane', value: state.contactName, error: false }) +
              inputBlock({ id: 'booking-email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'name@example.com', value: state.contactEmail, error: false }) +
              inputBlock({ id: 'booking-phone', label: 'Phone', type: 'tel', autocomplete: 'tel', placeholder: '(863) 555-0100', value: state.contactPhone, error: false }) +
              '<p class="booking-error" data-error hidden></p>' +
              continueArrow() +
            '</div>' +
          '</section>'
        );
        break;
      case 'review':
        node = el(
          '<section class="booking-step booking-step--review" data-step="review">' +
            '<div class="booking-step__inner">' +
              questionTitle('Want this locked in?') +
              '<p class="booking-lead">Our team will take a look and confirm for your event.</p>' +
              reviewCard() +
              lockedInButton() +
            '</div>' +
          '</section>'
        );
        break;
      default:
        node = el(
          '<section class="booking-step booking-done" data-step="done">' +
            '<div class="booking-step__inner">' +
              '<h2 class="booking-question">We\'ve got it' + (firstName() ? ', ' + escapeHtml(firstName()) : '') + '.</h2>' +
              '<p class="booking-lead">The Jude team will confirm from Lakeland. This preview doesn\'t send anything yet.</p>' +
            '</div>' +
          '</section>'
        );
    }
    return node;
  }

  function includeList(items) {
    return '<ul class="booking-include">' + items.map(function (line) {
      return '<li>' + escapeHtml(line) + '</li>';
    }).join('') + '</ul>';
  }

  function overlayCard(opts) {
    var tag = opts.href ? 'a' : 'button';
    var selected = opts.selected ? ' is-selected' : '';
    var extraClass = opts.extraClass ? ' ' + opts.extraClass : '';
    var attrs = opts.href
      ? ' href="' + opts.href + '"'
      : ' type="button"';
    if (opts.data) attrs += ' ' + opts.data;
    if (opts.role) attrs += ' role="' + opts.role + '" aria-selected="' + (opts.selected ? 'true' : 'false') + '"';
    var meta = '';
    if (opts.price || opts.includes) {
      meta =
        '<span class="booking-tier-row__meta">' +
          (opts.price
            ? '<span class="booking-tier-row__price">' +
                '<span class="booking-tier-row__price-label">rate starts at</span>' +
                '<span class="booking-tier-row__price-value">' + opts.price + '</span>' +
              '</span>'
            : '') +
          (opts.includes ? includeList(opts.includes) : '') +
        '</span>';
    }
    return (
      '<' + tag + ' class="booking-tier-row' + extraClass + selected + '"' + attrs + '>' +
        '<span class="booking-tier-row__media" aria-hidden="true">' +
          '<img src="' + opts.image + '" alt="" width="400" height="280">' +
          '<span class="booking-tier-row__shade"></span>' +
        '</span>' +
        '<span class="booking-tier-row__body">' +
          '<span class="booking-tier-row__heading">' +
            '<span class="booking-tier-row__title">' + escapeHtml(opts.title) + '</span>' +
            (opts.sub ? '<span class="booking-tier-row__sub">' + escapeHtml(opts.sub) + '</span>' : '') +
          '</span>' +
          (meta ? '<span class="booking-tier-row__detail">' + meta + '</span>' : '') +
        '</span>' +
      '</' + tag + '>'
    );
  }

  function tierRow(item) {
    return overlayCard({
      extraClass: (item.extraClass || '') + (item.id === 'lean' ? ' is-open' : ''),
      data: 'data-tier="' + item.id + '"',
      role: 'option',
      selected: state.tier === item.id,
      image: item.image,
      title: item.title,
      sub: item.sub,
      includes: item.includes,
      price: calc.formatMoney(calc.startingAmount(item.id))
    });
  }

  function addonRow(item) {
    return overlayCard({
      extraClass: 'booking-addon-row',
      data: 'data-addon="' + item.id + '"',
      selected: state.addOns.indexOf(item.id) >= 0,
      image: item.image,
      title: item.title,
      sub: item.sub
    });
  }

  function customQuoteBox() {
    return (
      '<a class="booking-custom" href="' + COLLAB_MAILTO + '">' +
        '<span class="booking-or">or</span>' +
        '<span class="booking-custom__title">Let us know your budget.</span>' +
      '</a>'
    );
  }

  function budgetNote() {
    return (
      '<div class="booking-budget-note">' +
        '<p class="booking-budget-note__lead">Budget doesn\'t quite line up with the packages above?</p>' +
        '<p class="booking-budget-note__body">Reach out <a class="booking-budget-note__link" href="' + COLLAB_MAILTO + '">here</a>. We set aside a limited number of spots each month for smaller local events and community partners we\'re excited to work with. No promises, but we\'d love to hear about yours.</p>' +
      '</div>'
    );
  }

  var calCursor = null;
  var calOpen = false;

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toISODate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function currentCalMonth() {
    if (calCursor) return calCursor;
    if (state.eventDate) {
      var parts = state.eventDate.split('-');
      if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    }
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  function calendarMarkup() {
    var cursor = currentCalMonth();
    var year = cursor.getFullYear();
    var month = cursor.getMonth();
    var firstDow = new Date(year, month, 1).getDay();
    var dim = new Date(year, month + 1, 0).getDate();
    var today = toISODate(new Date());
    var selected = state.eventDate;
    var label = new Date(year, month, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    var cells = [];
    var i;
    for (i = 0; i < firstDow; i++) cells.push('<span class="booking-cal__blank"></span>');
    for (i = 1; i <= dim; i++) {
      var iso = year + '-' + pad2(month + 1) + '-' + pad2(i);
      var cls = 'booking-cal__day';
      if (iso === selected) cls += ' is-selected';
      if (iso === today) cls += ' is-today';
      if (iso < today) cls += ' is-past';
      cells.push(
        '<button type="button" class="' + cls + '" data-pick-date="' + iso + '"' +
          (iso < today ? ' disabled' : '') +
          ' aria-pressed="' + (iso === selected) + '">' + i + '</button>'
      );
    }
    var dateLabel = selected ? formatEventDate(selected) : 'Add a date';
    var panel = '';
    if (calOpen) {
      panel =
        '<div class="booking-cal__panel">' +
          '<div class="booking-cal__nav">' +
            '<p class="booking-cal__label">' + label + '</p>' +
            '<div class="booking-cal__shifts">' +
              '<button type="button" class="booking-stepper__btn" data-cal-shift="1" aria-label="Next month">' + chevron('up') + '</button>' +
              '<button type="button" class="booking-stepper__btn" data-cal-shift="-1" aria-label="Previous month">' + chevron('down') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="booking-cal__week" aria-hidden="true"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>' +
          '<div class="booking-cal__grid">' + cells.join('') + '</div>' +
        '</div>';
    }
    return (
      '<div class="booking-cal' + (calOpen ? ' is-open' : '') + '" data-cal>' +
        '<button type="button" class="booking-cal__toggle" data-cal-toggle>' +
          '<span class="booking-cal__toggle-copy">' +
            '<span class="booking-label">Date</span>' +
            '<span class="booking-cal__value">' + dateLabel + '</span>' +
          '</span>' +
          chevron(calOpen ? 'up' : 'down') +
        '</button>' +
        panel +
      '</div>'
    );
  }

  function paintCalendar() {
    var node = activeNode();
    var cal = node && node.querySelector('[data-cal]');
    if (!cal) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = calendarMarkup();
    cal.replaceWith(wrap.firstElementChild);
  }

  function nudgeStepper(id, dir, amt) {
    var input = document.getElementById(id);
    if (!input) return;
    var min = parseFloat(input.min);
    if (!Number.isFinite(min)) min = 1;
    var step = parseFloat(amt);
    if (!Number.isFinite(step) || step <= 0) step = 1;
    var current = parseFloat(input.value);
    if (!Number.isFinite(current)) current = dir > 0 ? 0 : min;
    var next = current + dir * step;
    if (next < min) next = min;
    if (id === 'booking-hours') next = Math.round(next * 2) / 2;
    else next = Math.round(next);
    input.value = String(next);
    readFields();
    refreshEstimate();
    clearError();
  }

  function travelHint() {
    if (state.locationStatus === 'calculating') return 'Calculating travel…';
    if (state.locationStatus === 'ready' && state.locationMiles != null) {
      return 'From Palmetto · first 5 miles free.';
    }
    if (state.locationStatus === 'error') return 'We\'ll add travel once we can map this address.';
    return 'From Palmetto · first 5 miles free.';
  }

  function quote() {
    return calc.calculate({
      tier: state.tier,
      guestCount: state.guestCount,
      durationHours: state.durationHours,
      addOns: state.addOns,
      locationMiles: state.locationMiles,
      budget: state.budget
    });
  }

  function overCapacity() {
    return quote().overCapacity;
  }

  function formatEventDate(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function breakdownRows(q) {
    var rows = [];
    var hours = state.durationHours || '—';
    if (q.breakdown.staffing) {
      var staffN = q.breakdown.staffCount || 1;
      rows.push([
        'Staffing (' + staffN + ' × ' + calc.formatMoney(q.breakdown.staffingRate) + ' × ' + hours + ' hr)',
        calc.formatMoney(q.breakdown.staffing)
      ]);
    }
    if (q.breakdown.resourceFee) rows.push(['Resource', calc.formatMoney(q.breakdown.resourceFee)]);
    if (q.breakdown.perGuest) {
      var guestRate = calc.RATES[state.tier] ? calc.RATES[state.tier].perGuest : 0;
      rows.push(['Guests (' + state.guestCount + ' × $' + Number(guestRate).toFixed(2) + ')', calc.formatMoney(q.breakdown.perGuest)]);
    }
    if (q.breakdown.addOns) rows.push(['Add-ons', calc.formatMoney(q.breakdown.addOns)]);
    if (q.breakdown.travelPending) rows.push(['Travel', 'TBD']);
    else if (q.breakdown.travel) rows.push(['Travel', calc.formatMoney(q.breakdown.travel)]);
    else rows.push(['Travel', calc.formatMoney(0)]);
    if (q.breakdown.minimumApplied) rows.push(['Minimum', calc.formatMoney(calc.RATES.minimumCharge)]);
    return rows.map(function (row) {
      return '<div class="booking-summary__row"><span>' + row[0] + '</span><span>' + row[1] + '</span></div>';
    }).join('');
  }

  function reviewCard() {
    var q = quote();
    var tier = tierById(state.tier);
    var setup = tier ? tier.title + ' setup' : 'Your setup';
    var total = q.ready ? calc.formatMoney(q.amount) : (state.tier ? calc.formatMoney(calc.startingAmount(state.tier)) : '—');
    var facts = [];
    if (state.guestCount) facts.push(state.guestCount + ' guests');
    if (state.durationHours) facts.push(state.durationHours + ' hours');
    if (state.eventDate) facts.push(formatEventDate(state.eventDate));
    if (state.locationAddress) facts.push(escapeHtml(state.locationAddress));
    if (state.contactName) facts.push(escapeHtml(state.contactName));
    if (state.addOns.length) {
      facts.push(state.addOns.map(function (id) {
        return calc.RATES.addOns[id] ? calc.RATES.addOns[id].label : id;
      }).join(', '));
    }
    return (
      '<article class="booking-summary" data-review-card>' +
        '<div class="booking-summary__top">' +
          '<p class="booking-summary__setup">' + escapeHtml(setup) + '</p>' +
          '<p class="booking-summary__total">' + total + '</p>' +
        '</div>' +
        (tier ? '<p class="booking-summary__label">Included</p>' + includeList(tier.includes) : '') +
        (facts.length ? '<p class="booking-summary__label">Event</p><ul class="booking-summary__facts">' + facts.map(function (line) { return '<li>' + line + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="booking-summary__label">Breakdown</p>' +
        '<div class="booking-summary__breakdown">' + breakdownRows(q) + '</div>' +
      '</article>'
    );
  }

  function currentStep() {
    return steps[index];
  }

  function mount() {
    var keepId = currentStep() && currentStep().id;
    steps = buildSteps();
    if (keepId) {
      var nextIndex = steps.findIndex(function (s) { return s.id === keepId; });
      index = nextIndex >= 0 ? nextIndex : Math.min(index, steps.length - 1);
    }
    stage.innerHTML = '';
    steps.forEach(function (step, i) {
      var node = renderStep(step);
      if (i === index) node.classList.add('is-active');
      stage.appendChild(node);
    });
    syncChrome();
    focusActive();
    Array.prototype.forEach.call(stage.querySelectorAll('[data-step="path"]'), bindPathReveal);
  }

  function bindPathReveal(root) {
    if (root.getAttribute('data-path-bound') === '1') return;
    var inner = root.querySelector('.booking-step__inner--fill');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-tier]'));
    if (!inner || cards.length < 2) return;
    root.setAttribute('data-path-bound', '1');
    var last = -1;
    var lock = false;
    function setOpen(i) {
      if (i === last) return;
      lock = true;
      var card = cards[i];
      var topBefore = card.getBoundingClientRect().top;
      cards.forEach(function (el, n) {
        el.classList.toggle('is-open', n === i);
      });
      last = i;
      var topAfter = card.getBoundingClientRect().top;
      inner.scrollTop += topAfter - topBefore;
      lock = false;
    }
    function onScroll() {
      if (lock) return;
      var max = Math.max(1, inner.scrollHeight - inner.clientHeight);
      var t = inner.scrollTop / max;
      setOpen(t < 0.3 ? 0 : t < 0.65 ? 1 : 2);
    }
    function measure() {
      if (inner.clientHeight > 0) inner.style.setProperty('--path-view', inner.clientHeight + 'px');
    }
    var last = -1;
    function setOpen(i) {
      if (i === last) return;
      measure();
      cards.forEach(function (el, n) {
        el.classList.toggle('is-open', n === i);
      });
      last = i;
    }
    function onScroll() {
      measure();
      var max = Math.max(1, inner.scrollHeight - inner.clientHeight);
      var t = inner.scrollTop / max;
      setOpen(t < 0.3 ? 0 : t < 0.65 ? 1 : 2);
    }
    inner.addEventListener('scroll', onScroll, { passive: true });
    measure();
    setOpen(0);
  }

  function activeNode() {
    return stage.querySelector('.booking-step.is-active');
  }

  function showError(message) {
    var box = activeNode() && activeNode().querySelector('[data-error]');
    if (!box) return;
    box.hidden = false;
    box.classList.add('is-visible');
    box.textContent = message;
  }

  function clearError() {
    var box = activeNode() && activeNode().querySelector('[data-error]');
    if (!box) return;
    box.hidden = true;
    box.classList.remove('is-visible');
    box.textContent = '';
  }

  function fieldValue(node, id) {
    var input = node.querySelector('#' + id);
    return input ? input.value.trim() : '';
  }

  function readFields() {
    var node = activeNode();
    if (!node) return;
    var id = node.getAttribute('data-step');
    if (id === 'budget') state.budget = fieldValue(node, 'booking-budget');
    if (id === 'details') {
      state.guestCount = fieldValue(node, 'booking-guests');
      state.durationHours = fieldValue(node, 'booking-hours');
      state.locationAddress = fieldValue(node, 'booking-location');
    }
    if (id === 'contact') {
      state.contactName = fieldValue(node, 'booking-name');
      state.contactEmail = fieldValue(node, 'booking-email');
      state.contactPhone = fieldValue(node, 'booking-phone');
    }
  }

  function contactValid() {
    if (state.contactName.length < 2) return 'What should we call you?';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.contactEmail)) return 'Hmm… that email doesn\'t look right.';
    if (state.contactPhone.replace(/\D/g, '').length < 7) return 'A phone number helps us confirm.';
    return '';
  }

  function validate() {
    var step = currentStep();
    if (!step) return true;
    readFields();
    clearError();
    if (step.id === 'path' && !state.tier) {
      showError('Pick a setup to continue.');
      return false;
    }
    if (step.id === 'budget' && !(parseFloat(String(state.budget).replace(/[^0-9.]/g, '')) > 0)) {
      showError('Hmm… that budget doesn\'t look right.');
      return false;
    }
    if (step.id === 'details') {
      if (!(parseInt(state.guestCount, 10) > 0)) {
        showError('Add a guest count to keep going.');
        return false;
      }
      if (!(parseFloat(state.durationHours) > 0)) {
        showError('How many hours should we be there?');
        return false;
      }
      if (!state.eventDate) {
        showError('Pick a date — even a guess is fine.');
        return false;
      }
      if (state.locationAddress.length < 4) {
        showError('A venue name or address helps us price travel.');
        return false;
      }
    }
    if (step.id === 'contact') {
      var message = contactValid();
      if (message) {
        showError(message);
        return false;
      }
    }
    return true;
  }

  function capturePartial() {
    if (state.partialCaptured) return;
    if (contactValid()) return;
    state.partialCaptured = true;
    // Preview only: no quotes table yet. This is the blur/submit hook
    // that will create status = 'partial' once Supabase is wired.
  }

  function goSoon(delta) {
    function attempt() {
      if (animating) {
        window.setTimeout(attempt, 60);
        return;
      }
      go(delta);
    }
    window.setTimeout(attempt, 180);
  }

  function go(delta, force) {
    if (animating) return;
    if (delta > 0 && !force && !validate()) return;
    if (delta < 0 && index <= 0) return;
    var from = index;
    var to = index + delta;
    if (to < 0 || to >= steps.length) return;
    if (currentStep() && currentStep().id === 'contact' && delta > 0) {
      capturePartial();
    }
    if (currentStep() && currentStep().id === 'review' && delta > 0) {
      state.submitted = true;
    }
    animating = true;
    var nodes = stage.querySelectorAll('.booking-step');
    var current = nodes[from];
    var next = nodes[to];
    current.classList.toggle('is-exit-back', delta < 0);
    current.classList.add('is-leaving');
    current.classList.remove('is-active');
    next.classList.toggle('is-exit-back', delta < 0);
    index = to;
    requestAnimationFrame(function () {
      next.classList.add('is-active');
      next.classList.remove('is-exit-back');
      syncChrome();
      window.setTimeout(function () {
        current.classList.remove('is-exit-back');
        current.classList.remove('is-leaving');
        animating = false;
        focusActive();
      }, 480);
    });
  }

  function focusActive() {
    var node = activeNode();
    if (!node) return;
    var input = node.querySelector('.booking-input:not([type="date"])');
    if (input) {
      window.setTimeout(function () { input.focus(); }, 280);
    }
  }

  function setTier(tier, rebuild) {
    state.tier = tier;
    if (tier !== 'premium') state.addOns = [];
    if (rebuild !== false) {
      var was = currentStep() && currentStep().id;
      mount();
      var target = steps.findIndex(function (s) { return s.id === was; });
      if (target >= 0) {
        stage.querySelectorAll('.booking-step').forEach(function (n, i) {
          n.classList.toggle('is-active', i === target);
        });
        index = target;
      }
      syncChrome();
    }
  }

  function toggleAddon(id) {
    var i = state.addOns.indexOf(id);
    if (i >= 0) state.addOns.splice(i, 1);
    else state.addOns.push(id);
    var btn = activeNode() && activeNode().querySelector('[data-addon="' + id + '"]');
    if (btn) btn.classList.toggle('is-selected', state.addOns.indexOf(id) >= 0);
    refreshEstimate();
  }

  function quoteReady() {
    var q = quote();
    if (state.tier === 'custom') return Boolean(state.budget && state.guestCount && state.durationHours);
    return q.ready;
  }

  function liveAmount() {
    var q = quote();
    if (state.tier === 'custom') return 0;
    if (q.ready) return q.amount;
    if (state.tier) return calc.startingAmount(state.tier);
    return 0;
  }

  function refreshEstimate() {
    var q = quote();
    var step = currentStep();
    var show = Boolean(state.tier && step && step.id !== 'welcome' && step.id !== 'path' && step.id !== 'done');
    estimateEl.classList.toggle('is-visible', show);
    if (state.tier === 'custom') {
      estimateLabel.textContent = q.recommendedLabel ? 'Looks like' : 'Estimate';
      var label = q.recommendedLabel || '—';
      estimateValue.textContent = label;
      if (mediaAmount) mediaAmount.textContent = label;
      if (mediaEyebrow) mediaEyebrow.textContent = 'Recommended';
      if (mediaCopy) mediaCopy.textContent = 'Budget-first. We\'ll confirm the fit by hand.';
      var capCustom = activeNode() && activeNode().querySelector('[data-capacity]');
      if (capCustom) capCustom.classList.toggle('is-hidden', !q.overCapacity);
      var travelCustom = activeNode() && activeNode().querySelector('[data-travel-status]');
      if (travelCustom) travelCustom.textContent = travelHint();
      return;
    }
    estimateLabel.textContent = q.ready ? 'Estimate' : 'Rate starts at';
    if (mediaEyebrow) mediaEyebrow.textContent = q.ready ? 'Live estimate' : 'Rate starts at';
    animateAmount(liveAmount());
    if (mediaCopy) {
      mediaCopy.textContent = q.ready
        ? (q.breakdown.travelPending ? 'Travel lands after we map the address.' : 'Updates as you go.')
        : 'Pick a setup to see the starting number.';
    }
    var cap = activeNode() && activeNode().querySelector('[data-capacity]');
    if (cap) cap.classList.toggle('is-hidden', !q.overCapacity);
    var travelStatus = activeNode() && activeNode().querySelector('[data-travel-status]');
    if (travelStatus) travelStatus.textContent = travelHint();
    var reviewCardEl = activeNode() && activeNode().querySelector('[data-review-card]');
    if (reviewCardEl) {
      var wrap = document.createElement('div');
      wrap.innerHTML = reviewCard();
      reviewCardEl.replaceWith(wrap.firstElementChild);
    }
  }

  function animateAmount(target) {
    var from = displayedAmount;
    var to = target;
    if (amountFrame) cancelAnimationFrame(amountFrame);
    if (Math.abs(to - from) < 1) {
      displayedAmount = to;
      writeAmount(to);
      return;
    }
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / 420);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = from + (to - from) * eased;
      displayedAmount = value;
      writeAmount(value);
      if (t < 1) amountFrame = requestAnimationFrame(tick);
    }
    amountFrame = requestAnimationFrame(tick);
  }

  function writeAmount(value) {
    var text = calc.formatMoney(value);
    estimateValue.textContent = text;
    if (mediaAmount) mediaAmount.textContent = text;
  }

  function syncChrome() {
    var step = currentStep();
    var countable = steps.filter(function (s) { return s.id !== 'welcome' && s.id !== 'done'; });
    var pos = countable.findIndex(function (s) { return step && s.id === step.id; });
    if (pageEl) {
      var showPage = Boolean(step && step.id !== 'welcome' && step.id !== 'done' && pos >= 0);
      pageEl.hidden = !showPage;
      pageEl.textContent = showPage ? ((pos + 1) + '/' + countable.length) : '';
    }
    prevBtn.disabled = index <= 0 || (step && step.id === 'done');
    nextBtn.disabled = !step || step.id === 'done';
    var app = document.getElementById('booking-app');
    app.classList.toggle('is-welcome', Boolean(step && step.id === 'welcome'));
    var showTiers = state.tier && step && step.id !== 'welcome' && step.id !== 'path' && step.id !== 'done';
    tiersEl.hidden = !showTiers;
    tiersEl.classList.toggle('is-visible', showTiers);
    document.getElementById('booking-app').classList.toggle('has-tiers', showTiers);
    Array.prototype.forEach.call(tiersEl.querySelectorAll('[data-tier]'), function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tier') === state.tier);
    });
    refreshEstimate();
    if (step && step.id === 'path') {
      var pathInner = stage.querySelector('[data-step="path"] .booking-step__inner--fill');
      if (pathInner && pathInner.clientHeight > 0) {
        pathInner.style.setProperty('--path-view', pathInner.clientHeight + 'px');
      }
    }
  }

  function scheduleGeocode() {
    window.clearTimeout(geocodeTimer);
    var address = state.locationAddress;
    if (!address || address.length < 4) {
      state.locationMiles = null;
      state.locationStatus = 'idle';
      refreshEstimate();
      return;
    }
    state.locationStatus = 'calculating';
    refreshEstimate();
    geocodeTimer = window.setTimeout(function () { geocodeAddress(address); }, 650);
  }

  function geocodeAddress(address) {
    var seq = ++geocodeSeq;
    var query = address + (/,?\s*(fl|florida)\b/i.test(address) ? '' : ', Florida');
    var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query);
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('geocode ' + res.status);
        return res.json();
      })
      .then(function (rows) {
        if (seq !== geocodeSeq) return;
        if (!rows || !rows[0]) throw new Error('no result');
        var miles = calc.haversineMiles(
          calc.ORIGIN.lat,
          calc.ORIGIN.lng,
          parseFloat(rows[0].lat),
          parseFloat(rows[0].lon)
        );
        state.locationMiles = miles;
        state.locationStatus = 'ready';
        refreshEstimate();
      })
      .catch(function () {
        if (seq !== geocodeSeq) return;
        state.locationMiles = null;
        state.locationStatus = 'error';
        refreshEstimate();
      });
  }

  function onStageClick(event) {
    var day = event.target.closest('[data-pick-date]');
    if (day && !day.disabled) {
      event.preventDefault();
      state.eventDate = day.getAttribute('data-pick-date');
      calOpen = false;
      paintCalendar();
      clearError();
      return;
    }
    var toggle = event.target.closest('[data-cal-toggle]');
    if (toggle) {
      event.preventDefault();
      calOpen = !calOpen;
      paintCalendar();
      return;
    }
    var shift = event.target.closest('[data-cal-shift]');
    if (shift) {
      event.preventDefault();
      var dir = Number(shift.getAttribute('data-cal-shift'));
      var cur = currentCalMonth();
      calCursor = new Date(cur.getFullYear(), cur.getMonth() + dir, 1);
      paintCalendar();
      return;
    }
    var nudge = event.target.closest('[data-step-for]');
    if (nudge) {
      event.preventDefault();
      nudgeStepper(
        nudge.getAttribute('data-step-for'),
        Number(nudge.getAttribute('data-step-dir')),
        nudge.getAttribute('data-step-amt')
      );
      return;
    }
    var ok = event.target.closest('[data-ok]');
    if (ok) {
      event.preventDefault();
      go(1);
      return;
    }
    var path = event.target.closest('[data-step="path"]');
    if (event.target.closest('a[href^="mailto:"]')) return;
    var tierBtn = event.target.closest('[data-tier]');
    if (tierBtn && path) {
      event.preventDefault();
      var nextTier = tierBtn.getAttribute('data-tier');
      Array.prototype.forEach.call(stage.querySelectorAll('[data-step="path"] [data-tier]'), function (card) {
        var on = card === tierBtn;
        card.classList.toggle('is-selected', on);
        if (card.getAttribute('role') === 'option') card.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      setTier(nextTier, true);
      goSoon(1);
      return;
    }
    var addon = event.target.closest('[data-addon]');
    if (addon) {
      event.preventDefault();
      toggleAddon(addon.getAttribute('data-addon'));
    }
  }

  function onStageInput(event) {
    readFields();
    refreshEstimate();
    clearError();
    var step = currentStep();
    if (step && step.id === 'details' && event.target && event.target.id === 'booking-location') scheduleGeocode();
    if (step && step.id === 'contact' && event.target && event.target.id === 'booking-phone' && !contactValid()) {
      capturePartial();
    }
  }

  function onStageBlur(event) {
    if (!event.target || !event.target.classList.contains('booking-input')) return;
    var step = currentStep();
    if (step && step.id === 'contact') {
      readFields();
      if (!contactValid()) capturePartial();
    }
  }

  function onStageKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.target.tagName === 'TEXTAREA') return;
      event.preventDefault();
      go(1);
    }
  }

  function onGlobalKey(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var tag = event.target && event.target.tagName;
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';
    if (typing && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      go(-1, true);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      go(1);
      return;
    }
    if (typing) return;
    var key = String(event.key || '').toUpperCase();
    var node = activeNode();
    if (!node) return;
    var choice = node.querySelector('[data-key="' + key + '"]');
    if (choice) choice.click();
  }

  prevBtn.addEventListener('click', function () { go(-1, true); });
  nextBtn.addEventListener('click', function () { go(1); });
  tiersEl.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-tier]');
    if (!btn) return;
    setTier(btn.getAttribute('data-tier'), true);
  });
  document.addEventListener('keydown', onGlobalKey);
  stage.addEventListener('click', onStageClick);
  stage.addEventListener('input', onStageInput);
  stage.addEventListener('focusout', onStageBlur);
  stage.addEventListener('keydown', onStageKey);

  mount();
})();
