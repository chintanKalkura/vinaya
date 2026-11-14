# Habits Section: Gaps and Additional Info

Scope: the Habits section only (Penpot screens 01-15 and the three Mermaid files in `docs/navigation/`). Journal, Level-Up and Profile are future work and are not covered here.

Where this document conflicts with a screen PNG or a Mermaid file, this document wins. It records changes that were decided after the screens and flow files were produced.

---

## 1. Additional info (decided changes, not yet reflected in the screens)

### 1.1 Hours-type habit creation for Week, Month and Year

Screens not yet drawn: **Week · Hours**, **Month · Hours**, **Year · Hours**.

Each looks the same as screen 10 (Day · Hours), with the cadence-specific differences below.

- Cadence pill: the matching segment (Week, Month or Year) is highlighted.
- TARGET field: identical to the Checkmark screens for that cadence.
  - Week: stepper, 1-6, suffix "of 6 max"
  - Month: stepper, max 20, suffix "of 20 max"
  - Year: stepper, max 100, suffix "of 100 max"
- TYPE pill: Hours is active.
- DAILY TARGET HOURS: the same -/value/+ stepper as screen 10, shown directly below TYPE.

Field order: Name, Cadence, Target, Streak Freeze, Type, Daily Target Hours, Habit Group, Create Habit.

The two numbers are independent. Example: Study, 8 hours, 5 days in a week means Target = 5 and Daily Target Hours = 8.

### 1.2 Group creation: Target field and cadence variants

Applies to every group creation screen: 11, 13, 15 (all currently drawn with Day cadence) and the cadence variants that are not yet drawn.

**New field.** Every group creation screen has a TARGET field.
- Placement: below CADENCE and above GROUP TYPE.
- Label: "TARGET", same label style as the habit creation screens.

**Day cadence.** No input is shown. The field is a read-only text block, identical to the one on habit creation screen 06.
- Text: "Repeats every day, no target needed"
- Style: same card, italic muted text.

**Week, Month and Year cadence.** The input is the same as the habit target input.
- Week: stepper, 1-6, "of 6 max"
- Month: stepper, max 20, "of 20 max"
- Year: stepper, max 100, "of 100 max"

Everything else on the group creation screens stays the same for every cadence. This covers Group Type, the type description, Assigned Habits, the Assign Habits and Create Habit buttons, the Required Habits row (Required type), the Hours Target stepper (Hours type), and the Create Habit Group button.

Field order: Name, Cadence, Target, Group Type, type description, Assigned Habits, action buttons, type-specific section, Create Habit Group.

**Status:** screens 11, 13 and 15 in Penpot do not yet show the Target field. Screens for Week, Month and Year group creation are not drawn.

### 1.3 Coloring rules (screens 01 and 04)

The full rules are in `docs/style-choices/coloring-rules.md`. They are implemented in one place, `src/screens/habits/colorRules.ts`. Each element is either complete or not complete today, and the streak never decides a color. These are the differences from the screens and earlier specs:

- **Marked habit rows in list view (screen 04).** Screen 04 draws marked habits with orange text on a grey row. That is superseded. A habit row in list view is a banner, like a group card on screen 01:
  - Complete: orange 2px border, orange card background, orange streak number.
  - Not complete: grey border, grey card background, grey streak number.
- **Banner titles stay white.** This covers both group cards and list rows, in both states.
- **Streak number of an unmarked habit with an active streak.** It is grey, for pills and banners alike. This supersedes rule 10 and the "grey / orange" rows of the streak table in `docs/feature-development/mark-habit.md`, which showed the number orange while the streak was alive.
- **Pills (habits inside a group card in group view).** Title, streak number and check icon are orange when complete and grey when not. The card itself does not change.
- **Hours habits inside an Hours group** are pills. They follow the pill rule, so they never get the orange banner background.
- **Banner icons when not complete.** The group selector and the Hours chart icon use the grey outline color. Screen 01 draws them white. When complete, they are orange.
- **Unchanged in both states:** the list-row group name, the progress bar and its `{hours}/{target}h` label.
- **Same rules for both habit types.** Checkmark and Hours habits use the same rules. An Hours habit is complete when its hours logged today meet its daily target hours.

