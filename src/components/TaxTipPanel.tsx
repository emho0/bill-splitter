interface Props {
  taxPercent: number;
  tipPercent: number;
  onTaxChange: (value: number) => void;
  onTipChange: (value: number) => void;
}

const TIP_PRESETS = [15, 18, 20];

export function TaxTipPanel({ taxPercent, tipPercent, onTaxChange, onTipChange }: Props) {
  return (
    <section className="border border-line bg-white/60 p-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-4">
        04 — Tax &amp; Tip
      </h2>

      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between text-sm">
          <span>Tax</span>
          <span className="relative w-24">
            <input
              type="number"
              step="0.01"
              min="0"
              value={taxPercent}
              onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
              className="w-full border border-line bg-paper px-2 py-1.5 pr-7 text-sm font-mono outline-none focus:border-accent text-right"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft text-sm">%</span>
          </span>
        </label>

        <div>
          <label className="flex items-center justify-between text-sm mb-2">
            <span>Tip</span>
            <span className="relative w-24">
              <input
                type="number"
                step="0.01"
                min="0"
                value={tipPercent}
                onChange={(e) => onTipChange(parseFloat(e.target.value) || 0)}
                className="w-full border border-line bg-paper px-2 py-1.5 pr-7 text-sm font-mono outline-none focus:border-accent text-right"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft text-sm">%</span>
            </span>
          </label>
          <div className="flex gap-2 justify-end">
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onTipChange(preset)}
                className={`px-2.5 py-1 text-xs border transition-colors ${
                  tipPercent === preset
                    ? "bg-ink text-paper border-ink"
                    : "border-line text-ink-soft hover:border-accent"
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
