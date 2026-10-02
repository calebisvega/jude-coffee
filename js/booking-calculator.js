/**
 * Jude Coffee — quote calculator
 * One function, two call sites later (browser live preview + server save).
 *
 * Do not duplicate this math elsewhere.
 *
 *   staffing   = staff_count * hourly_rate_per_person * hours
 *   guest_fee  = guests * per_guest_rate
 *   quoted_subtotal = max(staffing + resource + guest_fee + add_ons, 500)
 *   travel     = billable round-trip miles × 1.25
 *   tax        = 0.07 × (quoted_subtotal + travel)
 *   total      = quoted_subtotal + travel + tax
 *
 * staff_count = 1 if guests <= 75, 2 if guests > 75.
 *
 * Travel:
 *   round_trip_miles = one_way_miles × 2
 *   billable_miles = max(0, round_trip_miles - 5)
 *   travel_fee = billable_miles × 1.25
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
    taxRate: 0.07,
    travelFreeRoundTripMiles: 5,
    travelPerBillableMile: 1.25,
    lean: {
      staffingPerPersonPerHour: 75,
      resourceFee: 200,
      perGuest: 3.25
    },
    standard: {
      staffingPerPersonPerHour: 200,
      resourceFee: 275,
      perGuest: 5.13
    },
    premium: {
      staffingPerPersonPerHour: 225,
      resourceFee: 275,
      perGuest: 5.13
    },
    // TODO: pending final pricing decision — $0 is a stub, not forever-free
    addOns: {
      stamp: { label: 'Custom stamp', amount: 0, pricingPending: true },
      menu_design: { label: 'Custom menu design', amount: 0, pricingPending: true },
      stamp_design: { label: 'Custom stamp design', amount: 0, pricingPending: true },
      specialty_drink: { label: 'Custom drink', amount: 0, pricingPending: true }
    }
  };

  var TIER_LABELS = {
    lean: 'Base',
    standard: 'Signature',
    premium: 'Curated',
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

  function staffingPerPerson(tier) {
    var cfg = tierConfig(tier);
    return cfg ? cfg.staffingPerPersonPerHour : 0;
  }

  function staffingRate(tier, guestCount) {
    return staffCount(guestCount) * staffingPerPerson(tier);
  }

  function tierConfig(tier) {
    if (tier === 'lean') return RATES.lean;
    if (tier === 'standard') return RATES.standard;
    if (tier === 'premium') return RATES.premium;
    return null;
  }

  function addOnTotal(addOns) {
    var ids = Array.isArray(addOns) ? addOns : [];
    return ids.reduce(function (sum, id) {
      var item = RATES.addOns[id];
      return sum + (item ? item.amount : 0);
    }, 0);
  }

  function travelFeeFromOneWay(milesOneWay) {
    var oneWay = toNumber(milesOneWay);
    if (oneWay <= 0) return 0;
    var roundTrip = oneWay * 2;
    var billable = Math.max(0, roundTrip - RATES.travelFreeRoundTripMiles);
    return roundMoney(billable * RATES.travelPerBillableMile);
  }

  function haversineMiles(lat1, lng1, lat2, lng2) {
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lng2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function calculate(input) {
    var tier = input && input.tier ? input.tier : null;
    var guests = Math.max(0, Math.round(toNumber(input && input.guestCount)));
    var hours = Math.max(0, toNumber(input && input.durationHours));
    var miles = input && input.locationMiles != null ? toNumber(input.locationMiles) : null;
    var addOns = (input && input.addOns) || [];
    var budget = toNumber(input && input.budget);

    var calcTier = tier === 'custom' ? null : tier;
    var cfg = calcTier ? tierConfig(calcTier) : null;
    var people = calcTier ? staffCount(guests) : 0;
    var perPerson = calcTier ? staffingPerPerson(calcTier) : 0;
    var rate = perPerson * people;
    var staffing = calcTier && hours ? roundMoney(people * perPerson * hours) : 0;
    var resource = cfg ? cfg.resourceFee : 0;
    var perGuest = cfg && guests ? roundMoney(cfg.perGuest * guests) : 0;
    var extras = calcTier === 'premium' ? addOnTotal(addOns) : 0;
    var travel = miles != null ? travelFeeFromOneWay(miles) : 0;
    var beforeFloor = roundMoney(staffing + resource + perGuest + extras);
    var quotedSubtotal = calcTier && guests > 0 && hours > 0
      ? Math.max(RATES.minimumCharge, beforeFloor)
      : beforeFloor;
    var tax = calcTier && guests > 0 && hours > 0
      ? roundMoney((quotedSubtotal + travel) * RATES.taxRate)
      : 0;
    var total = roundMoney(quotedSubtotal + travel + tax);
    var amount = roundMoney(quotedSubtotal + travel);

    var drinksPerHour = hours > 0 && guests > 0 ? guests / hours : 0;
    var overCapacity = hours > 0 && guests > 0 && drinksPerHour > RATES.capacityPerHour;

    var recommendedTier = null;
    if (tier === 'custom' && budget > 0 && guests > 0 && hours > 0) {
      recommendedTier = matchBudget(budget, guests, hours, addOns, miles);
    }

    return {
      amount: amount,
      quotedSubtotal: quotedSubtotal,
      tax: tax,
      total: total,
      ready: Boolean(calcTier && guests > 0 && hours > 0),
      breakdown: {
        staffCount: people,
        staffing: staffing,
        staffingRate: perPerson,
        resourceFee: resource,
        perGuest: perGuest,
        addOns: extras,
        travel: travel,
        travelPending: miles == null,
        tax: tax,
        minimumApplied: guests > 0 && hours > 0 && beforeFloor < RATES.minimumCharge
      },
      overCapacity: overCapacity,
      drinksPerHour: drinksPerHour,
      recommendedTier: recommendedTier,
      recommendedLabel: recommendedTier ? TIER_LABELS[recommendedTier] : null
    };
  }

  function matchBudget(budget, guests, hours, addOns, miles) {
    var lean = calculate({ tier: 'lean', guestCount: guests, durationHours: hours, locationMiles: miles }).amount;
    var standard = calculate({ tier: 'standard', guestCount: guests, durationHours: hours, locationMiles: miles }).amount;
    var premium = calculate({
      tier: 'premium',
      guestCount: guests,
      durationHours: hours,
      locationMiles: miles,
      addOns: addOns
    }).amount;
    if (budget >= premium) return 'premium';
    if (budget >= standard) return 'standard';
    if (budget >= lean) return 'lean';
    return 'lean';
  }

  function startingAmount(tier) {
    return calculate({ tier: tier, guestCount: 1, durationHours: 1 }).quotedSubtotal;
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
    staffingRate: staffingRate,
    travelFeeFromOneWay: travelFeeFromOneWay,
    haversineMiles: haversineMiles,
    formatMoney: formatMoney
  };

  root.JudeBooking = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