### 1.4 Hours-type habits in list view (screen 04) and group view (screen 01)

Screen 04 draws Job Hunt and Study with a checkbox. That is superseded.

- Hours habits have no checkbox.
- The row shows the name, the streak, the italic group name, and a progress bar with a short `{hours}/{target}h` label at its right end, all on one line. The Hours group card uses the same bar and label. The full design is in `docs/style-choices/hours-progress.md`. It replaces the "{hours} / {target} hrs today" caption on its own line drawn on screen 01.
- The streak is the number of consecutive days the daily target hours were met. It replaces the `3h`/`2h` hours shown on screens 01 and 04; hours logged today appear in the label beside the bar instead.
- Group view (screen 01): Hours habits inside an Hours group use this same row, without the group name, two per row in the banner. This replaces the compact `Job Hunt 3h` pills drawn on screen 01.
- The bar fills with hours logged today against the habit's daily target hours, capped at full.
- Its colors follow 1.3. An Hours habit is complete when hours today ≥ the daily target hours.
- Every Checkmark habit in list view uses the round check icon, including habits in Any and All groups. The square checkbox on Cook in screen 04 is superseded.

### 1.5 Cadence filter dropdown (screens 01 and 04)

Screens 01 and 04 draw four cadence pills (Day, Week, Month, Year) with Day selected. That is superseded.

- One dropdown pill shows the selected value with a chevron. It opens a menu of All, Day, Week, Month and Year, with the selected value orange and checked.
- The default is All.
- In group view it filters groups by group cadence. In list view it filters habits by habit cadence.
- Full design: `docs/style-choices/cadence-filter.md`.

### 1.6 Week, Month and Year tracking

Week, Month and Year use rolling windows that end today, not calendar periods:
- Week is 7 days.
- Month is the number of days in today's month.
- Year is 365 or 366 days.

Further rules:
- **Complete:** a habit or group is complete while its marked days in the window reach its target.
- **Streak:** the number of marked days in the current run. Like Day, a run stays alive through the day one window after its latest mark and drops to 0 the day after (Week: marked 1 June, alive through 8 June).
- **Icon:** shows only whether today is marked.
- **Groups:** a group's days are complete by its group-type rule, and its target counts those days. Member habits' cadences don't affect this.

Full rules: `docs/feature-development/week-month-year-cadence.md`.

### 1.7 Default view, list-view streak and cadence label (screens 01 and 04)

Screens 01 and 04 are superseded on three points:

- **Default view.** The Habits screen opens in list view (screen 04), not group view (screen 01).
- **Streak position in list view.** On a habit banner in list view, the streak number sits at the right end of the title line, not right after the name. Habit pills inside a group card (group view) keep it right after the name.
- **Cadence label.** Every banner shows its cadence in the bottom-right corner: a repeating-calendar icon with Daily, Weekly, Monthly or Yearly.
  - It appears on habit banners in list view and group cards in group view.
  - Habit pills inside a group card don't show it.
  - On Hours banners it sits below the progress bar.
  - Full design: `docs/style-choices/cadence-label.md`.

### 1.8 Streak freeze (screens 01, 04 and 06-11)

- **Configuration.** Habits keep "1 skip per N streaks" (screens 06-10), with N from 1 to 100 and a default of 7. Groups get the same setting (`streakFreezeInterval`). It is not drawn on screen 11, and the create forms are not built yet.
- **Rules.**
  - One freeze is earned each time the streak reaches a new multiple of N.
  - A freeze is used on the first day the streak would break, and covers one day.
  - Freezes keep the streak intact but never add to it.
  - The number of freezes held is stored on the habit or group.
- **Look on screens 01 and 04.** On the day a freeze is used, a not complete habit or group is icy blue, with a Snowflake icon and an icy bar. Banners also show "n freezes left" at the bottom centre; pills don't.
- Full rules: `docs/feature-development/streak-freeze.md`. Design: `docs/style-choices/streak-freeze.md`.

### 1.9 Create Habit (screens 05-10)

