# Split the Check

A client-side bill splitter: add items, add people, assign items (including
shared items), set tax/tip, and see what everyone owes.

## Stack

- [Vite](https://vite.dev) — dev server / build tool
- React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)

No backend, no auth, no database — everything lives in React state in the browser.

## Running it locally

You'll need [Node.js](https://nodejs.org) (v18+) installed.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

Other useful commands:

```bash
npm run build     # type-checks and builds a production bundle to dist/
npm run preview   # serves the built dist/ bundle locally
```

## Project structure

```
src/
  types.ts                  # Person, Item, BillState, PersonTotal types
  lib/
    calculations.ts         # pure functions: all the bill-splitting math
    id.ts                   # id generation helper
  components/
    ItemsPanel.tsx           # add/remove line items
    PeoplePanel.tsx           # add/remove people
    AssignmentPanel.tsx      # assign items to one or more people
    TaxTipPanel.tsx          # tax % / tip % inputs
    SummaryPanel.tsx          # final per-person breakdown
  App.tsx                    # top-level state + layout
```

All bill-splitting logic lives in `lib/calculations.ts`, independent of the
UI, so it's easy to unit test or reason about on its own.

## How the math works

- Each item's price is split evenly among the people assigned to it.
- Tax and tip are calculated on the full subtotal, then distributed to each
  person proportionally to their share of the *assigned* subtotal (items
  nobody claimed don't get charged to anyone, and the UI flags this).
- Per-person totals are rounded to the cent using the largest-remainder
  method, so they always add up exactly to the grand total (no stray pennies
  lost or gained to rounding).

## Possible next steps

- Persist state to `localStorage` so a refresh doesn't lose your bill
- Receipt photo upload + OCR to auto-fill items
- Split by percentage/exact amount instead of only "even split"
- Export/share the summary (copy as text, or a shareable link)
