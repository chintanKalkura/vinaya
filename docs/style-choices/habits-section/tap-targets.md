# Tap Targets and Labels

Scope: what can be tapped on the Habits screen, how big each tap area is, how TalkBack reads it, and the group status icon. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/habits/HabitListRow.tsx`, `HabitPill.tsx`, `GroupCard.tsx`, `BannerMenu.tsx`, `TouchTarget.tsx` and `a11yLabels.ts`. Behaviour: `../../feature-development/release-1-readiness/usability-fixes.md` and `accessibility-fixes.md`.

## Only the check marks a habit

| Where | Marks | Opens the page (`../detail/detail-page.md`) |
|---|---|---|
| Checkmark banner (list view) | the check circle | name, group, streak, rest of the banner |
| Habit pill (group view) | the check circle | name and streak, rest of the pill |
| Hours banner and Hours cell | the progress bar row (bar and `2/4h`), opens the Hours modal | name, group, streak, rest of the banner or cell |
| Group card | its habits' checks and bars (each pill or cell opens its habit) | the header, status icon and the rest of the card open the group |

The ⋮ keeps its own target. Scrolling or tapping a name can never mark a habit. For TalkBack, the name area of a banner is a button read "Open <name>, 4 of 5 stars" (pills and cells: "Open <name>"), and a group card's header is a button whose label ends with its stars, with the hint "Opens the group page".

## 48dp tap areas

Every tappable element is at least 48×48dp, without changing what is drawn:

- **Checks:** the 20px banner check and the 18px pill check grow to 48×48 with `hitSlop`, kept inside the banner or pill (Android ignores touches outside the parent). Pills are at least 48dp tall so their check fits; that is the one visible change (pills are slightly taller).
- **Hours bar:** about 16dp tall, grows to 48 with `hitSlop` (less above on banners so it stays clear of the ⋮).
- **⋮:** drawn where it was, right of the streak; its 48×48 target is placed over the banner or card at the name row's measured centre, because the name row is too short to hold it.
- **Header** (cadence filter, view toggle, sort), **sort chips, habit form group chips:** wrapped in `TouchTarget`, a transparent 48dp target around the unchanged control. The header's vertical padding shrank by the same amount, so it keeps its height.
- **Steppers:** the buttons and number box are 48dp tall.

```
┌──────────────────────────────────────┐
│ ┌──────┐                    ┌──────┐ │
│ │  ◯   │ Right Speech     0 │  ⋮   │ │   ┌──┐ = 48dp tap area (not drawn)
│ └──────┘ 8 Precepts         └──────┘ │
│                            ⟳ Daily   │
└──────────────────────────────────────┘
```

## Group status icon

A status, not a control: a small solid shape (10px) with no outline, in a 22px slot so the title stays put.

| Group type | Shape |
|---|---|
| Required, All | circle |
| Any | square (2px corners) |
| Hours | chart icon (unchanged) |

Orange when the group is complete, grey (`v2GreyOutline`) when not; the snowflake replaces it on a frozen day (`streak-freeze.md`). It has no press handler and no role, and TalkBack skips it.

## Pill checks are round

Inside a group card (group view only), every pill's check is round, whatever the group type: the card's status icon shows the type. List-view banners are unchanged.

## TalkBack

| Element | Role | Label |
|---|---|---|
| Checkmark check (banner, pill) | checkbox, with checked state | "<name>, <n> day streak" |
| Hours bar | button, no checked state | "<name>, <hours> of <target> hours today, <n> day streak" |
| Group header | (read as one item) | "<group name>, <type> group, complete/not complete, <n> day streak" |
| ⋮ | button | "Habit options" / "Group options" |
| View toggle | button, selected state | "Group view" / "List view" |
| Cadence filter | button, expanded state | "Cadence filter, <value>" |

A frozen day adds ", streak freeze used today, <n> freezes left". Names, streaks, group subtext, cadence and freeze labels and icons are hidden from TalkBack, since the labels above already say them.

## Why

A whole-banner tap target marked habits by accident while scrolling, and left nothing for the detail page. The group status icon looked like a checkbox that did nothing; a solid shape reads as a status. One round check shape in pills keeps "tap here" consistent, with the type shown once on the card. 48dp is Android's minimum touch size.
