# Display Settings

Scope: Profile → Display settings. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/profile/DisplaySettingsScreen.tsx`, with the store in `../../../src/storage/settingsStorage.ts` and `../../../src/settings/SettingsProvider.tsx`. Behaviour: `../../feature-development/release-1-readiness/display-settings.md`.

## Layout

The Profile stack header (back arrow, "Display settings" bold 22), then three segmented controls in the form screens' style, each under a grey capital label:

```
DEFAULT VIEW
[ List | Group ]
THEME
[ Dark | Light | System ]
WEEK STARTS ON
[ Monday | Sunday ]
```

## Behaviour

- **Default view:** List (default) or Group. The Habits screen opens in it, and switches to it at once when it's changed. The Habits header toggle still switches views for the session.
- **Theme:** Dark (default), Light (`../theme/light-palette.md`) or System, which follows the phone's dark mode and switches live. A change recolours the whole app at once, including the status and navigation bar icons.
- Changes save at once to `settings_v2`. If a save fails, the change still applies until the app is restarted.
- **Week starts on:** Monday (default) or Sunday. It orders the weekly stats, heatmap and calendar grids on the habit and group page; banners and streaks don't change.
- **Backup:** settings travel in the backup. Settings changed on this phone win; a phone that never changed them takes the backup's.

## Why

Short segmented controls match the forms, so the screen needs no new components; every option is one tap and visible at once.
