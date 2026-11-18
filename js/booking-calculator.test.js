'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var calc = require('./booking-calculator.js');

function quote(tier, guests, hours, roundTripMiles, addOnCount) {
  return calc.calculate({
    tier: tier,
    guestCount: guests,
    durationHours: hours,
    roundTripMiles: roundTripMiles == null ? 0 : roundTripMiles,
    addOnCount: addOnCount || 0
  });
}

var MI = 108; // round-trip miles used in Nov 17 spec vectors

test('Standard, 75 guests, 1 hr, 108 mi RT', function () {
  var q = quote('standard', 75, 1, MI);
  assert.equal(q.breakdown.staffCount, 1);
  assert.equal(q.breakdown.resourceCount, 1);
  assert.equal(q.breakdown.staffing, 100);
  assert.equal(q.breakdown.resourceFee, 275);
  assert.equal(q.breakdown.perGuest, 384.75);
  assert.equal(q.breakdown.travel, 82.08);
  assert.equal(q.quotedSubtotal, 841.83);
  assert.equal(q.tax, 58.93);
  assert.equal(q.total, 900.76);
  assert.equal(q.overCapacity, true);
});

test('Standard, 75 guests, 2 hr, 108 mi RT', function () {
  var q = quote('standard', 75, 2, MI);
  assert.equal(q.breakdown.staffing, 200);
  assert.equal(q.quotedSubtotal, 941.83);
  assert.equal(q.tax, 65.93);
  assert.equal(q.total, 1007.76);
});

test('Standard, 75 guests, 3 hr, 108 mi RT', function () {
  var q = quote('standard', 75, 3, MI);
  assert.equal(q.breakdown.staffing, 300);
  assert.equal(q.quotedSubtotal, 1041.83);
  assert.equal(q.tax, 72.93);
  assert.equal(q.total, 1114.76);
});

test('Lean, 75 guests, 3 hr, 108 mi RT', function () {
  var q = quote('lean', 75, 3, MI);
  assert.equal(q.breakdown.resourceFee, 200);
  assert.equal(q.breakdown.perGuest, 243.75);
  assert.equal(q.quotedSubtotal, 825.83);
  assert.equal(q.tax, 57.81);
  assert.equal(q.total, 883.64);
});

test('Premium + 1 add-on, 75 guests, 3 hr, 108 mi RT', function () {
  var q = quote('premium', 75, 3, MI, 1);
  assert.equal(q.breakdown.addOns, 250);
  assert.equal(q.quotedSubtotal, 1291.83);
  assert.equal(q.tax, 90.43);
  assert.equal(q.total, 1382.26);
});

test('Lean floor: 25 guests, 1 hr, 0 mi -> $500 + tax', function () {
  var q = quote('lean', 25, 1, 0);
  assert.equal(q.breakdown.minimumApplied, true);
  assert.equal(q.quotedSubtotal, 500);
  assert.equal(q.tax, 35);
  assert.equal(q.total, 535);
});

test('staff threshold: 75 = 1, 76 = 2', function () {
  assert.equal(calc.staffCount(75), 1);
  assert.equal(calc.staffCount(76), 2);
});

test('resource threshold: 100 = 1, 101 = 2', function () {
  assert.equal(calc.resourceCount(100), 1);
  assert.equal(calc.resourceCount(101), 2);
  var q = quote('standard', 101, 3, 0);
  assert.equal(q.breakdown.resourceCount, 2);
  assert.equal(q.breakdown.resourceFee, 550);
  assert.equal(q.overCapacity, true);
});

test('starting-at values floor to $500 minimum', function () {
  assert.equal(calc.startingAmount('lean'), 500);
  assert.equal(calc.startingAmount('standard'), 500);
  assert.equal(calc.startingAmount('premium'), 500);
});

test('travel uses round-trip miles at $0.76', function () {
  assert.equal(calc.travelFeeFromRoundTrip(108), 82.08);
  assert.equal(calc.travelFeeFromOneWay(54), 82.08);
});
