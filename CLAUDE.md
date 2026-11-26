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
- `docs/style-choices/tabs/coming-soon.md` — Journal and Level-Up coming-soon screens (title in the Habits style, one approved paragraph each), implemented in `src/screens/ComingSoonScreen.tsx`
- `docs/style-choices/profile/profile-menu.md` — Profile menu rows under the account card (Sign out and red Delete data when signed in, About) and the About screen, whose policy links show but aren't wired yet, implemented in `src/screens/ProfileScreen.tsx`, `src/screens/profile/MenuRow.tsx` and `src/screens/profile/AboutScreen.tsx`
- `docs/style-choices/theme/light-palette.md` — dark and Lavender light palettes with their contrast, and how components read colours (`useThemedStyles`, `usePalette`), implemented in `src/theme.ts` and `src/theming.tsx`
- `docs/style-choices/profile/display-settings.md` — Display settings screen (Default view List/Group, Theme Dark/Light/System, Week starts on Monday/Sunday, applied at once, backed up), implemented in `src/screens/profile/DisplaySettingsScreen.tsx`, `src/storage/settingsStorage.ts` and `src/settings/SettingsProvider.tsx`
- `docs/style-choices/how-to-use/walkthrough-and-help.md` — first-launch walkthrough (5 cards, Skip, Get started, `onboarding_seen_v1`), Profile → How to use topics with "Show the walkthrough again", and the empty Habits line, with all their wording, implemented in `src/screens/howToUse/` and `src/content/howToUse.ts`
- `docs/style-choices/theme/completion-colours.md` — completion colours (orange, blue, red, yellow, green, purple; a shade and tint per theme) shown only when a habit or group is complete, group pills in the group's colour, and the "COMPLETION COLOUR" picker after Name (one row of swatches, and a Preview button that opens a closable not done / done row), implemented in `src/theme.ts`, `src/screens/habits/colorRules.ts` and `src/screens/habits/CompletionColourField.tsx`
- `docs/style-choices/detail/detail-page.md` — the habit and group page opened from banners, pills, Hours cells and group cards (back arrow, title card with pencil and ⋮, fact line, tappable group chips, stacked pages; rating, streaks, completion rate and trend, heatmap, History with hours per day, group members), implemented in `src/screens/detail/` with shared data in `src/screens/habits/HabitsData.tsx`
- `docs/style-choices/profile/support.md` — Support the developer screen (why line, four Play-priced amount buttons, thank-you, pending and unavailable messages, 10-second load limit), implemented in `src/screens/profile/SupportScreen.tsx` and `src/support/`
