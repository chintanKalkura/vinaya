# Coloring Rules

Scope: the Habits section (group view, screen 01, and list view, screen 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

All rules are implemented in one place: `../../../src/screens/habits/colorRules.ts`. Components read their colors from there and do not decide colors themselves.

## 1. State

Every element has two states for today:
- **Complete** decides the title, the streak number and the banner.
- **Marked today** decides the icon.

A **marked day** is a day the element was marked by hand (Checkmark), met its daily target hours (Hours), or, for a group, met its group-type rule (Required, Any, All, or Hours total ≥ daily target hours).

| Cadence | Complete when | Marked today when |
|---|---|---|
| Day | today is a marked day | today is a marked day |
| Week, Month, Year | the marked days in the rolling window reach the target | today is a marked day |

For Day the two states are always the same. The rolling windows and targets are defined in `../../feature-development/habits-section/week-month-year-cadence.md`.

The streak is never used to pick a color. A habit or group with an active streak that is not complete is shown as not complete.

**Frozen today.** On the day a streak freeze is used, an element that is not complete is drawn icy blue instead of grey. The order is: complete (orange), then frozen today (icy), then grey. The full design is in `streak-freeze.md`.

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
| Check icon | follows marked today: orange fill with a check, or grey outline | |
| Card | unchanged | unchanged |

Unchanged: the blue border on required habits, the round or square check shape, and the Hours progress bar and its hours label (see `hours-progress.md`).

## 4. Banner rules

| Part | Complete | Not complete |
|---|---|---|
| Border and background | orange 2px border, orange card background | grey border, grey card background |
| Title | white | white |
| Streak number | orange | grey |
| Icon (group selector, list-row check) | follows marked today: orange fill, or grey outline | |
| Hours chart icon (group header) | follows marked today: orange, or grey | |

Unchanged in both states:
- the group name under a list row (muted grey italic)
- the `{hours}/{target}h` label beside the progress bar (muted grey, see `hours-progress.md`)
- the progress bar (orange fill on a grey track)

## 5. Other cases

- A streak of 0 is grey. It can only happen when the element is not complete.
- A Week, Month or Year element can be complete without being marked today, for example after reaching its target earlier in the window. It is then orange with an empty icon.
- On the day a freeze is used, a not complete element is icy, not grey. Its icon becomes a Snowflake, its bar fill turns icy, and a banner also shows "n freezes left" (`streak-freeze.md`).
