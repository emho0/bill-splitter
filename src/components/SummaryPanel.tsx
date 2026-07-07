import type { BillTotals } from "../lib/calculations";

interface Props {
  totals: BillTotals;
  hasPeople: boolean;
}

export function SummaryPanel({ totals, hasPeople }: Props) {
  const { subtotal, taxAmount, tipAmount, grandTotal, personTotals, unassignedAmount } = totals;

  return (
    <section className="border border-line bg-white p-5 sticky top-4">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-4">
        05 — Summary
      </h2>

      <div className="font-mono text-sm space-y-1 mb-4 pb-4 border-b border-dashed border-line">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Tax" value={taxAmount} />
        <Row label="Tip" value={tipAmount} />
        <Row label="Total" value={grandTotal} bold />
      </div>

      {!hasPeople ? (
        <p className="text-sm text-ink-soft italic">
          Add people to see what everyone owes.
        </p>
      ) : (
        <ul className="space-y-3">
          {personTotals.map((p) => (
            <li key={p.personId}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="font-mono text-base font-semibold">${p.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-ink-soft font-mono">
                items ${p.subtotal.toFixed(2)} · tax ${p.taxShare.toFixed(2)} · tip ${p.tipShare.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {unassignedAmount > 0 && (
        <p className="mt-4 text-xs text-stamp border border-stamp/30 bg-stamp/5 px-3 py-2">
          ${unassignedAmount.toFixed(2)} in items are unassigned and not included in anyone's total yet.
        </p>
      )}
    </section>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base pt-1" : "text-ink-soft"}`}>
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
