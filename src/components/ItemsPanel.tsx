import { useState } from "react";
import type { Item } from "../types";

interface Props {
  items: Item[];
  onAdd: (name: string, price: number) => void;
  onRemove: (id: string) => void;
}

export function ItemsPanel({ items, onAdd, onRemove }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);
    if (!trimmedName || Number.isNaN(parsedPrice) || parsedPrice < 0) return;
    onAdd(trimmedName, parsedPrice);
    setName("");
    setPrice("");
  }

  return (
    <section className="border border-line bg-white/60 p-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-4">
        01 — Items
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="relative w-28">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm font-mono">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-line bg-paper pl-6 pr-2 py-2 text-sm font-mono outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-accent transition-colors"
        >
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-ink-soft italic">
          No items yet — add each line from the receipt.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2 text-sm">
              <span>{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono">${item.price.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="text-ink-soft hover:text-stamp"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
