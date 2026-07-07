import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { parseReceiptText, type ParsedLineItem } from "../lib/receiptParser";
import { makeId } from "../lib/id";

interface ReviewItem extends ParsedLineItem {
  id: string;
  include: boolean;
}

interface Props {
  /** Called when the user confirms the review list. taxAmount (a flat dollar figure) is omitted if no tax line was detected. */
  onImport: (items: { name: string; price: number }[], taxAmount?: number) => void;
}

type Status = "idle" | "scanning" | "reviewing" | "error";

export function ReceiptScanner({ onImport }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [detectedTaxAmount, setDetectedTaxAmount] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("scanning");
    setProgress(0);
    setErrorMessage(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const worker = await Tesseract.createWorker("eng", Tesseract.OEM.LSTM_ONLY, {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      // Receipts have a big visual gap between left-aligned item names and
      // right-aligned prices. Tesseract's default automatic layout analysis
      // often misreads that gap as two separate columns, outputting all the
      // item names first and all the prices afterward instead of keeping
      // each name+price on one line. PSM.SINGLE_COLUMN tells it this is one
      // column of variable-sized text (a good match for a receipt) and to
      // preserve top-to-bottom reading order instead.
      await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SINGLE_COLUMN });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseReceiptText(data.text);

      const items: ReviewItem[] = parsed.items.map((item) => ({
        ...item,
        id: makeId(),
        include: true,
      }));

      if (items.length === 0) {
        setErrorMessage(
          "Couldn't confidently detect any line items in that photo. Try a clearer, straight-on photo, or add items manually below."
        );
        setStatus("error");
        return;
      }

      setReviewItems(items);

      if (parsed.tax !== undefined) {
        setDetectedTaxAmount(parsed.tax);
      } else {
        setDetectedTaxAmount(undefined);
      }

      setStatus("reviewing");
    } catch (err) {
      setErrorMessage("Something went wrong reading that image. Try a different photo.");
      setStatus("error");
    }
  }

  function updateItem(id: string, patch: Partial<ReviewItem>) {
    setReviewItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setReviewItems((prev) => prev.filter((item) => item.id !== id));
  }

  function confirmImport() {
    const toAdd = reviewItems.filter((item) => item.include && item.name.trim() && item.price >= 0);
    onImport(
      toAdd.map((item) => ({ name: item.name.trim(), price: item.price })),
      detectedTaxAmount
    );
    reset();
  }

  function reset() {
    setStatus("idle");
    setProgress(0);
    setPreviewUrl(null);
    setReviewItems([]);
    setDetectedTaxAmount(undefined);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="border border-line bg-white/60 p-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-1">
        00 — Scan a Receipt
      </h2>
      <p className="text-sm text-ink-soft mb-4">Optional — snap or upload a photo to auto-fill items.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {status === "idle" && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-dashed border-line py-6 text-sm text-ink-soft hover:border-accent hover:text-accent transition-colors"
        >
          Tap to upload a receipt photo
        </button>
      )}

      {status === "scanning" && (
        <div className="flex flex-col items-center gap-3 py-6">
          {previewUrl && (
            <img src={previewUrl} alt="Receipt preview" className="max-h-40 object-contain border border-line" />
          )}
          <div className="w-full bg-line h-1.5">
            <div className="bg-accent h-1.5 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-ink-soft font-mono">Reading receipt… {progress}%</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3">
          {previewUrl && (
            <img src={previewUrl} alt="Receipt preview" className="max-h-40 object-contain border border-line mx-auto" />
          )}
          <p className="text-sm text-stamp">{errorMessage}</p>
          <button
            type="button"
            onClick={reset}
            className="self-start px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-accent transition-colors"
          >
            Try another photo
          </button>
        </div>
      )}

      {status === "reviewing" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Found {reviewItems.length} item{reviewItems.length === 1 ? "" : "s"}. Check the names and prices,
            then add what looks right.
          </p>

          <ul className="flex flex-col gap-2">
            {reviewItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.include}
                  onChange={(e) => updateItem(item.id, { include: e.target.checked })}
                  className="accent-accent"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  className="flex-1 border border-line bg-paper px-2 py-1 text-sm outline-none focus:border-accent"
                />
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-soft text-xs font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-line bg-paper pl-5 pr-2 py-1 text-sm font-mono outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Discard ${item.name}`}
                  className="text-ink-soft hover:text-stamp"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {detectedTaxAmount !== undefined && (
            <p className="text-xs text-ink-soft font-mono">
              Detected tax: ${detectedTaxAmount.toFixed(2)} — will be applied automatically
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmImport}
              className="px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-accent transition-colors"
            >
              Add to bill
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-sm text-ink-soft border border-line hover:border-accent transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
