# Feature: Display settings.

Status: done (25 Nov 2026). Week start shown since 26 Nov 2026, for the habit and group page stats. Look: `../../style-choices/profile/display-settings.md`, `../../style-choices/theme/light-palette.md`.

## Goal
Users can choose which view the Habits screen opens in, light or dark theme, and the first day of the week.

## Scope (owner's answers, 16 Nov 2026)
- Default view.
- Light/dark theme. Light palette: "Lavender" (owner, 25 Nov 2026).
- Week start day: Monday (default) or Sunday.

## Decisions
1. **Where.** Profile → Display settings, its own screen (`profile-tab.md`, `../../style-choices/profile/display-settings.md`).
2. **Storage.** A `settings_v2` AsyncStorage key holding `{ defaultView: 'list' | 'group', theme: 'dark' | 'light' | 'system', weekStart: 'monday' | 'sunday' }`, written through the storage write queue and included in backups (`google-drive-backup.md`).
3. **Default view.** List (current behaviour) unless changed. Applies immediately (owner, 25 Nov 2026): the Habits screen switches to it when it's changed; the header toggle still switches views for the session.
4. **Theme.**
   - Dark is the current v2 palette and the default. Options: Dark, Light and System (follows the phone, live).
   - Light palette: Lavender, covering every `v2*` colour in `theme.ts`, including the frozen look; card tints for each banner colour come with `banner-colours.md`. Must pass the same contrast checks as `accessibility-fixes.md`.
   - Components read colours from a theme context instead of importing `colors` directly; that refactor can be done before the light palette exists.
   - Status bar and navigation bar follow the theme.
5. **Week start.** Monday (default) or Sunday, shown in Display settings. Banners and streaks still use the rolling 7-day window (`week-month-year-cadence.md`), so it doesn't change them. It decides the calendar weeks behind weekly completion rates, the heatmap's weekday order, and the first column of every calendar grid on the habit and group page and in Edit past days (`habit-group-detail-page.md`).
6. Changes apply immediately.

## Out of scope
- Text size (the phone's font size is respected; see `accessibility-fixes.md`)

## Tests
- Settings load with defaults when missing; save and reload; included in the backup payload.
- Habits screen opens in the saved default view.
- Theme context switches palettes; components render with the light palette.
- Contrast test runs for both palettes.

## Acceptance criteria
- [x] The Habits screen opens in the chosen default view
- [x] Switching theme recolours the whole app immediately, with both themes passing contrast
- [x] Settings survive a restart and are restored from a backup
