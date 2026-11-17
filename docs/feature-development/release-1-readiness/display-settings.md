# Feature: Display settings.

Status: needs design (light theme, week start use), then ready for planning.

## Goal
Users can choose which view the Habits screen opens in, light or dark theme, and the first day of the week.

## Scope (owner's answers, 16 Nov 2026)
- Default view.
- Light/dark theme. The light palette is **to be designed with Claude Code**.
- Week start day. **TBD with Claude Code**, together with the detail page.

## Decisions
1. **Where.** In the Profile tab (`profile-tab.md`), layout to be designed.
2. **Storage.** A `settings_v2` AsyncStorage key holding `{ defaultView: 'list' | 'group', theme: 'dark' | 'light' | 'system', weekStart: 'monday' | 'sunday' }`, written through the storage write queue and included in backups (`google-drive-backup.md`).
3. **Default view.** List (current behaviour) unless changed. Applies the next time the Habits screen opens; the header toggle still switches views for the session.
4. **Theme.**
   - Dark is the current v2 palette and the default. Whether to offer "System" (follow the phone): design decision required.
   - Light palette: to be designed, covering every `v2*` colour in `theme.ts`, including card tints for each banner colour (`banner-colours.md`) and the frozen look. Must pass the same contrast checks as `accessibility-fixes.md`.
   - Components read colours from a theme context instead of importing `colors` directly; that refactor can be done before the light palette exists.
   - Status bar and navigation bar follow the theme.
5. **Week start.** Week cadence uses a rolling 7-day window (`week-month-year-cadence.md`), so week start has no effect on streaks or completion today. Where it is used (the detail page calendar, stats): TBD with Claude Code. The setting isn't shown until something uses it.
6. Changes apply immediately.

## Out of scope
- Text size (the phone's font size is respected; see `accessibility-fixes.md`)

## Tests
- Settings load with defaults when missing; save and reload; included in the backup payload.
- Habits screen opens in the saved default view.
- Theme context switches palettes; components render with the light palette once it exists.
- Contrast test runs for both palettes.

## Acceptance criteria
- [ ] The Habits screen opens in the chosen default view
- [ ] Switching theme recolours the whole app immediately, with both themes passing contrast
- [ ] Settings survive a restart and are restored from a backup
