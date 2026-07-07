export interface Person {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  price: number; // dollars
  assignedTo: string[]; // Person ids sharing this item. Empty = unassigned.
}

export interface BillState {
  people: Person[];
  items: Item[];
  taxMode: "percent" | "amount";
  taxValue: number; // interpreted as a percent or a flat dollar amount depending on taxMode
  tipPercent: number;
}

export interface PersonTotal {
  personId: string;
  name: string;
  subtotal: number; // sum of this person's share of each item
  taxShare: number;
  tipShare: number;
  total: number;
}
