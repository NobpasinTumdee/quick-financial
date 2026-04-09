<p align="center">
  <img src="public/quickfinancialPNG.png" alt="Quick Financial Logo" width="120" />
</p>

<h1 align="center">Quick Financial</h1>

<p align="center">
  <strong>Personal Finance & Wealth Management</strong><br/>
  จัดการเงินส่วนบุคคลอย่างชาญฉลาด — ติดตามรายรับรายจ่าย วางแผนงบประมาณ และคาดการณ์ภาษีในที่เดียว
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-BaaS-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

---

## Features

### Dashboard
- **Net Worth** — ยอดรวมจากทุกกระเป๋าเงินแบบ real-time
- **Monthly Overview** — สรุปรายรับ, รายจ่าย และเงินออมของเดือนปัจจุบัน
- **Budget Progress** — แถบแสดงความคืบหน้า Needs / Wants / Savings เทียบกับแผนที่ตั้งไว้
- **Tax Forecast** — คำนวณภาษีเงินได้บุคคลธรรมดา (อัตราก้าวหน้าไทย) จากรายรับ YTD
- **Quick Add (FAB)** — เพิ่มรายการรายรับ/รายจ่ายได้ทันทีผ่าน Floating Action Button

### Wallets & Transactions
- จัดการกระเป๋าเงินหลายใบ (สร้าง, แก้ไข, ลบ)
- ดูประวัติ Transaction ของแต่ละกระเป๋า
- โอนเงินระหว่างกระเป๋า (Transfer) พร้อมบันทึก Transaction อัตโนมัติ
- สร้าง Category สำหรับจัดหมวดหมู่รายรับ/รายจ่าย

### Budget Planner
- ตั้งค่าเงินเดือนฐาน (Base Salary)
- ปรับสัดส่วน Needs / Wants / Savings ด้วย Slider หรือพิมพ์ตัวเลขโดยตรง (รวมกันต้อง = 100%)
- วางแผนงบประมาณล่วงหน้าได้สูงสุด 6 เดือน
- ดูประวัติแผนงบย้อนหลังพร้อม Progress Bar
- เปรียบเทียบ Plan vs Actual ของเดือนปัจจุบัน

### Multi-Theme
- **Dark** — โทนเข้มพร้อม accent สีม่วง + เขียว
- **Light** — มินิมอลขาวสะอาดตัดด้วยเขียว `#009944`
- **Pink Cute** — โทนชมพูม่วงสุดน่ารัก
- ใช้สีตามระบบ (System Preference) ได้ หรือเลือกเอง
- เก็บค่าใน Cookie — เปิดใหม่ก็ยังเป็นธีมเดิม

### Authentication & Security
- Supabase Auth (Email/Password) พร้อม Session Persistence
- Row Level Security (RLS) — ข้อมูลใครข้อมูลมัน ดูข้ามบัญชีไม่ได้
- Protected Routes — เข้าหน้าหลักไม่ได้ถ้ายังไม่ Login

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Build Tool** | Vite 8 + React Compiler |
| **Routing** | React Router DOM v7 |
| **Styling** | Plain CSS + CSS Variables + Glassmorphism |
| **Animation** | AOS (Animate On Scroll) |
| **Backend** | Supabase (Auth + PostgreSQL + RLS) |
| **Deployment** | Netlify (SPA `_redirects`) |

---

## Project Structure

```
src/
├── main.tsx                        # Entry point, AOS init
├── App.tsx                         # Router + Providers
├── Root.css                        # Global CSS, 3 theme variables
│
├── context/
│   ├── AuthContext.tsx              # Supabase session management
│   └── ThemeContext.tsx             # Theme state + cookie persistence
│
├── components/
│   ├── PrivateRoute.tsx            # Auth guard
│   └── TransactionModal.tsx        # Add income/expense modal
│
├── hooks/
│   ├── useProfile.ts               # UserProfile CRUD
│   ├── useWallets.ts               # Wallet CRUD + transfer
│   ├── useTransactions.ts          # Transaction + Category + aggregation
│   └── useBudget.ts                # BudgetPlan CRUD + history
│
├── Layout/
│   ├── Rootlayout.tsx              # App shell
│   ├── Sidebar.tsx                 # Desktop sidebar + mobile bottom nav
│   └── Layout.css
│
└── Page/
    ├── Login.tsx      + Login.css       # /login
    ├── Home.tsx       + Dashboard.css   # / (Dashboard)
    ├── Wallets.tsx    + Wallets.css     # /wallets
    ├── Budget.tsx     + Budget.css      # /budget
    └── Settings.tsx   + Settings.css    # /settings
```

---

## Database Schema (Supabase)

```
UserProfile    (id → auth.users, base_salary)
Wallet         (id, user_id, name, balance, icon_color)
Category       (id, user_id, name, type [INCOME|EXPENSE|TRANSFER], icon_name, color)
Transaction    (id, wallet_id, category_id, type, amount, transaction_date, note)
BudgetPlan     (id, user_id, month, year, needs_percent, wants_percent, savings_percent)
```

> ทุกตารางมี RLS ผูกกับ `auth.uid()` — ผู้ใช้เห็นเฉพาะข้อมูลของตัวเอง

---

## Getting Started

```bash
# Clone
git clone https://github.com/your-username/quick-financial.git
cd quick-financial

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# แก้ไข VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Environment Variables

| Variable | Description |
|----------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |

---

<p align="center">
  Built with &#9829; using React + Supabase
</p>



 Files Created

  ┌─────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                  File                   │                                                  Purpose                                                   │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/constants/minigameLevels.ts         │ 5 hardcoded puzzle levels (3x3, 3x3, 4x4, 4x4, 5x5) with solutions and point values                        │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/hooks/useMinigameProfile.ts         │ Supabase hook — fetches/creates MinigameProfile, recordWin() updates points/streak/level, hasPlayedToday() │
  │                                         │  check                                                                                                     │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/hooks/useMinigame.ts                │ Game logic hook — path tracking, adjacency validation, fixed number checkpoint enforcement, undo, reset    │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/components/Minigame/StreakBoard.tsx │ Fire streak display with animated fire icon, points, best streak, level                                    │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/components/Minigame/GameGrid.tsx    │ Interactive grid with pointer drag support (mouse + touch via elementFromPoint), connection lines, visit   │
  │                                         │ animations                                                                                                 │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/components/Minigame/WinModal.tsx    │ Victory modal with confetti particles, points earned, streak count                                         │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/Page/Minigame.tsx                   │ Main page composing all components, progress bar, instructions, already-played state                       │
  ├─────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/Page/Minigame.css                   │ Full styling — glassmorphism grid, fire gradient visited cells, pulse/glow animations, responsive mobile   │
  │                                         │ layout                                                                                                     │
  └─────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  Files Modified

  - src/App.tsx — Added /minigame route
  - src/Layout/Sidebar.tsx — Added Minigame nav item with fire icon

  Key Features

  - Drag interaction: Works with mouse drag and touch swipe (uses pointerMove + elementFromPoint)
  - Undo: Drag backward or click Undo button; Reset clears entire path
  - Checkpoint validation: Fixed numbers in the grid must be visited at the correct position in the path
  - Streak logic: Consecutive days increment streak; missing a day resets to 1; daily play limit enforced
  - Win animation: Grid cells cascade with golden glow + confetti particles fly upward
  - 5 progressive levels: 3x3 (easy) → 5x5 (harder), 10-50 points each