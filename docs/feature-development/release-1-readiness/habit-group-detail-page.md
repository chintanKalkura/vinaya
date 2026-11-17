# Feature: Habit and group detail page.

Status: to be designed with Claude Code.

## Goal
Tapping a habit banner or group card opens a page with that item's stats and other data.

## Scope (from Testing Observations)
- The banner should be clickable and take the user to a view page with stats and other data.

## Known decisions
1. **Opening it.** Tapping a habit banner (list view), a habit pill (group view) or a group card opens its page. Marking happens only from the checkmark or progress bar (`usability-fixes.md`).
2. **Back** returns to the Habits screen in the same view, scroll position kept.

## To be designed
- What the page shows for a habit and for a group (for example current and best streak, completion rate, calendar, hours chart, freezes held and used, member habits for a group).
- Whether past days can be marked or corrected from it.
- Whether the week start setting (`display-settings.md`) applies to its calendar.
- Whether Edit and Delete also live on this page.
- Screens, empty states for a new habit, and how much history is shown.

## Out of scope until designed
- Everything beyond opening the page and navigating back.

## Tests
- To be written with the design.

## Acceptance criteria
- To be written with the design.
