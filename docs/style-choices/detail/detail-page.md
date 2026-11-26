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

- **Page ⋮ on a habit:** Edit, Edit past days (`edit-past-days.md`; greyed on the day the habit is created), Delete habit.
- **Page ⋮ on a group:** Edit, Delete group.
- **How it behaves:** the same dropdown and delete confirm as the banner menu (`../habits-section/banner-menu.md`).
- **Edit habit:** the pencil and Edit open the edit form over the page, unchanged. Saving refreshes the page.

## Sections

Order after the fact line: rating, STREAKS, COMPLETION RATE, WHEN YOU DO IT, HISTORY (HOURS PER DAY inside it for Hours habits), then HABITS IN THIS GROUP on a group page.

- **Section cards:** each is a card like the title card (16 rounding, padding 14), with a grey bold 12 capital title (`Section.tsx`).
- **Colour:** everything coloured uses the item's completion colour (`../theme/completion-colours.md`), in both themes.
- **Numbers:** all come from `../../../src/screens/detail/pageStats.ts` and `../../../src/utils/history.ts`.

| Section | Look | Code |
|---|---|---|
| Rating | Five 22px stars, no text. Filled in the completion colour up to the overall rate rounded to the nearest fifth (84% → 4), the rest grey outlines; all empty before anything counts. TalkBack: "4 of 5 stars". | `RatingStars.tsx` |
| Streaks | Three tiles on the inset colour: Current, Best, Previous. Bold italic 26 numbers; Current is in the completion colour while above 0, grey at 0. | `StreakStats.tsx` |
| Completion rate | The overall rate, bold 34 ("—" before anything counts), with "overall, since creation". Under it "Each point is 5 days, most recent first" and the trend: a 2px line with dots (the newest larger), grid lines at 0, 50 and 100%, and every third x label. "Not enough days yet." until one slice exists. | `CompletionRateSection.tsx` |
| When you do it | One row of rounded cells, the slot label above and the share under each ("—" for a slot with no days yet). Five shade steps blended from the inset grey to the completion colour; Month and Year habits step relative to their busiest slot. "Not enough days yet." with no days at all. | `HeatmapSection.tsx` |
| History | Range chips (Last week, Last month, 3 months, 6 months, Last year; the selected one filled orange, like the Sort sheet). Month grids in a box up to 340 high that scrolls, newest month at the bottom and opened there. Weekday letters in week-start order. Days outside the range or in the future are dimmed. Legend under the grids. | `HistorySection.tsx`, `MonthGrid.tsx` |
| Hours per day | Inside History under a divider, for Hours habits: a bar a day for ranges up to a month, else a bar a week with that week's average hours a day. Bars that met the target are full colour, others faded; the target is a dashed text-colour line; a note under it says which. | `HistorySection.tsx` |
| Habits in this group | A row per member on the inset colour (48 tall): name, current streak in italic (the group's colour when the member is complete, grey otherwise), a grey bar, the member's overall rate, a chevron. The row opens the habit's page. | `MemberList.tsx` |

**Day circles** (32, in 40-tall cells):
- **Done:** filled in the completion colour, with the date in the background colour.
- **Part of an Hours target:** a ring in the colour, with the left half filled, whatever the hours.
- **Frozen:** an icy ring and date, with a small Snowflake at the top right.
- **Not done:** a grey date.
- **Today:** drawn like any other day.
