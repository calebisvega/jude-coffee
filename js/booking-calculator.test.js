'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var calc = require('./booking-calculator.js');

function quote(tier, guests, hours) {
  return calc.calculate({
    tier: tier,
    guestCount: guests,
    durationHours: hours
  });
}

test('75 guests, 2 hr, Standard -> 1 staff -> $1059.75', function () {
  var q = quote('standard', 75, 2);
  assert.equal(q.breakdown.staffCount, 1);
  assert.equal(q.quotedSubtotal, 1059.75);
});

test('76 guests, 2 hr, Standard -> 2 staff -> $1464.88', function () {
  var q = quote('standard', 76, 2);
  assert.equal(q.breakdown.staffCount, 2);
  assert.equal(q.quotedSubtotal, 1464.88);
});

test('76 guests, 2 hr, Lean -> 2 staff -> $747.00', function () {
  var q = quote('lean', 76, 2);
  assert.equal(q.breakdown.staffCount, 2);
  assert.equal(q.quotedSubtotal, 747);
});

test('31 guests, 2 hr, Standard -> 1 staff -> $834.03', function () {
  var q = quote('standard', 31, 2);
  assert.equal(q.breakdown.staffCount, 1);
  assert.equal(q.quotedSubtotal, 834.03);
});

test('exactly 75 guests is still 1 staff', function () {
  assert.equal(calc.staffCount(75), 1);
  assert.equal(calc.staffCount(76), 2);
});

test('starting-at values use 1 guest × 1 hour, not a 75-guest staff cutoff', function () {
  assert.equal(calc.staffCount(1), 1);
  assert.equal(calc.startingAmount('lean'), 500);
  assert.equal(calc.startingAmount('standard'), 500);
  assert.equal(calc.startingAmount('premium'), 505.13);
});
