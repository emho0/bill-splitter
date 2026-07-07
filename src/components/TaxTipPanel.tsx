import { useEffect, useState } from "react";

type TaxMode = "percent" | "amount";

interface Props {
  taxMode: TaxMode;
  taxValue: number;
  tipPercent: number;
  onTaxModeChange: (mode: TaxMode) => void;
  onTaxValueChange: (value: number) => void;
  onTipChange: (value: number) => void;
}

const TIP_PRESETS = [15, 18, 20];

export function TaxTipPanel({
  taxMode,
  taxValue,
  tipPercent,
  onTaxModeChange,
  onTaxValueChange,
  onTipChange,
}: Props) {
  return (
    <section className="border border-line bg-white/60 p-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-4">
        04 — Tax &amp; Tip
      </h2>

      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between text-sm">
          <span>Tax</span>
          <div className="flex items-center gap-2">
            <div className="flex border border-line text-xs">
              <button
                type="button"
                onClick={() => onTaxModeChange("amount")}
                aria-label="Enter tax as a dollar amount"
                className={`w-6 py-1 transition-colors ${
                  taxMode === "amount"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-accent"
                }`}
              >
                $
              </button>
              <button
                type="button"
                onClick={() => onTaxModeChange("percent")}
                aria-label="Enter tax as a percent"
                className={`w-6 py-1 border-l border-line transition-colors ${
                  taxMode === "percent"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-accent"
                }`}
              >
                %
              </button>
            </div>
            <ValueInput
              value={taxValue}
              onChange={onTaxValueChange}
              symbol={taxMode === "percent" ? "%" : "$"}
              symbolPosition={taxMode === "percent" ? "suffix" : "prefix"}
            />
          </div>
        </label>

        <div>
          <label className="flex items-center justify-between text-sm mb-2">
            <span>Tip</span>
            <ValueInput value={tipPercent} onChange={onTipChange} symbol="%" symbolPosition="suffix" />
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

/**
 * A numeric input that behaves the way people expect a number field to:
 * - Focusing a field showing "0" clears it, so typing doesn't produce "01", "010", etc.
 * - Enter commits the value and blurs the field.
 * - Blurring cleans up the text: parses whatever was typed, rounds to 2 decimal
 *   places, and strips trailing/leading zeros (e.g. "5.00" -> "5", "05.10" -> "5.1").
 * - An empty field is treated as 0 on blur.
 * Used for both the tax field (% or $, depending on mode) and the tip field (%).
 */
function ValueInput({
  value,
  onChange,
  symbol,
  symbolPosition,
}: {
  value: number;
  onChange: (value: number) => void;
  symbol: string;
  symbolPosition: "prefix" | "suffix";
}) {
  const [text, setText] = useState(formatValue(value));

  // Keep the field in sync when the value changes from outside this input
  // (e.g. a tip preset button), but don't fight the user while they're typing.
  useEffect(() => {
    setText(formatValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className="relative w-24">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onFocus={(e) => {
          if (text === "0") setText("");
          e.currentTarget.select();
        }}
        onChange={(e) => {
          const raw = e.target.value;
          // Allow only digits and a single decimal point while typing.
          if (!/^\d*\.?\d*$/.test(raw)) return;
          setText(raw);
          const parsed = parseFloat(raw);
          onChange(Number.isNaN(parsed) ? 0 : parsed);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        onBlur={() => {
          const parsed = parseFloat(text);
          const clean = Number.isNaN(parsed) ? 0 : parsed;
          setText(formatValue(clean));
          onChange(clean);
        }}
        className={`w-full border border-line bg-paper py-1.5 text-sm font-mono outline-none focus:border-accent text-right ${
          symbolPosition === "prefix" ? "pl-5 pr-2" : "px-2 pr-7"
        }`}
      />
      <span
        className={`absolute top-1/2 -translate-y-1/2 text-ink-soft text-sm ${
          symbolPosition === "prefix" ? "left-2" : "right-2"
        }`}
      >
        {symbol}
      </span>
    </span>
  );
}

/** Rounds to 2 decimals and strips unnecessary trailing/leading zeros. */
function formatValue(n: number): string {
  return String(Number(n.toFixed(2)));
}
