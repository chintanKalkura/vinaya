# Edit Past Days

Scope: the pop-up that marks, unmarks or sets the hours of past days. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

- **Rules:** `../../feature-development/release-1-readiness/habit-group-detail-page.md` (decisions 18–21).
- **Implemented in:** `../../../src/screens/detail/EditPastDaysSheet.tsx`, using `MonthGrid.tsx`.
- **Shared state:** opened through `../../../src/screens/habits/HabitsData.tsx`.
- **Saved by:** `setPastDays` (`../../../src/services/habitService.ts`).

## Opening it

- **From:** the habit page's ⋮ (Edit, **Edit past days**, Delete habit) and the Edit Habit form's ⋮ (**Edit past days**, Delete habit). Groups don't have it, and the list's banner ⋮ stays Edit / Delete.
- **Disabled:** greyed on the day a habit is created, since there are no past days yet.
- **Where it appears:** over the page or the form. Its Save writes at once, separately from the form's own Save; the form keeps what was typed.

## Layout

A bottom sheet in the Sort sheet's style (card colour, 20 rounding at the top, a grey handle, a dark scrim behind), up to 85% of the screen:

```
──
Edit past days
Run · the last 7 days. Tap days to mark or unmark them.
November 2026
 M  T  W  T  F  S  S
 …  ●  ○  ●  ◌❄ ●  ·
(Hours: Wed 25 Nov  [−][ 3 ][+] of 1h)
[ Discard ]  [ Save 2 changes ]
```

- **Title:** "Edit past days", bold 18.
- **Line under the title:** "<Name> · the last <n> days. Tap days to mark or unmark them." For Hours habits: "Tap a day, then set its hours."
  - n is the number of editable days: 7, 15, 60 or 180, fewer for a habit made recently.
- **Month grids:** every month the range touches, in week-start order, newest at the bottom, opened scrolled to it.
  - The days are the History circles: done, part of an Hours target (half filled), frozen (icy with a Snowflake), not done.
  - Days outside the range, today and future days are dimmed and can't be tapped.
- **Checkmark habits:** tapping a day toggles it. Setting a day back to what's saved is not a change.
- **Hours habits:** tapping a day selects it (a ring in the text colour). The Stepper from the forms then sets its hours, 0 to 24, with "of <target>h" beside it. 0 clears the day. Before a day is picked, "Tap a day to set its hours" shows instead.
- **Buttons:** Discard (outlined) and Save (orange).
  - Save reads "Save 3 changes" once something changed, and "Saving…" while it saves.
  - Save with no changes just closes.
  - If the save fails, the sheet stays open with its changes, and the save-error message shows.
- **Closing:** Discard, Android back and a tap on the scrim close it without saving, with no question asked.

## After saving

- **What updates:** the habit's log, its freezes (rebuilt from history) and every group it's in (re-checked on the changed days and today).
- **What follows:** the page, the History, the list banners and the group cards all show the new state at once.
