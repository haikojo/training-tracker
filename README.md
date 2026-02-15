# Training Tracker

A **local-first gym training tracker** for planning routines, logging workouts fast at the gym, and tracking progress over time — without accounts, sync, or distractions.

Built as a practical learning project with a focus on **speed, clarity, and usability under fatigue**.

---

## Features

- **Workout routines & templates**
  - Push / Pull / Legs, Upper / Lower, or custom splits
- **Fast workout logging**
  - Tap-based reps & weight controls (minimal typing)
  - Copy last set, mark sets done
- **Workout history**
  - Review past sessions
  - Repeat workouts easily
- **Progress tracking**
  - Best set (weight) over time
  - Volume per workout
  - Simple, readable charts
- **Workout metadata**
  - Duration
  - Effort rating (1–10)
  - Optional notes
- **Light & Dark modes**
  - Steel / graphite UI with subtle glass effects
- **Mobile-first**
  - Designed to be usable mid-set at the gym

---

## Tech Stack

- **Vite**
- **React**
- **TypeScript**
- **CSS (design tokens, no UI framework)**
- **GitHub Pages** for deployment

---

## Data Storage (Important)

This app is **local-first**.

- All data is stored **only in your browser** (via local storage)
- No accounts
- No backend
- No cloud sync
- No data leaves your device

If you clear your browser data or switch devices, the data will be lost.

This is intentional — the app is designed to be:
- fast
- private
- offline-friendly
- frictionless to use

---

## Development

### Install dependencies
```bash
npm install
