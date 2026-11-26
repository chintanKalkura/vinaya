# Feature: Habit and group detail page.

Status: done (26 Nov 2026). Decided with the owner, design and wording approved on the review page the same day. Look: `../../style-choices/detail/detail-page.md`, `../../style-choices/detail/edit-past-days.md`.

## Goal
Tapping a habit banner or group card opens a page with that item's stats and history, where past days can also be fixed.

## Scope (from Testing Observations)
- The banner should be clickable and take the user to a view page with stats and other data.

## Decisions

### Opening and navigation
1. **Opening it.** Tapping a habit banner (list view), a habit pill or Hours cell (group view) opens that habit's page; tapping the rest of a group card opens the group's page. Marking still happens only from the check or the progress bar (`usability-fixes.md`).
2. **Page.** A full page in the Habits tab: back arrow, the bottom tabs stay visible. Back returns to the Habits screen in the same view, scroll position kept.

### Header
3. **Title card.** The habit or group name, a pencil (opens the edit form, unchanged) and a ⋮.
4. **Subtitle** (option B1). Under the card:
   - **Facts:** cadence and target, and freezes held (icy), as small icon + text with no outline.
   - **Group chips:** below the facts, one chip per group the habit is in, with a stronger outline and a › chevron. These are the only chips, so on this page a chip always means "tap to open".
   - **Tapping a group chip:** opens that group's page on top, and Back returns to the habit's page. It has a 48dp target, dims while pressed, and TalkBack reads "Open <name> group".
   - **Group pages:** no group chips.
   - No start date.
5. **⋮ on the page.**
   - Habit: Edit, Edit past days, Delete habit.
   - Group: Edit, Delete group (groups are never marked by hand, so no Edit past days).
6. **⋮ on the edit forms.** Edit Habit gets a ⋮ right of its title: Edit past days, Delete habit. Edit Habit Group gets one with Delete group only (no Edit past days). Deleting closes the form (and the page) and returns to the Habits screen.
7. **List menus unchanged.** The ⋮ on banners and group cards stays Edit / Delete, so Edit past days stays tucked away.

### Stats
8. **Rating.** Five stars filled from the overall completion rate, rounded to the nearest fifth: 20% is one star, 40% two, 60% three, 80% four, 100% five (so 84% shows 4, 90% shows 5, under 10% shows none). Filled stars use the item's completion colour, empty ones are grey outlines; no text. Before anything counts, all five are empty. A fuller formula may replace this later.
9. **Streaks.** Current, best and previous. Previous is the run before the latest one; when the current streak is 0, it is the run that just ended. Runs follow the banner's streak rules, with frozen days bridging a run without adding to it.
10. **Completion rate (overall).** Completed units ÷ units since the item was created.
    - Day: a unit is a day.
    - Week, Month, Year: a unit is a calendar week (from the week start setting), month or year that met the target.
    - The current day or period counts only once complete.
    - A first period the item only partly existed in counts only if it met its target.
    - Days covered by a freeze count as not done.
11. **Trend graph.** A line with the completion rate (y) for slices going back in time (x, most recent first). Each point is its own slice. At most 10 points (12 for Month), with the step growing as history grows, and shrinking for a short history so every slice holds full data:
    - Day: 5, 10 … 50 days, then 10 … 100, 15 … 150 and so on (under 50 days: a step of a tenth of the days).
    - Week: 1 … 10 weeks, then 2 … 20, 4 … 40, 8 … 80 (doubling).
    - Month: 1 … 12 months, then 2 … 24, 3 … 36.
    - Year: 1 … 10 years, then 2 … 20, 3 … 30.
12. **Heatmap** ("WHEN YOU DO IT"). One row of cells showing how often each slot is marked (marked days ÷ days in that slot), with the % under each cell. The shade has five steps (0–19, 20–39, 40–59, 60–79, 80–100%) of a blend from the empty-cell grey to the completion colour. For Month and Year habits, where few days are marked, the step is taken from the share relative to the busiest slot (the busiest slot is darkest); the % shown stays the real share.
    - Day and Week habits: Mon–Sun, in week-start order.
    - Month habits: Wk1–Wk5 of the month (days 1–7, 8–14, 15–21, 22–28, 29–31).
    - Year habits: Jan–Dec.
