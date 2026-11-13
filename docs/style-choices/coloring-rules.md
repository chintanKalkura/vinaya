# Coloring Rules

Scope: the Habits section (group view, screen 01, and list view, screen 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

All rules are implemented in one place: `src/screens/habits/colorRules.ts`. Components read their colors from there and do not decide colors themselves.

## 1. State

Every element has a single state for today: **complete** or **not complete**.

| Element | Complete when |
|---|---|
| Checkmark habit | marked today |
| Hours habit | hours logged today ≥ its daily target hours |
| Habit group | its group-type rule is met today (Required, Any, All, or Hours total ≥ target) |

The streak is never used to pick a color. A habit or group with an active streak that is not complete today is shown as not complete.

The same rules apply to Checkmark and Hours habits.

## 2. Element kinds

| Kind | Where it appears |
|---|---|
| **Pill** | A habit inside a group card in group view. Checkmark habits use the compact pill. Hours habits use the habit row component, without the group name, two per row. |
| **Banner** | A group card in group view, or a habit row in list view. |

Pills appear only in group view. List view shows only banners.

## 3. Pill rules

| Part | Complete | Not complete |
|---|---|---|
| Title | orange | grey |
| Streak number | orange | grey |
| Check icon | orange fill with a check | grey outline |
| Card | unchanged | unchanged |

Unchanged: the blue border on required habits, the round or square check shape, and the Hours progress bar and its hours label (see `hours-progress.md`).

## 4. Banner rules

| Part | Complete | Not complete |
|---|---|---|
| Border and background | orange 2px border, orange card background | grey border, grey card background |
| Title | white | white |
| Streak number | orange | grey |
| Icon (group selector, Hours chart icon, list-row check) | orange | grey outline |

Unchanged in both states:
- the group name under a list row (muted grey italic)
- the `{hours}/{target}h` label beside the progress bar (muted grey, see `hours-progress.md`)
- the progress bar (orange fill on a grey track)

## 5. Other cases

- A habit that cannot be marked (not Day cadence) shows a grey "–" in place of the streak number.
- A streak of 0 is grey. It can only happen when the element is not complete.
