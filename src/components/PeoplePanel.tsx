import { useState } from "react";
import type { Person } from "../types";

interface Props {
  people: Person[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function PeoplePanel({ people, onAdd, onRemove }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  }

  return (
    <section className="border border-line bg-white/60 p-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-4">
        02 — People
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a name"
          className="flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-ink text-paper hover:bg-accent transition-colors"
        >
          Add
        </button>
      </form>

      {people.length === 0 ? (
        <p className="text-sm text-ink-soft italic">
          Nobody on the bill yet — add everyone splitting the check.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-2 border border-line bg-accent-soft px-3 py-1.5 text-sm"
            >
              <span>{person.name}</span>
              <button
                type="button"
                onClick={() => onRemove(person.id)}
                aria-label={`Remove ${person.name}`}
                className="text-ink-soft hover:text-stamp"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
