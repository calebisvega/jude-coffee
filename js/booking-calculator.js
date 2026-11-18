/**
 * Jude Coffee — quote calculator
 * Spec: jude-pricing-formulavnew.md (Nov 17, 2026)
 *
 * Do not duplicate this math elsewhere.
 *
 *   staffCount    = guests > 75 ? 2 : 1
 *   resourceCount = guests > 100 ? 2 : 1
 *   staffing      = staffCount * hourlyPerStaff * hours
 *   resources     = resourceCount * resourceFee
 *   guestFee      = guests * perGuest
 *   travel        = roundTripMiles * travelRatePerMile
 *   addOnTotal    = tier == premium ? addOns * addOnPrice : 0
 *   subtotal      = max(staffing + resources + guestFee + travel + addOnTotal, minimumCharge)
 *   tax           = round(subtotal * salesTaxRate, 2)
 *   total         = subtotal + tax
 */
(function (root) {
  'use strict';

  var ORIGIN = {
    address: '956 E Palmetto St, Lakeland, FL',
    lat: 28.0447,
    lng: -81.9495
  };

  var RATES = {
    capacityPerHour: 50,
    minimumCharge: 500,
    staffGuestThreshold: 75,
    resourceGuestThreshold: 100,
    taxRate: 0.07,
    travelRatePerMile: 0.76,
    hourlyPerStaff: 100,
    addOnPrice: 250,
    lean: {
      resourceFee: 200,
      perGuest: 3.25
    },
    standard: {
      resourceFee: 275,
      perGuest: 5.13
    },
    premium: {
      resourceFee: 275,
      perGuest: 5.13
    }
  };

  var TIER_LABELS = {
    lean: 'Lean',
    standard: 'Standard',
    premium: 'Premium',
    custom: 'Custom'
  };

  function toNumber(value) {
    var n = typeof value === 'number' ? value : parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function roundMoney(value) {
    return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
  }

  function staffCount(guestCount) {
    return toNumber(guestCount) > RATES.staffGuestThreshold ? 2 : 1;
  }

  function resourceCount(guestCount) {
    return toNumber(guestCount) > RATES.resourceGuestThreshold ? 2 : 1;
  }

  function tierConfig(tier) {
    if (tier === 'lean') return RATES.lean;
    if (tier === 'standard') return RATES.standard;
    if (tier === 'premium') return RATES.premium;
    return null;
  }

  function staffingPerPerson() {
    return RATES.hourlyPerStaff;
  }

  function staffingRate(tier, guestCount) {
    return staffCount(guestCount) * RATES.hourlyPerStaff;
  }

  function travelFeeFromRoundTrip(roundTripMiles) {
    var miles = Math.max(0, toNumber(roundTripMiles));
    return roundMoney(miles * RATES.travelRatePerMile);
  }

  /** @deprecated prefer travelFeeFromRoundTrip; kept for older callers that pass one-way miles */
  function travelFeeFromOneWay(milesOneWay) {
    return travelFeeFromRoundTrip(toNumber(milesOneWay) * 2);
  }

  function haversineMiles(lat1, lng1, lat2, lng2) {
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function calculate(input) {
    var tier = input && input.tier ? input.tier : null;
    var guests = Math.max(0, Math.round(toNumber(input && input.guestCount)));
    var hours = Math.max(0, toNumber(input && input.durationHours));
    var roundTripMiles = null;
    if (input && input.roundTripMiles != null && input.roundTripMiles !== '') {
      roundTripMiles = Math.max(0, toNumber(input.roundTripMiles));
    } else if (input && input.locationMiles != null && input.locationMiles !== '') {
      // legacy one-way miles → round trip
      roundTripMiles = Math.max(0, toNumber(input.locationMiles) * 2);
    }
    var addOnCount = Math.max(0, Math.round(toNumber(input && (input.addOnCount != null ? input.addOnCount : input.addOns))));
    if (Array.isArray(input && input.addOns)) {
      addOnCount = input.addOns.length;
    }
    var budget = toNumber(input && input.budget);

    var calcTier = tier === 'custom' ? null : tier;
    var cfg = calcTier ? tierConfig(calcTier) : null;
    var people = calcTier ? staffCount(guests) : 0;
    var resources = calcTier ? resourceCount(guests) : 0;
    var perPerson = calcTier ? RATES.hourlyPerStaff : 0;
    var staffing = calcTier && hours ? roundMoney(people * perPerson * hours) : 0;
    var resourceFee = cfg ? roundMoney(resources * cfg.resourceFee) : 0;
    var perGuest = cfg && guests ? roundMoney(cfg.perGuest * guests) : 0;
    var extras = calcTier === 'premium' ? roundMoney(addOnCount * RATES.addOnPrice) : 0;
    var travel = roundTripMiles != null ? travelFeeFromRoundTrip(roundTripMiles) : 0;
    var beforeFloor = roundMoney(staffing + resourceFee + perGuest + travel + extras);
    var quotedSubtotal = calcTier && guests > 0 && hours > 0
      ? Math.max(RATES.minimumCharge, beforeFloor)
      : beforeFloor;
    var tax = calcTier && guests > 0 && hours > 0
      ? roundMoney(quotedSubtotal * RATES.taxRate)
      : 0;
    var total = roundMoney(quotedSubtotal + tax);
    // amount = pre-tax total (matches prior API used by booking UI)
    var amount = quotedSubtotal;

    var drinksPerHour = hours > 0 && guests > 0 ? guests / hours : 0;
    var overCapacity = (hours > 0 && guests > 0 && drinksPerHour > RATES.capacityPerHour) ||
      guests > RATES.resourceGuestThreshold;

    var recommendedTier = null;
    if (tier === 'custom' && budget > 0 && guests > 0 && hours > 0) {
      recommendedTier = matchBudget(budget, guests, hours, addOnCount, roundTripMiles);
    }

    return {
      amount: amount,
      quotedSubtotal: quotedSubtotal,
      tax: tax,
      total: total,
      ready: Boolean(calcTier && guests > 0 && hours > 0),
      breakdown: {
        staffCount: people,
        resourceCount: resources,
        staffing: staffing,
        staffingRate: perPerson,
        resourceFee: resourceFee,
        perGuest: perGuest,
        addOns: extras,
        addOnCount: extras ? addOnCount : 0,
        travel: travel,
        travelPending: roundTripMiles == null,
        tax: tax,
        minimumApplied: guests > 0 && hours > 0 && beforeFloor < RATES.minimumCharge
      },
      overCapacity: overCapacity,
      drinksPerHour: drinksPerHour,
      recommendedTier: recommendedTier,
      recommendedLabel: recommendedTier ? TIER_LABELS[recommendedTier] : null
    };
  }

  function matchBudget(budget, guests, hours, addOnCount, roundTripMiles) {
    var lean = calculate({
      tier: 'lean',
      guestCount: guests,
      durationHours: hours,
      roundTripMiles: roundTripMiles
    }).amount;
    var standard = calculate({
      tier: 'standard',
      guestCount: guests,
      durationHours: hours,
      roundTripMiles: roundTripMiles
    }).amount;
    var premium = calculate({
      tier: 'premium',
      guestCount: guests,
      durationHours: hours,
      roundTripMiles: roundTripMiles,
      addOnCount: addOnCount
    }).amount;
    if (budget >= premium) return 'premium';
    if (budget >= standard) return 'standard';
    if (budget >= lean) return 'lean';
    return 'lean';
  }

  function startingAmount(tier) {
    return calculate({ tier: tier, guestCount: 1, durationHours: 1, roundTripMiles: 0 }).quotedSubtotal;
  }

  function formatMoney(amount) {
    var n = Math.max(0, roundMoney(amount));
    var whole = Math.round(n);
    if (Math.abs(n - whole) < 0.001) {
      return '$' + whole.toLocaleString('en-US');
    }
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var api = {
    ORIGIN: ORIGIN,
    RATES: RATES,
    TIER_LABELS: TIER_LABELS,
    calculate: calculate,
    startingAmount: startingAmount,
    staffCount: staffCount,
    resourceCount: resourceCount,
    staffingRate: staffingRate,
    travelFeeFromOneWay: travelFeeFromOneWay,
    travelFeeFromRoundTrip: travelFeeFromRoundTrip,
    haversineMiles: haversineMiles,
    formatMoney: formatMoney
  };

  root.JudeBooking = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
