# Cadence Label

Scope: how a habit's or group's cadence is shown in the Habits section (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/habits/CadenceLabel.tsx`, used by `HabitListRow` (banners only) and `GroupCard`.

## Design

A small, muted label in the bottom-right corner of every banner: the repeating-calendar icon (lucide `CalendarSync`) followed by the cadence as an adverb.

| Cadence | Label |
|---|---|
| Day | Daily |
| Week | Weekly |
| Month | Monthly |
| Year | Yearly |

```
┌───────────────────────────────┐
│ ◉ Run                       6 │
│   Fitness                     │
│                     ⟳ Weekly  │
└───────────────────────────────┘
```

| Part | Style |
|---|---|
| Icon | `CalendarSync`, 12px, muted grey |
| Text | 11px, muted grey, slight letter-spacing |
| Placement | absolute, 12px from the right edge and 7px from the bottom, at 80% opacity |
| Space | every banner keeps 18px free at its bottom (`CADENCE_LABEL_SPACE`) so the label never overlaps its content |

The label's color never changes with the complete state (see `coloring-rules.md`).

## Where it appears

| Element | Label |
|---|---|
| Habit banner, list view (Checkmark and Hours) | yes |
| Group card, group view (all group types, including Hours) | yes |
| Habit pill inside a group card, group view (Checkmark pills and Hours cells) | no. The group card shows the cadence once |

On an Hours banner the bar's `{hours}/{target}h` label stays at the end of the bar line, and the cadence label sits below it in the corner (see `hours-progress.md`).

## Why

The repeating calendar reads as "this repeats", and the adverb says exactly how often, so the meaning needs no learning. It was chosen over:
- a plain calendar with the cadence word;
- a calendar with a single letter (D, W, M, Y) inside it;
- a different calendar icon for each cadence.

On Hours banners it was also compared against placing the label at the end of the bar line. The corner keeps the label in the same place on every banner, and leaves the bar its full width.
