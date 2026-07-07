import { useMemo, useState } from "react";
import type { Item, Person } from "./types";
import { computeTotals } from "./lib/calculations";
import { makeId } from "./lib/id";
import { PeoplePanel } from "./components/PeoplePanel";
import { ItemsPanel } from "./components/ItemsPanel";
import { ReceiptScanner } from "./components/ReceiptScanner";
import { AssignmentPanel } from "./components/AssignmentPanel";
import { TaxTipPanel } from "./components/TaxTipPanel";
import { SummaryPanel } from "./components/SummaryPanel";

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxMode, setTaxMode] = useState<"percent" | "amount">("amount");
  const [taxValue, setTaxValue] = useState(0);
  const [tipPercent, setTipPercent] = useState(15);

  const totals = useMemo(
    () => computeTotals({ people, items, taxMode, taxValue, tipPercent }),
    [people, items, taxMode, taxValue, tipPercent]
  );

  function addPerson(name: string) {
    setPeople((prev) => [...prev, { id: makeId(), name }]);
  }

  function removePerson(id: string) {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((personId) => personId !== id),
      }))
    );
  }

  function addItem(name: string, price: number) {
    setItems((prev) => [...prev, { id: makeId(), name, price, assignedTo: [] }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function importScannedItems(scanned: { name: string; price: number }[], taxAmount?: number) {
    setItems((prev) => [
      ...prev,
      ...scanned.map((item) => ({ id: makeId(), name: item.name, price: item.price, assignedTo: [] })),
    ]);
    if (taxAmount !== undefined) {
      setTaxMode("amount");
      setTaxValue(taxAmount);
    }
  }

  function toggleAssignment(itemId: string, personId: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const isAssigned = item.assignedTo.includes(personId);
        return {
          ...item,
          assignedTo: isAssigned
            ? item.assignedTo.filter((id) => id !== personId)
            : [...item.assignedTo, personId],
        };
      })
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Split the Check</h1>
          <span className="font-mono text-xs text-ink-soft">itemized bill splitter</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ReceiptScanner onImport={importScannedItems} />
          <ItemsPanel items={items} onAdd={addItem} onRemove={removeItem} />
          <PeoplePanel people={people} onAdd={addPerson} onRemove={removePerson} />
          <AssignmentPanel items={items} people={people} onToggle={toggleAssignment} />
          <TaxTipPanel
            taxMode={taxMode}
            taxValue={taxValue}
            tipPercent={tipPercent}
            onTaxModeChange={setTaxMode}
            onTaxValueChange={setTaxValue}
            onTipChange={setTipPercent}
          />
        </div>

        <div className="lg:col-span-1">
          <SummaryPanel totals={totals} hasPeople={people.length > 0} />
        </div>
      </main>
    </div>
  );
}
