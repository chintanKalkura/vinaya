# Cadence Filter

Scope: the cadence filter in the Habits header (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `src/screens/habits/CadenceFilter.tsx` and used by `HabitsHeader`.

## Design

One dropdown replaces the four Day / Week / Month / Year pills drawn on screens 01 and 04.

```
Closed                       Open
┌──────────┐                 ┌──────────┐
│  All  ▾  │                 │  All  ▴  │
└──────────┘                 ├──────────┴──┐
                             │ ✓ All       │  orange
                             │   Day       │  grey
                             │   Week      │  grey
                             │   Month     │  grey
                             │   Year      │  grey
                             └─────────────┘
```

| Part | Style |
|---|---|
| Trigger | orange pill (like the selected pill before) with the selected value and a chevron, both in the dark background color. It sits where the four pills were, left of the view toggle and sort button |
| Dropdown cue | a chevron after the value: down (`ChevronDown`) when closed, up (`ChevronUp`) when open |
| Menu | a card in the card background with a border and rounded corners, dropped just below the trigger. It lists All, Day, Week, Month and Year |
| Selected option | orange text with a check before it |
| Other options | grey text, with space kept where the check would be so the labels line up |

## Behaviour

- Tapping the trigger opens the menu.
- Tapping an option selects it, closes the menu and shows the option in the trigger.
- Tapping anywhere outside the menu, or the Android back button, closes it without a change.
- The default is **All**.
- In group view the filter shows groups whose cadence matches. Each group still shows all its habits. In list view it shows habits whose cadence matches.
- Sort (when it is built) orders what the filter shows, so the filter takes precedence.

## Why

Four always-visible pills used most of the header and couldn't show "All". A single dropdown frees the space, adds All, and the chevron makes it clear that the pill opens a list.
