# Feature: Design the group view screen

Status: ready for planning.

## Goal
The Group View screen follows the design as shown in ![01 - Habits - Group view.png](../../screens/habits-section/01%20-%20Habits%20-%20Group%20view.png).
The user can see this screen with the data preloaded in the previous spec (mark-habit).

## Scope
All the design elements seen in the screen are in scope.

- The cadence header with four values (Day, Week, Month, Year) is clickable but not wired. Tapping does not change the screen.
- The big number on each group banner (12 for 8 Precepts, 0 for Eat Healthy) is a static placeholder read from the preloaded data. It is not computed (group streaks are not specified yet). It is orange on an orange banner and grey on a grey banner.
- The group view and list view toggle uses the same icons as the screen.
- The sort button uses the same icon as the screen.
- None of the buttons are wired. The action on press is empty.
- The habit group banners for 8 Precepts and Eat Healthy are designed as-is.
- A habit group has two colour layouts: grey (as for Eat Healthy) and orange (as for 8 Precepts).
- The blue-bordered pills on some habits within 8 Precepts show that those habits are marked as required.
- The round radio button and the square checkbox are designed as-is. Round is for groups of type Required. Square is for groups of type Any or All.
- The + FAB button sits in the bottom corner.
- The bottom menu has the four options: Habits, Journal, Level-Up, Profile.

Out of scope:
- Stay Productive (hours-based habits are not yet implemented)
- Wiring any button: cadence, view toggle, sort, FAB, bottom menu
- Sort & Filter sheet, Choice sheet, Hours Entry Modal
- List view (screen 04)

## Visual reference
`docs/screens/01 - Habits - Group view.png` is the source of truth for layout, spacing, colours, icons and text. Where this spec and the screen disagree, ask; do not invent.

## Rules
1. The screen renders from the preloaded data. It does not read any new data source.
2. The cadence header shows four values. The selected value is shown as on the screen. Pressing any value does nothing.
3. The view toggle shows the icons used on the screen, with the group view icon selected. Pressing either icon does nothing (the existing switch to list view is removed; list view is out of scope).
4. The sort button shows the icon used on the screen. Pressing it does nothing.
5. Each habit group is shown as a banner with its habits nested beneath it, as on the screen.
6. A group banner is orange or grey, as on the screen. The colour is decided by rule 14.
7. A habit that is marked required within a group shows the blue-bordered pill, as on the screen.
8. Habits in a Required-type group show the round radio button. Habits in an Any or All-type group show the square checkbox.
9. A habit's marked state, colour and streak display come from the mark-habit spec and are unchanged by this spec.
10. The + FAB sits in the bottom corner as on the screen. Pressing it does nothing.
11. The bottom menu shows Habits, Journal, Level-Up and Profile, with Habits selected. Pressing any item does nothing.
12. Stay Productive is not rendered. 
13. Screen shows only the groups in the preloaded data, habits that do not belong to a group should not be shown.
14. A group banner is orange when the group is complete today, grey otherwise. Completion is derived from the group's habits marked today:
    - Required: every habit in the group's required subset is marked.
    - Any: at least one habit in the group is marked.
    - All: every habit in the group is marked.
    - A group with no habits is grey.

## Preloaded data (fixtures)
The dev fixtures are changed so that the screen matches the PNG and both banner colours are exercised:
- 8 Precepts (Required): required habits are No Killing, No Stealing, Celibacy, No Intoxication, No Dinner, Sleep On Floor. All six are marked today, so the banner is orange. Right Speech and No Entertainment are not required; Right Speech is unmarked and No Entertainment is marked.
- Eat Healthy (Any): neither Cook nor Restaurant is marked today, so the banner is grey. (Cook keeps a streak ending yesterday.)
- Banner placeholder numbers: 12 for 8 Precepts, 0 for Eat Healthy.

## Acceptance criteria
- [ ] The screen matches the Group View PNG for 8 Precepts and Eat Healthy
- [ ] The cadence header shows four values and pressing them changes nothing
- [ ] The view toggle and sort button show the screen's icons and pressing them changes nothing
- [ ] 8 Precepts is orange and Eat Healthy is grey
- [ ] A group's colour follows rule 14 (e.g. unmarking a required habit turns 8 Precepts grey; marking Cook turns Eat Healthy orange)
- [ ] Habits without a group are not shown
- [ ] Required pills appear only on the habits marked required
- [ ] Round selectors appear for the Required group, square for Any/All groups
- [ ] The FAB and the four-item bottom menu are shown, and pressing them changes nothing
- [ ] Stay Productive does not appear
- [ ] Marking a habit still works as specified in mark-habit

## Open questions
None.
