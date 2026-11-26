# Habit and Group Page

Scope: the page a habit or group opens, in the Habits tab. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

- **Spec and decisions:** `../../feature-development/release-1-readiness/habit-group-detail-page.md`.
- **Implemented in:** `../../../src/screens/detail/HabitDetailScreen.tsx`, with the fact line in `subtitleText.ts`.
- **Navigation:** the Habits stack in `../../../App.tsx`.
- **Shared state:** the page and the Habits list share data, saves and forms through `../../../src/screens/habits/HabitsData.tsx`.
- **Design:** approved on the design review page on 26 Nov 2026.

## Opening it

| Tap | Opens |
|---|---|
| A habit banner (list view), anywhere but the check, the Hours bar and ⋮ | that habit's page |
| A habit pill or Hours cell in a group card, anywhere but its check or bar | that habit's page |
| The rest of a group card (header, status, empty space) | that group's page |
| A group chip on a habit's page | that group's page, on top |

- **Stacking:** pages stack. Back (the arrow or Android back) goes back one page, and the Habits list keeps its view, filters and scroll position.
- **Bottom tabs:** they stay visible.
- **Deleted items:** if the item is deleted (from the page, its edit form or a restore), the page returns to the Habits list.

## Layout

```
‹
┌──────────────────────────────────┐
│ No Intoxication            ✎   ⋮ │
└──────────────────────────────────┘
 ⟳ Daily        ❄ 1 freeze held
 ( ≋ 8 Precepts › )
 [rating, streaks, completion rate, when you do it, history, members]
```

- **Back arrow:** top left, 26px, in a 48dp target.
- **Title card:** the card style of the banners (16 rounding, 1dp border, card background).
  - The name is bold 24 in the text colour.
  - Then a pencil (lucide `Pencil`, 20) and a ⋮ (`EllipsisVertical`, 22), both in the text colour and in 48dp targets.
- **Fact line (subtitle option B1):** plain grey text with small icons, no outlines.
  - ⟳ the cadence and target ("Daily", "3 days a week", "Once a month", plus "· 2h a day" for Hours habits; groups add "· Any group" or "· Hours group, 8h a day").
  - ❄ "n freezes held" in icy blue.
- **Group chips:** on a habit's page, one chip per group it's in, on its own line under the facts.
  - Layers icon, the group's name and a › chevron.
  - Outlined more strongly (1.5dp grey outline) than anything else.
  - These are the only chips on the page, so a chip always means "tap to open".
  - 36dp tall with 6dp extra tap area above and below (48dp).
  - Dims while pressed. TalkBack reads "Open Fitness group".
  - Group pages have none.

## Menus

- **Page ⋮ on a habit:** Edit, Delete habit.
- **Page ⋮ on a group:** Edit, Delete group.
- **How it behaves:** the same dropdown and delete confirm as the banner menu (`../habits-section/banner-menu.md`).
- **Edit habit:** the pencil and Edit open the edit form over the page, unchanged. Saving refreshes the page.
- **Coming later:** Edit past days joins the habit's menu with the Edit past days pop-up.

## Sections
Rating, streaks, completion rate with its trend, when you do it, history (with hours per day for Hours habits) and the members of a group are added in the next build step. The spec has their design (decisions 8–17).