- **Back arrow.** Every New Habit variant has the back arrow, including screen 06, where the PNG leaves it out.
- **Habit Group row.**
  - No group is selected by default; tapping the selected chip again clears it.
  - Groups the habit's type can't join are greyed out: Checkmark habits join Required, Any or All groups, and Hours habits join Hours groups.
  - "+ Create Group" and the Choice sheet's "New Habit Group" open the group form (1.10).
- **Defaults.** Target 1, streak freeze 7, daily target hours 1. The name is required, at most 40 characters.
- Full rules: `docs/feature-development/create-habit.md`.

### 1.10 Create Habit Group (screens 11-15)

- **Streak Freeze field.** Added after Target on every group form: "1 skip per [7] streaks", 1-100. Not drawn on screens 11, 13 and 15.
- **Habits in several groups.** A habit can be assigned to any number of groups; assigning never moves it. In list view its subtext names every group, comma-joined. Screen 04 shows one group name per habit.
- **All type.** Looks like Any; description "Every habit must be done to complete the group".
- **Sheets.** The Assign (12) and Required (14) sheets apply on Done and discard on the backdrop or back.
- **Hours Target.** 1-24, default 1. Screen 15 shows 8.
- **Cross-links.** Create Habit on the group form returns with the new habit assigned. "+ Create Group" on the New Habit form returns with the new group selected, and both are saved together on Create Habit.
- Full rules: `docs/feature-development/create-habit-group.md`.

---

## 2. Gaps in the screens

1. **Hours-type habit creation for Week, Month, Year**: not drawn. Specified in 1.1.
2. **Group creation for Week, Month, Year**: not drawn. Specified in 1.2.
3. **Group Target semantics**: resolved by 1.6. A group's target counts its complete days in the rolling window. Its sub-habits' cadences and targets don't affect it.
4. **Group type All**: resolved by 1.10. It looks like Any, with the description "Every habit must be done to complete the group".
5. **Any / All group with habits assigned**: resolved by 1.10. Every type uses the same Assigned Habits chip box as screens 13 and 15.
6. **Paused and Archived appearance on screens 01 and 04**: the treatment (grey icon, greyed lettering) was decided but never drawn on habit or group items. Screen 03 only shows the filter toggles.
7. **Cadence filter on screens 01 and 04**: resolved by 1.5. The filter is a dropdown (All, Day, Week, Month, Year) and its filtered states follow `docs/style-choices/cadence-filter.md`.
8. **Edit, pause and archive flows**: no screen exists for editing a habit or group, or for pausing and archiving one. Paused and Archived exist as filter values, but how an item enters those states is not designed.

---

## 3. Gaps in the navigation Mermaid files

1. **`01-main-views.md` only covers screen 01 for sort and hours.** Screen 04 also has a sort button and (hours-type) habit rows. Missing edges: 04 to 03 (sort) and 04 to 02 (hours modal).
2. **Return destinations are hard-coded.** Sheets and modals return to the screen that opened them, but the diagrams show fixed targets.
   - 02 Done and 03 Apply return to 01 in the diagram; they should return to 01 or 04, whichever opened them.
   - Create Habit (06-10) goes to 01 in `02-habit-creation.md`; it returns to 01 or 04, whichever the + was tapped from. Implemented by `docs/feature-development/create-habit.md`.
   - 12 Done goes to 13 in the diagram; it should return to the group screen that opened it (11, 13 or 15).
   - 14 Done goes to 13. This one is correct, since 14 is only opened from 13.
3. **State changes are drawn as navigation.**
   - In `02-habit-creation.md`, the cadence and type switches between 06-10 are pill selections on one form, drawn as edges between separate nodes.
   - In `03-group-creation.md`, the group type switches between 11, 13 and 15 are drawn the same way.
   - See `how-to-use-navigation-and-screen-docs.md` for how these are to be read.
4. **Return path after a redirect is unspecified.**
   - "+ Create Habit" from a group screen opens 06. "+ Create Group" from a habit screen opens 11.
   - The diagrams show Create Habit going to 01 and back going to 05 in every case.
   - Where the user lands after creating (the originating form, or 01), and whether the originating form's entered data is kept, is not defined.
5. **Create Habit and Create Habit Group return to 01 only.** The flow can be entered from 04 through 05, and the return destination in that case is not defined.