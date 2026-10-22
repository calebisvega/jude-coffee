/**
 * Jude Coffee private-event pricing.
 * Change the numbers in pricingConfig. quoteEvent reads only that object.
 * Miles are typed in by hand. This does not look up a distance.
 * Lodging, drive-day labor, rush fees, and out-of-state tax are not included.
 */

export const pricingConfig = {
  tiers: ['lean', 'standard', 'premium'] as const,

  /** Dollars per staff person, per hour. */
  staffRate: { lean: 75, standard: 200, premium: 225 },

  /** Dollars per guest. Does not change with hours. */
  guestRate: { lean: 3.25, standard: 5.13, premium: 5.13 },

  /** One flat setup fee per event. Does not grow with guests or miles. */
  resourceFee: { lean: 200, standard: 275, premium: 275 },

  /** Dollars each. Charged on premium only. */
  premiumAddOn: 150,

  /** Dollars per mile, charged on the round trip (one-way miles × 2). */
  travelPerMile: 0.76,

  /** Where miles are measured from. Not used in the math. */
  baseAddress: '956 E Palmetto St, Lakeland FL',

  /** Lowest subtotal, including travel. */
  quoteMinimum: 500,

  /** Florida / Polk food sales tax. Applied only when floridaEvent is true. */
  floridaTaxRate: 0.07,

  /** Guests per hour before we suggest a longer service window. */
  guestsPerHour: 50,

  /** One-way miles before a quote needs a manual long-distance review. */
  longDistanceMiles: 100
};

export type PricingTier = (typeof pricingConfig.tiers)[number];

export type QuoteInput = {
  tier: PricingTier;
  guests: number;
  hours: number;
  oneWayMiles: number;
  addOns?: number;
  floridaEvent: boolean;
};

export type QuoteResult = {
  staffCount: number;
  staffing: number;
  resource: number;
  guestsCharge: number;
  addOnsCharge: number;
  travel: number;
  subtotal: number;
  tax: number;
  total: number;
  overCapacity: boolean;
  longDistance: boolean;
  outOfStateTax: boolean;
};

function money(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function quoteEvent(input: QuoteInput): QuoteResult {
  const rates = pricingConfig;
  const guests = input.guests;
  const hours = input.hours;
  const oneWayMiles = input.oneWayMiles;
  const staffCount = guests <= 75 ? 1 : 2;
  const staffing = money(staffCount * rates.staffRate[input.tier] * hours);
  const guestsCharge = money(guests * rates.guestRate[input.tier]);
  const resource = money(rates.resourceFee[input.tier]);
  const addOnCount = input.tier === 'premium' ? input.addOns ?? 0 : 0;
  const addOnsCharge = money(addOnCount * rates.premiumAddOn);
  const travel = money(oneWayMiles * 2 * rates.travelPerMile);
  const subtotal = money(
    Math.max(
      staffing + resource + guestsCharge + addOnsCharge + travel,
      rates.quoteMinimum
    )
  );
  const tax = input.floridaEvent ? money(subtotal * rates.floridaTaxRate) : 0;
  const total = money(subtotal + tax);

  return {
    staffCount,
    staffing,
    resource,
    guestsCharge,
    addOnsCharge,
    travel,
    subtotal,
    tax,
    total,
    overCapacity: hours > 0 && guests / hours > rates.guestsPerHour,
    longDistance: oneWayMiles > rates.longDistanceMiles,
    outOfStateTax: !input.floridaEvent
  };
}

/** Same function as a live quote. Zero miles, no Florida tax. */
export const startingAtBookings = {
  lean: { tier: 'lean', guests: 25, hours: 1, oneWayMiles: 0, floridaEvent: false },
  standard: { tier: 'standard', guests: 30, hours: 2, oneWayMiles: 0, floridaEvent: false },
  premium: {
    tier: 'premium',
    guests: 30,
    hours: 2,
    oneWayMiles: 0,
    addOns: 1,
    floridaEvent: false
  }
} as const satisfies Record<PricingTier, QuoteInput>;

export function startingAtPrices(): Record<PricingTier, number> {
  return {
    lean: quoteEvent(startingAtBookings.lean).total,
    standard: quoteEvent(startingAtBookings.standard).total,
    premium: quoteEvent(startingAtBookings.premium).total
  };
}
