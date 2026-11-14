# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions

Follow instructions exactly as given. Do not add unrequested features, suggestions, or variations. If there is a reason to deviate, ask for confirmation and provide reasons first.

## Docs

Read the relevant doc in `docs/` before working on its area.

- `docs/app-context.md` — Vinaya v2 app context, core model, Habits flows, design source of truth
- `docs/architecture.md` — transitional state, `src_v1_backup/` and `src/` layout, code style, TypeScript, Android targets
- `docs/notifications.md` — daily reminders, Mindfulness Bell, `MINDFULNESS_TEST_MODE`
- `docs/native-modules.md` — Android native modules and SharedPreferences namespace
- `docs/source-control.md` — branching and commits
- `docs/start-app.md` — commands
- `docs/testing.md` — testing libraries, coverage, conventions
- `docs/bug-fixes.md` — bug fix process
- `docs/feature-development/habits-section/` — Habits feature specs
- `docs/style-choices/habits-section/coloring-rules.md` — Habits coloring rules for pills and banners (complete vs not complete), implemented in `src/screens/habits/colorRules.ts`
- `docs/style-choices/habits-section/hours-progress.md` — Hours progress bar with its `{hours}/{target}h` label on one line, implemented in `src/screens/habits/HoursProgress.tsx`
- `docs/style-choices/habits-section/cadence-filter.md` — cadence filter dropdown (All, Day, Week, Month, Year) in the Habits header, implemented in `src/screens/habits/CadenceFilter.tsx`
- `docs/style-choices/habits-section/cadence-label.md` — cadence label (repeating calendar + Daily/Weekly/Monthly/Yearly) in the bottom-right corner of habit and group banners, implemented in `src/screens/habits/CadenceLabel.tsx`
- `docs/style-choices/habits-section/streak-freeze.md` — frozen look on the day a streak freeze is used (Glacier icy blue, Snowflake icon, icy bar, "n freezes left" on banners), implemented in `src/screens/habits/colorRules.ts` and `src/screens/habits/FreezeLabel.tsx`
- `docs/style-choices/habits-section/banner-menu.md` — ⋮ right of the streak number on habit banners and group cards, opening an Edit/Delete dropdown (Edit opens the edit forms) and a delete confirm modal, implemented in `src/screens/habits/BannerMenu.tsx`
- `docs/style-choices/habits-section/header-and-bottom-menu.md` — "Vinaya - Habits" title in serif italic with the cadence filter, toggle and sort on one row, and the flush espresso-brown bottom menu padded by the bottom inset, implemented in `src/screens/habits/HabitsHeader.tsx` and `src/screens/habits/BottomMenu.tsx`