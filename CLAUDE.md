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
- An eve page (day 0) exists for setting intentions before the challenge begins

**Daily entry contains:**
- Habit completions — 15 habits, each with an individual max target count:
  Celibacy (keystone/21), 1 hr Meditation/15, Sutta a day/21, Right Speech/21,
  No smoking/21, No junk food/21, 21 Suryanamaskara/10, Cook or Chores/21,
  Read/15, Job hunt/15, Entertainment ≤ 1 hr/21, Write/10,
  Wake before 8/21, No mobile on bed/21, Run/6
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

## Branching
At the start of every new session, create a new git branch from main before doing any work. Branch naming: feature-<short-description>, bug-<short-description>, refactor-<short-description>

## Testing
**Libraries**: Jest + React Native Testing Library

**Coverage**: All new components and utility functions must have tests. Minimum 80% coverage on business logic (habit state, streak calculation, data serialization).

**Naming conventions**:
Test files should be named as<ComponentName>.test.tsx or <utilName>.test.ts, colocated with the source file.
Test blocks should follow describe('<ComponentName>') wrapping it('should <behaviour>')

**Standards**:
Test behaviour, not implementation
One assertion per test where possible
Mock AsyncStorage in all tests — never hit real storage in tests

## Bug Fixes
When a bug is reported follow this process:
1. Read and understand the issue fully before touching code
2. Identify the root cause — do not treat symptoms
3. Write a failing test that reproduces the bug first
4. Fix the code until the test passes
5. Confirm no existing tests broke

## Commits
Do not add co-authored by claude. Write commit messages that describe the short description of the work within 15-20 words.
Make small, frequent commits. Each commit should represent one logical unit of work — a single component, a single function, a single fix. Do not batch unrelated changes into one commit.