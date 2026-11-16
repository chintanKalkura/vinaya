# Release 1 readiness

Specs for getting Vinaya v2 onto Google Play. Source: the v2 review (16 Nov 2026) and the Testing Observations doc. Same format as `../habits-section/`.

Work them in this order. Within a step, any order.

| Step | Spec | Status |
|---|---|---|
| 1. Data integrity | `storage-write-safety.md` | ready for planning |
| | `date-rollover.md` | ready for planning |
| 2. Keeping data | `google-drive-backup.md` | ready for planning |
| 3. Small UI fixes | `accessibility-fixes.md` | ready (new colour values: design decision) |
| | `usability-fixes.md` | ready (group icon look: design decision) |
| 4. Release config and cleanup | `release-build-config.md` | ready for planning |
| | `tech-debt-cleanup.md` | ready (`src_v1_backup/`: owner's decision) |
| 5. Features | `bottom-tab-navigation.md` | ready (coming-soon text TBD) |
| | `profile-tab.md` | to be designed |
| | `display-settings.md` | light theme and week start to be designed |
| | `how-to-use.md` | screens and wording to be designed |
| | `support-the-developer.md` | custom amount: open question |
| | `hours-habits-in-any-group.md` | ready (mixed card layout: design decision) |
| | `banner-colours.md` | colour set and picker to be designed |
| | `habit-group-detail-page.md` | to be designed |
| 6. Ship | `play-store-release-checklist.md` | reference checklist |

Notes:
- `google-drive-backup.md` depends on `storage-write-safety.md` (write queue) and adds tombstones that delete flows must write.
- `profile-tab.md` depends on `bottom-tab-navigation.md`.
- Wherever a spec says "design decision required", "to be designed" or "TBD", ask the owner; don't invent.
