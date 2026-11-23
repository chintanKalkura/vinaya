# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions

Follow instructions exactly as given. Do not add unrequested features, suggestions, or variations. If there is a reason to deviate, ask for confirmation and provide reasons first.

## Docs

Read the relevant doc in `docs/` before working on its area.

- `docs/app-context.md` — Vinaya v2 app context, core model, Habits flows, design source of truth
- `docs/architecture.md` — transitional state, `src_v1_backup/` and `src/` layout, code style, TypeScript, Android targets
- `docs/notifications.md` — v1 daily reminders and Mindfulness Bell, removed for release 1 (restore from the `v1-reference` tag)
- `docs/native-modules.md` — Android native modules and SharedPreferences namespace
- `docs/source-control.md` — branching and commits
- `docs/start-app.md` — commands
- `docs/google-cloud-setup.md` — Google Cloud project, OAuth clients and the `drive.appdata` scope for sign-in and Drive backup
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
- `docs/style-choices/habits-section/storage-error-messages.md` — "Couldn't load your habits" message with a red-outlined Retry in place of the list, and the "Couldn't save. Try again." snackbar above the + (or at the bottom of an open form), implemented in `src/screens/habits/LoadErrorMessage.tsx` and `src/screens/habits/SaveErrorSnackbar.tsx`
- `docs/style-choices/profile/account-and-backup.md` — Profile tab's Account & backup card (not-signed-in message, Sign in with Google, last backup or error, Back up now, Sign out, Delete backup and sign out) with the restore-result and delete-confirm dialogs, implemented in `src/screens/profile/AccountSection.tsx` and `src/screens/ProfileScreen.tsx`
- `docs/style-choices/habits-section/tap-targets.md` — only the check (or the Hours bar) marks a habit, 48dp tap areas (`TouchTarget`, the ⋮ target over the banner), the solid group status icon (circle for Required and All, square for Any), round pill checks in group view, and TalkBack labels, implemented in `src/screens/habits/HabitListRow.tsx`, `HabitPill.tsx`, `GroupCard.tsx`, `BannerMenu.tsx`, `TouchTarget.tsx` and `a11yLabels.ts`
