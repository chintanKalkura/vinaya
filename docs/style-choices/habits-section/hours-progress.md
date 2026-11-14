# Hours Progress

Scope: how hours logged against a daily target are shown in the Habits section (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in one place: `../../../src/screens/habits/HoursProgress.tsx`. Every Hours habit row and every Hours group card uses this component.

## Design

A single line: a progress bar, with a short hours label at its right end.

```
████████████████░░░░░  5/8h
```

| Part | Style |
|---|---|
| Bar | fills the line except for the label. 10px tall, rounded, orange fill on a grey track |
| Fill | hours logged today / daily target hours, capped at full. Empty when the target is 0 |
| Label | `{hours}/{target}h`, for example `4/1h`. Muted grey, 12px, 8px gap from the bar |

The bar and label colors never change with the complete state (see `coloring-rules.md`).

## Where it appears

| Place | Hours shown |
|---|---|
| Hours habit row, list view (screen 04) | the habit's hours today / its daily target hours |
| Hours habit in an Hours group card, group view (screen 01) | the same, in the half-width cell |
| Hours group card, group view (screen 01) | total hours today across the group / the group's daily target hours |

## Why

The earlier design put the bar and a "{hours} / {target} hrs today" caption on two lines. An Hours habit then took four lines in list view (title, group name, bar, caption) and felt bloated next to Checkmark habits. Merging the caption into the bar's line removes a line everywhere, and the short label still fits in the half-width cells of group view.

Two merged designs were compared on device. This one won over a taller bar with the caption printed inside it, which was more compact but needed a contrast color for text over both the orange fill and the dark track.

This replaces the "{hours} / {target} hrs today" caption drawn on screen 01 and specified in earlier feature docs.
