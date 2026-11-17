# Storage Error Messages

Scope: what the Habits section shows when habits can't be loaded or a change can't be saved. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/habits/LoadErrorMessage.tsx` and `../../../src/screens/habits/SaveErrorSnackbar.tsx`, used by `HabitsScreen` and, through `FormScreen`, by the create and edit forms. Behaviour: `../../feature-development/release-1-readiness/storage-write-safety.md`.

## Load failure

The header and bottom menu stay. The list area shows a centred message instead of the habits, and the + is hidden, so nothing can be saved over data that wasn't read.

```
┌───────────────────────────────┐
│ Vinaya - Habits   All ▾  ☰ ⇅ │
│                               │
│   Couldn't load your habits   │
│ Your data is safe. Click Retry│
│        to try again.          │
│                               │
│          ( Retry )            │
│                               │
├───────────────────────────────┤
│  Habits  Journal  Level  Prof │
└───────────────────────────────┘
```

| Element | Look |
|---|---|
| Title | "Couldn't load your habits", white (`v2White`), 18, semibold |
| Subtext | "Your data is safe. Click Retry to try again.", grey (`v2GreyText`), 14 |
| Retry | transparent fill, 3px `v2Red` border, white text, pill shaped |

Retry runs the whole screen load again (dev seed, streak freezes, habits and groups).

## Save failure

A snackbar: a dark card (`v2CardBackground`) with a 4px red (`v2Red`) left edge and white text "Couldn't save. Try again.".

```
│                       ┃Couldn't save. Try again.  │
│                                            ( + )  │
├───────────────────────────────────────────────────┤
```

- **On the screen** it sits 12 above the +, 16 from each side.
- **In an open create or edit form** (a full-screen modal that covers the +) it sits 16 above the bottom edge, and the form stays open so nothing typed is lost.
- It hides itself after 4 seconds or when tapped. A new failure replaces it and restarts the 4 seconds.
- The item stays as it was before the tap.

## Why

No orange on either: orange marks progress and actions in the Habits section, and these are errors. The load message keeps the header and bottom menu so the app still looks like itself, and says the data is safe because a failed read no longer erases anything. Saves fail rarely and one at a time, so a short non-blocking snackbar is enough; it is shown inside forms too because a form covers the screen's snackbar.
