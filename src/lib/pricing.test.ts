import assert from 'node:assert/strict';
import test from 'node:test';
import { quoteEvent, startingAtPrices } from './pricing.ts';

test('standard, 150 guests, 2 hours, 29 miles, Florida', () => {
  const quote = quoteEvent({
    tier: 'standard',
    guests: 150,
    hours: 2,
    oneWayMiles: 29,
    floridaEvent: true
  });

  assert.equal(quote.staffCount, 2);
  assert.equal(quote.staffing, 800);
  assert.equal(quote.resource, 275);
  assert.equal(quote.guestsCharge, 769.5);
  assert.equal(quote.addOnsCharge, 0);
  assert.equal(quote.travel, 44.08);
  assert.equal(quote.subtotal, 1888.58);
  assert.equal(quote.tax, 132.2);
  assert.equal(quote.total, 2020.78);
  assert.equal(quote.overCapacity, true);
  assert.equal(quote.longDistance, false);
  assert.equal(quote.outOfStateTax, false);
});

test('standard, 150 guests, 2 hours, 1000 miles, outside Florida', () => {
  const quote = quoteEvent({
    tier: 'standard',
    guests: 150,
    hours: 2,
    oneWayMiles: 1000,
    floridaEvent: false
  });

  assert.equal(quote.travel, 1520);
  assert.equal(quote.subtotal, 3364.5);
  assert.equal(quote.tax, 0);
  assert.equal(quote.total, 3364.5);
  assert.equal(quote.overCapacity, true);
  assert.equal(quote.longDistance, true);
  assert.equal(quote.outOfStateTax, true);
});

test('lean, 25 guests, 1 hour, 0 miles floors to the quote minimum', () => {
  const quote = quoteEvent({
    tier: 'lean',
    guests: 25,
    hours: 1,
    oneWayMiles: 0,
    floridaEvent: false
  });

  assert.equal(quote.staffing + quote.resource + quote.guestsCharge + quote.addOnsCharge + quote.travel, 356.25);
  assert.equal(quote.subtotal, 500);
  assert.equal(quote.tax, 0);
  assert.equal(quote.total, 500);
});

test('standard, 30 guests, 2 hours, 0 miles', () => {
  const quote = quoteEvent({
    tier: 'standard',
    guests: 30,
    hours: 2,
    oneWayMiles: 0,
    floridaEvent: false
  });

  assert.equal(quote.subtotal, 828.9);
  assert.equal(quote.total, 828.9);
});

test('premium, 30 guests, 2 hours, 0 miles, 1 add-on', () => {
  const quote = quoteEvent({
    tier: 'premium',
    guests: 30,
    hours: 2,
    oneWayMiles: 0,
    addOns: 1,
    floridaEvent: false
  });

  assert.equal(quote.addOnsCharge, 150);
  assert.equal(quote.subtotal, 1028.9);
  assert.equal(quote.total, 1028.9);
});

test('staff boundary is 75 guests', () => {
  const shared = { tier: 'standard' as const, hours: 1, oneWayMiles: 0, floridaEvent: false };
  assert.equal(quoteEvent({ ...shared, guests: 75 }).staffCount, 1);
  assert.equal(quoteEvent({ ...shared, guests: 76 }).staffCount, 2);
});

test('starting prices come from the same function', () => {
  assert.deepEqual(startingAtPrices(), {
    lean: 500,
    standard: 828.9,
    premium: 1028.9
  });
});

test('add-ons are ignored outside premium', () => {
  const quote = quoteEvent({
    tier: 'standard',
    guests: 30,
    hours: 2,
    oneWayMiles: 0,
    addOns: 3,
    floridaEvent: false
  });
  assert.equal(quote.addOnsCharge, 0);
  assert.equal(quote.subtotal, 828.9);
});
