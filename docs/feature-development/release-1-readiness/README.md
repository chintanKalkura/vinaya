# Release 1 readiness

Specs for getting Vinaya v2 onto Google Play. Source: the v2 review (16 Nov 2026) and the Testing Observations doc. Same format as `../habits-section/`.

Work them in this order. Within a step, any order.

| Step | Spec | Status |
|---|---|---|
| 1. Data integrity | `storage-write-safety.md` | done |
| | `date-rollover.md` | done |
| 2. Keeping data | `google-drive-backup.md` | done (web deletion page and Play setup outside the code) |
| 3. Small UI fixes | `accessibility-fixes.md` | done |
| | `usability-fixes.md` | done, except the keyboard bug: **not done**, parked, not reproducible |
| 4. Release config and cleanup | `release-build-config.md` | done in the code (Play Console steps outside) |
| | `tech-debt-cleanup.md` | done |
| 5. Features | `bottom-tab-navigation.md` | done |
| | `profile-tab.md` | in progress (menu and About done; About links not wired) |
| | `display-settings.md` | done (week start stored, hidden) |
| | `how-to-use.md` | done |
| | `support-the-developer.md` | done in app; Play Console products and test purchase pending |
| | `hours-habits-in-any-group.md` | ready (mixed card layout: design decision) |
| | `banner-colours.md` | colour set and picker to be designed |
| | `habit-group-detail-page.md` | to be designed |
| 6. Ship | `play-store-release-checklist.md` | reference checklist |

Notes:
- `google-drive-backup.md` depends on `storage-write-safety.md` (write queue) and adds tombstones that delete flows must write.
- `profile-tab.md` depends on `bottom-tab-navigation.md`.
- Wherever a spec says "design decision required", "to be designed" or "TBD", ask the owner; don't invent.
