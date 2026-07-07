import type { BillState, PersonTotal } from "../types";

export interface BillTotals {
  subtotal: number;
  unassignedAmount: number; // dollar value of items nobody is assigned to
  taxAmount: number;
  tipAmount: number;
  grandTotal: number;
  personTotals: PersonTotal[];
  coveredTotal: number; // sum of personTotals[].total
  uncoveredTotal: number; // grandTotal - coveredTotal (from unassigned items)
}

/**
 * Splits every item's price evenly across the people assigned to it,
 * then distributes tax/tip proportionally to each person's share of the
 * assigned subtotal. Items with nobody assigned are excluded from any
 * person's total and surfaced separately so the UI can warn about them.
 *
 * Cent rounding uses the "largest remainder method" so the displayed
 * per-person totals always add up exactly to the grand total (no missing
 * or extra pennies from naive per-person rounding).
 */
export function computeTotals(state: BillState): BillTotals {
  const { people, items, taxPercent, tipPercent } = state;

  const subtotal = round2(items.reduce((sum, item) => sum + item.price, 0));
  const unassignedAmount = round2(
    items
      .filter((item) => item.assignedTo.length === 0)
      .reduce((sum, item) => sum + item.price, 0)
  );
  const assignedSubtotal = round2(subtotal - unassignedAmount);

  const taxAmount = round2((subtotal * taxPercent) / 100);
  const tipAmount = round2((subtotal * tipPercent) / 100);
  const grandTotal = round2(subtotal + taxAmount + tipAmount);

  // Raw (unrounded) per-person item subtotal.
  const rawItemSubtotal = new Map<string, number>();
  for (const person of people) rawItemSubtotal.set(person.id, 0);

  for (const item of items) {
    if (item.assignedTo.length === 0) continue;
    const share = item.price / item.assignedTo.length;
    for (const personId of item.assignedTo) {
      rawItemSubtotal.set(personId, (rawItemSubtotal.get(personId) ?? 0) + share);
    }
  }

  const taxAndTip = taxAmount + tipAmount;

  // Raw (unrounded) totals per person, proportional to their share of the
  // assigned subtotal (people aren't charged tax/tip on items nobody claimed).
  const rawTotals = people.map((person) => {
    const itemSubtotal = rawItemSubtotal.get(person.id) ?? 0;
    const ratio = assignedSubtotal > 0 ? itemSubtotal / assignedSubtotal : 0;
    const taxShare = taxAndTip * ratio * (taxAmount / taxAndTip || 0);
    const tipShare = taxAndTip * ratio * (tipAmount / taxAndTip || 0);
    return {
      personId: person.id,
      name: person.name,
      itemSubtotal,
      taxShare,
      tipShare,
      rawTotal: itemSubtotal + taxShare + tipShare,
    };
  });

  const personTotals = distributeRounded(rawTotals);
  const coveredTotal = round2(personTotals.reduce((sum, p) => sum + p.total, 0));
  const uncoveredTotal = round2(grandTotal - coveredTotal);

  return {
    subtotal,
    unassignedAmount,
    taxAmount,
    tipAmount,
    grandTotal,
    personTotals,
    coveredTotal,
    uncoveredTotal,
  };
}

/** Rounds each person's totals to cents while keeping the sum exact. */
function distributeRounded(
  rawTotals: {
    personId: string;
    name: string;
    itemSubtotal: number;
    taxShare: number;
    tipShare: number;
    rawTotal: number;
  }[]
): PersonTotal[] {
  if (rawTotals.length === 0) return [];

  const totalCentsExact = rawTotals.reduce((sum, p) => sum + p.rawTotal * 100, 0);
  const targetCents = Math.round(totalCentsExact);

  const floored = rawTotals.map((p) => ({
    ...p,
    cents: Math.floor(p.rawTotal * 100),
    remainder: p.rawTotal * 100 - Math.floor(p.rawTotal * 100),
  }));

  let centsToDistribute = targetCents - floored.reduce((sum, p) => sum + p.cents, 0);

  // Give the leftover pennies to whoever has the largest fractional remainder.
  const order = [...floored].sort((a, b) => b.remainder - a.remainder);
  for (const p of order) {
    if (centsToDistribute <= 0) break;
    p.cents += 1;
    centsToDistribute -= 1;
  }

  return floored.map((p) => ({
    personId: p.personId,
    name: p.name,
    subtotal: round2(p.itemSubtotal),
    taxShare: round2(p.taxShare),
    tipShare: round2(p.tipShare),
    total: round2(p.cents / 100),
  }));
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
