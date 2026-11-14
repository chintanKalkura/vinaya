# Banner Menu

Scope: the ⋮ button that opens the Edit and Delete options on banners in the Habits section (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `src/screens/habits/BannerMenu.tsx`, used by `HabitListRow` (banners only) and `GroupCard`.

## Design

A small grey ⋮ (lucide `EllipsisVertical`, 18px, muted grey) on the title line, right after the streak number.

```
┌───────────────────────────────┐
│ ◉ Run                     6 ⋮ │
│   Fitness                     │
│                     ⟳ Weekly  │
└───────────────────────────────┘
```

| Element | ⋮ |
|---|---|
| Habit banner, list view (Checkmark and Hours) | yes |
| Group card, group view (all group types) | yes |
| Habit pill or Hours cell inside a group card | no |

## Dropdown and confirm

1. **Dropdown.** Tapping ⋮ opens a small card just below it, right-aligned with it, over a transparent backdrop (like the cadence filter's dropdown):
   - **Edit** (lucide `Pencil`, white): opens Edit Habit or Edit Habit Group (`docs/feature-development/edit-habit-group.md`).
   - **Delete** (lucide `Trash2`, red): opens the confirm step.
2. **Confirm.** A small centred card over a dark backdrop: "Are you sure?" with "This can't be undone.", and Cancel and a red Delete button. The item's name isn't shown.

Tapping outside the dropdown, Cancel, the backdrop or back closes it without deleting. The red is `colors.v2Red` (`#ef5b5b`).

The dropdown's modal is not drawn under the status bar, so the ⋮'s measured window position lines up with it.

The dropdown replaces the earlier centred menu modal ("Delete habit"/"Delete group" and Cancel).

## Why

Chosen from four placements: right of the streak number, left of the streak number, the bottom-left corner, and the top-right corner with the streak moved below. Right of the streak keeps the number where it has always been and groups the item's controls on one line.
