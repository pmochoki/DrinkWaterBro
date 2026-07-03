# DrinkWaterBro 💧

A personal harm-reduction drink tracking app — because sometimes you need 
a friend to tell you to drink some water, bro.

## What it does

- Estimates your BAC in real time using your weight, height, age, and sex
- Shows your current zone: Sober / Buzzed / Impaired / Danger
- Logs drinks by type, volume, and ABV%
- Tracks food intake and adjusts how fast alcohol hits you
- Reminds you to hydrate during a session
- Lets you set a personal limit *before* you start drinking
- Saves session history so you can see your patterns over time

## Tech Stack

- React + Vite
- Tailwind CSS
- localStorage / IndexedDB
- PWA (installable, works offline)

## Philosophy

This app is about awareness, not optimization. It won't tell you how much 
more you can drink. It'll tell you where you're at and help you stay in 
control — that's it.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
npm run build
npm run preview
```

The PWA is installable from supported browsers after building.

## Status

🚧 In development
