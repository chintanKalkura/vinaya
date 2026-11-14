# Banner Menu

Scope: the ⋮ button that opens the delete options on banners in the Habits section (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

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
| Habit banner, list view (Checkmark and Hours) | yes, deletes the habit |
| Group card, group view (all group types) | yes, deletes the group |
| Habit pill or Hours cell inside a group card | no |

## Modals

1. **Menu.** A small centred card over a dark backdrop: "Delete habit" (or "Delete group") in red, and Cancel.
2. **Confirm.** "Are you sure?" with "This can't be undone.", and Cancel and a red Delete button. The item's name isn't shown.

Cancel, the backdrop or back closes either step without deleting. The red is `colors.v2Red` (`#ef5b5b`).

## Why

Chosen from four placements: right of the streak number, left of the streak number, the bottom-left corner, and the top-right corner with the streak moved below. Right of the streak keeps the number where it has always been and groups the item's controls on one line.
