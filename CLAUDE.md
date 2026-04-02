# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions

Follow instructions exactly as given. Do not add unrequested features, suggestions, or variations. If there is a reason to deviate, ask for confirmation and provide reasons first.

## App

**Vinaya** — bare React Native, TypeScript, Android-only target. Uses `@react-native-async-storage/async-storage` for local storage. No Expo.

## Vinaya — App Context

A personal discipline tracker and journal. 21-day challenge. Fully offline. Android-only.

**Challenge structure:**
- Runs for 21 days
- 1 streak freeze available per challenge, unlocks after day 15
- An eve page (day 0) exists for setting intentions before the challenge begins

**Daily entry contains:**
- Habit completions (list TBD — placeholder for now)
- 4 mood/state readings: Viriya, Samādhi, Vedanā, Sampajañña — each with 4 options
- Free-form journal text
- Win/Lost/Fought outcome for the day
- 3 intentions for the next day

**Intentions carry-forward:**
- Previous day's intentions are shown at the top of the next day
- Each intention has a 3-state toggle: default (no), single tap (yes ✅), double tap (partial ＊)

**Data architecture:**
- Config (habit definitions, challenge metadata) is separated from daily log data
- Daily log keyed by date string (`YYYY-MM-DD`)
- Storage: `@react-native-async-storage/async-storage`

## Commands

```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Lint
npm run lint

# Test (all)
npm test

# Test (single file)
npx jest path/to/file.test.tsx
```

## Architecture

This is a minimal React Native scaffold. The app registers via `index.js` → `App.tsx`. No navigation library, state manager, or `src/` directory structure has been established yet.

**Code style** (enforced via `.prettierrc.js`): single quotes, trailing commas, no parens on single arrow-function params.

**TypeScript** extends `@react-native/typescript-config`; all source files are `.ts`/`.tsx`.

**Android targets** API 24 (min) → 36 (target), New Architecture enabled (`newArchEnabled=true`), Hermes enabled.
