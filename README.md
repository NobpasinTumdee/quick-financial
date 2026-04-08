 Project Structure
```
  src/
  ├── main.tsx              — Entry point with AOS init
  ├── App.tsx               — Router with public/private routes
  ├── Root.css              — Global CSS (dark glassmorphism theme)
  ├── context/
  │   └── AuthContext.tsx    — Supabase Auth state management
  ├── components/
  │   ├── PrivateRoute.tsx   — Auth guard for protected routes
  │   └── TransactionModal.tsx — Add income/expense modal
  ├── hooks/
  │   ├── useProfile.ts     — UserProfile CRUD
  │   ├── useWallets.ts     — Wallet CRUD + transfer
  │   ├── useTransactions.ts — Transaction/Category CRUD + YTD/monthly aggregation
  │   └── useBudget.ts      — BudgetPlan CRUD + history
  ├── Layout/
  │   ├── Rootlayout.tsx    — App shell with sidebar + main content
  │   ├── Sidebar.tsx       — Desktop sidebar + mobile bottom nav
  │   └── Layout.css        — Layout styles (responsive)
  └── Page/
      ├── Login.tsx + Login.css       — /login (sign in/register with smooth toggle)
      ├── Home.tsx + Dashboard.css    — / (net worth, budget progress, tax forecast, FAB)
      ├── Wallets.tsx + Wallets.css   — /wallets (wallet cards, history, transfer)
      ├── Budget.tsx + Budget.css     — /budget (salary, 3 sliders = 100%, history)
      └── Settings.tsx + Settings.css — /settings (profile, salary edit, logout)
```
  Key Features

  - Auth: Supabase email/password with session persistence, auto-redirect
  - Dashboard: Net worth from all wallets, monthly income/expense/saved stats, budget progress bars
  (Needs/Wants/Savings), Thai progressive tax forecast (with ฿160k deduction), recent transactions, FAB for
  quick add
  - Wallets: Card grid, click to view transaction history, add wallet (name/balance/color), transfer between
  wallets, delete wallet
  - Budget: Editable salary, 3 linked sliders auto-balancing to 100%, visual stacked bar, save to BudgetPlan,
   6-month history table, plan vs actual comparison
  - Settings: Profile info, salary edit, tax info, logout
  - Design: Dark glassmorphism (backdrop-filter: blur, rgba backgrounds, subtle borders), AOS scroll
  animations, responsive (sidebar on desktop, bottom nav on mobile)

  Run npm run dev to start the dev server.