# Expense Tracker Workshop Starter – Codebase Overview

## Project Purpose

A lightweight personal expense tracker web application for recording and viewing income and expenses with filtering capabilities. Built as a workshop starter with synthetic in-memory data that resets on page reload. No backend, no persistence—everything is client-side only.

## Architecture

Single-page application (SPA) with all logic contained in a single React component (`App.jsx`). The design uses a simple unidirectional data flow:

```
index.html → src/main.jsx → src/App.jsx
                           ├─ State: transactions, filters, form inputs
                           ├─ Handlers: add transaction, filter, validation
                           └─ Rendering: summary cards, form, transaction table
```

## Tech Stack

- **React 19.2** – Core UI framework
- **Vite 7.2** – Fast build tool and dev server
- **Playwright 1.63** – E2E testing
- **ESLint + Prettier** – Code quality and formatting
- **Plain CSS** – Styling (no preprocessors or CSS-in-JS)
- **Node.js 22.12** – Runtime

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (App.jsx, styles, icons) |
| `tests/` | Playwright E2E test suite (baseline.spec.js) |
| `scripts/` | Development utilities (Chrome DevTools MCP) |
| `public/` | Static assets (favicon) |
| `docs/` | Documentation images |

## Key Entry Points

- **`index.html`** – HTML entry point with root mount point
- **`src/main.jsx`** – JavaScript entry point; imports React, App component, and styles, then renders app in StrictMode
- **`src/App.jsx`** – Single React component containing all business logic, form handling, filtering, and UI rendering

## How the Pieces Connect

### State Management

All state lives in `App.jsx`:

```javascript
const [transactions, setTransactions] = useState(createInitialTransactions)
const [description, setDescription] = useState('')
const [amount, setAmount] = useState('')
const [type, setType] = useState('expense')
const [category, setCategory] = useState('food')
const [filterType, setFilterType] = useState('all')
const [filterCategory, setFilterCategory] = useState('all')
const [error, setError] = useState('')
```

- **`transactions`** – Array of transaction objects with id, description, amount, type, category, date
- **`filterType` / `filterCategory`** – Control which rows display in the table
- **Form inputs** – description, amount, type, category
- **`error`** – Validation error message

### Totals and Filters (Critical Design Detail)

#### How Totals Work

```javascript
const totalIncomeCents = sumCents(transactions.filter(t => t.type === 'income'))
const totalExpensesCents = sumCents(transactions.filter(t => t.type === 'expense'))
const balanceCents = totalIncomeCents - totalExpensesCents
```

**Key point:** Totals are calculated from **all transactions**, regardless of filters applied. They always show the complete financial picture.

#### How Filters Work

```javascript
let filteredTransactions = transactions
if (filterType !== 'all') {
  filteredTransactions = filteredTransactions.filter(t => t.type === filterType)
}
if (filterCategory !== 'all') {
  filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory)
}
```

Filters **only affect which rows display in the table**. They don't change the totals or any calculations.

#### Why This Design

This is intentional: the summary cards (Income, Expenses, Balance) always reflect your actual financial position. Filters let you drill into specific categories to investigate transactions, but the totals remain constant. The UI explicitly states this on line 148: *"Filters affect table rows only. Account totals include all transactions."*

### Data Flow for Adding Transactions

1. User submits form with description, amount, type, category
2. `handleSubmit` validates:
   - Description: 1–120 characters
   - Amount: matches regex `^\d+|\d*\.\d{1,2}$` and is between $0.01 and $1,000,000
3. If valid: create new transaction object with UUID and today's date
4. Add to transactions array via `setTransactions(previous => [...previous, newTransaction])`
5. Clear form inputs and error state
6. Component re-renders with updated totals and table

## Features

- **Summary cards** – Display total income, total expenses, and current balance
- **Add transactions** – Form with description, amount, type (income/expense), and category (7 options: food, housing, utilities, transport, entertainment, salary, other)
- **Independent filters** – Filter by type and category separately or combined
- **Form validation** – User-friendly error messages for invalid input
- **Empty state** – Message when no transactions match filters
- **Responsive design** – Works on mobile widths (320px+)
- **Accessibility** – Proper ARIA labels, roles, and semantic HTML

## Initial Data

Eight seeded transactions provide demo/testing data:

- Salary: +$5,000
- Freelance Work: +$800
- Rent: -$1,200
- Groceries: -$150
- Electric Bill: -$95
- Dinner Out: -$65
- Gas: -$20
- Netflix: -$15

**Net balance**: $5,175 (all income and expenses visible in summary)

## Testing

`tests/baseline.spec.js` contains comprehensive Playwright E2E tests covering:

- Numeric correctness (sums, not string concatenation)
- Form scoping with multiple forms
- Deterministic fixture data across year boundaries
- Decimal amount handling
- Invalid input validation
- Filter combination behavior and empty states
- Data persistence (no reload = no reset)
- Responsive design on narrow screens
- Accessibility of all form controls

Tests run against the dev server on port 5174, which auto-starts before execution.

## Workshop Learning Goals

This is a focused starter for teaching:

- React fundamentals (state, hooks, forms, conditional rendering)
- Form handling and validation
- Filtering and derived data (computed values without mutating state)
- Testing with Playwright
- Accessible UI patterns
- Clean, maintainable component structure

All logic is intentionally in a single component to keep the scope manageable for a workshop setting.