13. **History** (the calendar). Month grids of marks. Ranges: last week, last month, last 3 months, last 6 months, last year (default last week for Day and Week habits, last month for Month and Year). Done days are a filled circle in the item's completion colour, frozen days an icy ring, not-done days grey. For Hours habits, a day with some hours but below the target is half coloured (the same for any amount), and a day that met the target is fully coloured. Today is drawn like any other day, with no highlight. A legend sits under the grids.
14. **Hours per day.** Hours habits only, inside the History card under the legend: bars of hours per day over the History range, with the daily target as a dashed line. For 3 months and longer, one bar per week showing that week's average hours a day.
15. **Group page.** The same sections from the group's own log, then "HABITS IN THIS GROUP": one row per member with its name, current streak | overall completion rate, and a chevron; the whole row opens that habit's page. The streak follows the pill colouring (the group's colour when complete, grey otherwise).
16. **Section titles.** STREAKS, COMPLETION RATE, WHEN YOU DO IT, HISTORY (with HOURS PER DAY inside it for Hours habits), HABITS IN THIS GROUP.
17. **History rules.** Stats use the item's current cadence, target and target hours across its whole history (past values aren't stored).

### Edit past days
18. **Range.** Past days only, never today: from the later of the creation day and today − n, to yesterday. n = 7 (Day), 15 (Week), 60 (Month), 180 (Year). On the creation day there is nothing to edit, so the menu item is disabled.
19. **Pop-up.** Month calendar grids (week-start order), each cell with its date and a marker: check when marked, icy Snowflake when frozen, empty otherwise. Days outside the range are greyed and can't be tapped. Several days can be marked and unmarked, then Save or Discard; back or a tap outside discards silently. Save writes at once, separately from the edit form's own Save.
20. **Hours habits.** Tapping a day selects it; a +/− stepper in the pop-up sets its hours (0 clears the day, 24 at most).
21. **After saving** (`setPastDays`, one storage-queue operation):
    - the habit's freezes are rebuilt by replaying its history (`../habits-section/streak-freeze.md`): a frozen day that gets marked gives its freeze back, a newly unmarked day can use a held freeze
    - each group it is in is re-checked on the changed dates and today with its current members, and its freezes are rebuilt (`../habits-section/group-streak.md`)
22. **Backup.** Past edits are part of the phone's log, which wins for items on both sides (`google-drive-backup.md`, decision 5).
23. **Week start.** Shown in Display settings (`display-settings.md`); it drives the weekly periods, the heatmap order and every calendar grid.

### Wording (approved 26 Nov 2026)
24. **Help, "Marking done and logging hours":** "Tap a habit's circle to mark it done today, and tap again to undo. For an Hours habit, tap its progress bar, set today's hours and tap Done. To fix a day you missed, open the habit, tap ⋮ and choose Edit past days."
25. **Help, new topic "A habit's page":** "Tap a habit or a group to open its page, with its streaks, completion rate and history."
26. **Unchanged:** the Week, Month and Year cadence topic, and walkthrough card 2.
27. **Empty states:** trend and heatmap say "Not enough days yet."; streaks show 0, the completion rate "—" and the stars stay empty until the first day counts; History shows its days, none done.
28. **Pop-up text:** title "Edit past days"; under it "<Name> · the last <n> days. Tap days to mark or unmark them." (Hours: "Tap a day, then set its hours."); buttons Discard and Save ("Save 3 changes" once something changed).

## Build steps
1. Backup fix: the phone's log wins (PR #53).
2. Stats and past-days logic, no UI: `src/utils/history.ts`, `src/utils/pastDays.ts`, `rebuildFreezeState`, `setPastDays`, `syncGroupPastDaysInQueue`, week start setting.
3. Page shell: Habits stack, opening from banners, pills and cards, title card, subtitle, menus, edit-form ⋮.
4. Stats sections.
5. Edit past days pop-up in the page and Edit Habit menus, and the How to use wording (`src/content/howToUse.ts`).

## Tests
- Logic (step 2): streak runs against `getStreak`, calendar periods with both week starts, completion with the current and first-period rules, trend axis per cadence and history length, heatmap slots, calendar ranges, the Edit past days range, the freeze rebuild against opening the app daily (every cadence), `setPastDays` range checks, hours, freezes, groups and logs past the 90-entry `recentLog`.
- UI (steps 3–5): menus, opening pages from banners, pills, cells and cards, navigation, every section, the Edit past days range, toggles, Hours stepper, Save, Discard and failure, and a save through the page.

## Acceptance criteria
- [x] Tapping a banner, pill, Hours cell or group card opens its page; the check and bar still only mark
- [x] Back returns to the same view and scroll position
- [x] The page shows rating, streaks, completion with trend, heatmap, calendar (and Hours chart / members)
- [x] Edit past days marks and unmarks past days within the range, and streaks, freezes and groups follow
- [x] Past edits survive a backup
