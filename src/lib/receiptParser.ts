export interface ParsedLineItem {
  name: string;
  price: number;
}

export interface ParsedReceipt {
  items: ParsedLineItem[];
  subtotal?: number;
  tax?: number;
  tip?: number;
  total?: number;
}

// Line-level keywords that mean "this isn't a purchasable item" rather than
// noise to ignore outright — some of these we specifically want to capture
// (tax/tip/subtotal/total), others we just want to skip (cash, card, change).
const TAX_WORDS = /\b(tax|hst|gst|vat)\b/i;
const TIP_WORDS = /\b(tip|gratuity)\b/i;
const SUBTOTAL_WORDS = /\bsub ?total\b/i;
const TOTAL_WORDS = /\b(total|amount due|balance due)\b/i;
const SKIP_WORDS =
  /\b(cash|change|card|visa|mastercard|amex|discover|debit|credit|approved|auth|server|table|guest|order|check|receipt|thank you|phone|www\.|\.com|date|time|qty)\b/i;

// Matches a trailing dollar amount at the end of a line, e.g. "Cheeseburger  12.99" or "Latte $4.50"
const PRICE_AT_END = /\$?\s*(\d{1,4}\.\d{2})\s*$/;

/**
 * Best-effort parse of raw OCR text from a receipt photo into candidate line
 * items plus tax/tip/subtotal/total, if found. This is intentionally
 * conservative — it's meant to save typing, not to be perfectly accurate.
 * The caller should let the person review/edit before trusting the result.
 */
export function parseReceiptText(rawText: string): ParsedReceipt {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ParsedLineItem[] = [];
  let subtotal: number | undefined;
  let tax: number | undefined;
  let tip: number | undefined;
  let total: number | undefined;

  for (const line of lines) {
    const match = line.match(PRICE_AT_END);
    if (!match) continue;

    const price = parseFloat(match[1]);
    if (Number.isNaN(price)) continue;

    const description = line.slice(0, match.index).trim().replace(/[.\-:]+$/, "").trim();

    if (SUBTOTAL_WORDS.test(line)) {
      subtotal = price;
      continue;
    }
    if (TAX_WORDS.test(line)) {
      tax = price;
      continue;
    }
    if (TIP_WORDS.test(line)) {
      tip = price;
      continue;
    }
    if (TOTAL_WORDS.test(line)) {
      total = price;
      continue;
    }
    if (SKIP_WORDS.test(line)) continue;
    if (!description) continue;
    // Anything left that's just digits (e.g. a stray quantity or code) isn't a real item name.
    if (/^\d+$/.test(description)) continue;

    items.push({ name: description, price });
  }

  return { items, subtotal, tax, tip, total };
}
