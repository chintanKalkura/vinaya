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

---

## 2. Gaps in the screens

1. **Hours-type habit creation for Week, Month, Year**: not drawn. Specified in 1.1.
2. **Group creation for Week, Month, Year**: not drawn. Specified in 1.2.
3. **Group Target semantics**: the Target field is specified (1.2) but how a group's target relates to its sub-habits' own cadence and targets is not defined.
4. **Group type All**: no dedicated screen. It has no secondary sheet, so it is assumed to match Any visually.
5. **Any / All group with habits assigned**: only the empty state (screen 11) is drawn. Required (13) and Hours (15) show assigned habits; Any and All do not.
6. **Paused and Archived appearance on screens 01 and 04**: the treatment (grey icon, greyed lettering) was decided but never drawn on habit or group items. Screen 03 only shows the filter toggles.
7. **Cadence filter on screens 01 and 04**: only Day is drawn. Week, Month and Year filtered states are not drawn.
8. **Edit, pause and archive flows**: no screen exists for editing a habit or group, or for pausing and archiving one. Paused and Archived exist as filter values, but how an item enters those states is not designed.

---

## 3. Gaps in the navigation Mermaid files

1. **`01-main-views.md` only covers screen 01 for sort and hours.** Screen 04 also has a sort button and (hours-type) habit rows. Missing edges: 04 to 03 (sort) and 04 to 02 (hours modal).
2. **Return destinations are hard-coded.** Sheets and modals return to the screen that opened them, but the diagrams show fixed targets.
   - 02 Done and 03 Apply return to 01 in the diagram; they should return to 01 or 04, whichever opened them.
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