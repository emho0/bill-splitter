import type { Item, Person } from "../types";

interface Props {
  items: Item[];
  people: Person[];
  onToggle: (itemId: string, personId: string) => void;
}

export function AssignmentPanel({ items, people, onToggle }: Props) {
  return (
    <section className="border border-line bg-white/60 p-5">
      <h2 className="font-mono text-xs tracking-[0.2em] text-ink-soft uppercase mb-1">
        03 — Assign
      </h2>
      <p className="text-sm text-ink-soft mb-4">
        Tap a name on each item. Tap more than one to split it.
      </p>

      {items.length === 0 || people.length === 0 ? (
        <p className="text-sm text-ink-soft italic">
          Add at least one item and one person to start assigning.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="border-b border-dashed border-line pb-4 last:border-0 last:pb-0">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="font-mono text-sm">${item.price.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {people.map((person) => {
                  const active = item.assignedTo.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => onToggle(item.id, person.id)}
                      className={`px-3 py-1 text-sm border transition-colors ${
                        active
                          ? "bg-accent text-white border-accent"
                          : "bg-paper text-ink-soft border-line hover:border-accent"
                      }`}
                    >
                      {person.name}
                    </button>
                  );
                })}
              </div>
              {item.assignedTo.length > 1 && (
                <p className="text-xs text-ink-soft mt-1.5 font-mono">
                  split {item.assignedTo.length} ways · ${(item.price / item.assignedTo.length).toFixed(2)} each
                </p>
              )}
              {item.assignedTo.length === 0 && (
                <p className="text-xs text-stamp mt-1.5">unassigned — won't be charged to anyone</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
