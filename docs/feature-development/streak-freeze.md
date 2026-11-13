# Feature: Streak freeze should be applicable as per configuration for both habits and groups

Status: ready for planning.

## Goal
User should be able to configure a streak freeze for both habits and groups.
Streak freezes should apply when applicable.

## Screen
- ![06 - Create_ New Habit - Day.png](../screens/06%20-%20Create_%20New%20Habit%20-%20Day.png)
- ![07 - Create_ New Habit - Week.png](../screens/07%20-%20Create_%20New%20Habit%20-%20Week.png)
- ![08 - Create_ New Habit - Month.png](../screens/08%20-%20Create_%20New%20Habit%20-%20Month.png)
- ![09 - Create_ New Habit - Year.png](../screens/09%20-%20Create_%20New%20Habit%20-%20Year.png)
- ![10 - Create_ New Habit - Day - Hours.png](../screens/10%20-%20Create_%20New%20Habit%20-%20Day%20-%20Hours.png)

## Scope
- Seed streak freeze configuration and also some new habits to test the streak freeze functionality.
- The coloring of the banners and pills should change - we use a new color icy blue to indicate freeze.
- When freeze is applied, a overlay text over the banners only and not pills to show n freezes left in icy blue color.
- place the overlay text in bottom centre.
- The streak freeze applies on the first day streak is being broken.
- Number of streak freezes available is calculated and stored as and when the marking or completion of the habits or groups happens.
- Number of streak freezes available is not be calculated using history, but stored in the object.
- Streak freeze doesn't add to the streak, it only keeps the streak intact for as long as possible.
- For cadences other than day, the freeze is applied on the first day the streak is broken.
- Streak freeze calculation cannot overlap - for ex 1 streak freeze in 7 days for a day cadnece habit with a streak of 11 on day 12 doesn't mean
  more than one streak freeze available. days 1-7 give one freeze, days 8-14 give second one.
- The icons should turn into ice and the progress bar also should turn into a ice based design. (decision 7)

## Decisions
1. **Configuration.** "1 skip per N streaks", N from 1 to 100, default 7 (`DEFAULT_HABIT_LIMITS`). It is stored as `streakFreezeInterval` on both `Habit` and `HabitGroup`. A group earns and uses freezes on its own streak; its members' freezes don't affect it.
2. **Stored state.** Each habit and group stores `streakFreeze`: `available` (freezes held), `earnedAtStreak`, `frozenDates` (days a freeze covered) and `lastUsedOn`. It is never worked out from history. When it is missing, nothing has been earned or used.
3. **Earning.** One freeze is earned each time the streak reaches a new multiple of N in the current run (N, 2N, 3N…). Earning happens when a habit is marked, unmarked or has hours logged, and when a group's day completes.
   - Example: N = 7 and a streak of 11 → 1 freeze. The second freeze comes at streak 14, not 12.
   - Unmarking today takes back the freeze that today's mark earned, if it is still held.
   - Freezes are kept after a streak breaks, with no cap.
4. **Using.** A freeze is used on the first day the streak would break, and covers one day for every cadence.
   - **Day:** the missed day, which is yesterday when today starts.
   - **Week, Month, Year:** the last day a mark could have continued the run, once it has passed without one (decision 9). Each frozen day gives the run one more day.
   - Freezes are used once a day, when the Habits screen loads (`applyStreakFreezes`). After several days away, one freeze is used per missed day, oldest first, the same as if the app had been opened every day. When the freezes run out, the streak breaks.
5. **Streak.** Frozen days bridge the run but never add to the streak or count toward the target.
   - Example: Day habit, streak 9, 1 freeze, yesterday missed. Today the freeze covers yesterday and the streak stays 9. Marking today makes it 10.
6. **Frozen look.** It shows only on the day a freeze is used, while the streak is still alive. Complete beats frozen: complete (orange), then frozen today (icy), then grey.
   - Example (decision 5): today the habit is icy with "0 freezes left". Marking it turns it orange at 10. Tomorrow it looks normal again.
7. **Design.** Glacier icy blue `#5ec8e5`, lucide `Snowflake` in place of the check, group selector or Hours chart icon, and a solid icy bar fill. Pills and banners both change; banner titles stay white. See `docs/style-choices/streak-freeze.md`.
8. **Freeze text.** "n freezes left" ("1 freeze left") at the bottom centre of habit banners (list view) and group cards, in icy blue. Pills never show it.
9. **Week, Month and Year streaks stay alive one day longer.** This amends decision 5 of `week-month-year-cadence.md` so these cadences behave like Day: a run stays alive through the day one window after its latest mark, and breaks only once that day ends with no mark.
   - Example: Week, 1 freeze, last marked 1 June. 2–8 June: alive (counting back 7 days from 8 June reaches 1 June). 9 June: 8 June ended with no mark, so the freeze covers 8 June and the streak stays. Marking on 9 June continues the run.
   - Why: before, the streak showed as broken on 8 June while a mark that day still continued the run, so a freeze used that morning could be wasted by marking later the same day. Now a freeze always covers a day that is already over, as for Day.

## Fixtures
Day offsets are relative to today (0 = today). The freezes are used by `applyStreakFreezes` on load, not by the seed. Every other fixture holds the freezes its current streak earned (decision 3) and uses none.

| Item | Setup | Shown today |
|---|---|---|
| Meditate (Day, Checkmark, N 7) | marked −10…−2, missed −1, 1 freeze held | icy, streak 9, "0 freezes left" |
| Stretch (Day, Checkmark, N 3) | marked −6…0, 2 freezes held | orange, streak 7, no freeze used |
| Swim (Week, Checkmark, target 2, N 3) | marked −14, −11, −8; 1 freeze held | icy (−1 was its last chance and passed unmarked), streak 3, "0 freezes left" |
| Read Fiction (Day, Checkmark, N 7, in Wind-down) | marked −9…−2, missed −1, 1 freeze held | icy, streak 8, "0 freezes left" |
| Wind-down group (Day, Any, N 7) | complete −9…−2, missed −1, 2 freezes held (one kept from an earlier run) | icy, streak 8, "1 freeze left" |
| Practice Guitar (Day, Hours, 2h a day, N 7) | 2h −9…−2, nothing −1, 1h today, 1 freeze held | icy with a half-filled icy bar, streak 8, "0 freezes left" |
| Sketch, Code (Day, Hours, 1h a day, N 7, in Side Projects) | 1h −9…−2, nothing −1 or today, 1 freeze held each | icy, streak 8, "0 freezes left" |
| Side Projects group (Day, Hours, 2h a day, N 7) | complete −9…−2, missed −1, 1 freeze held | icy with the Snowflake in place of the chart icon, streak 8, "0 freezes left" |

## Out of scope
- habit creation
- Create Habit and Create Habit Group forms, including the Streak Freeze field (screens 06-11)
- Editing N on an existing habit or group
- Showing the number of freezes held on days no freeze is used

## Tests
- Earning: streak 11 with N 7 gives 1 freeze, and 14 gives 2. Unmarking undoes today's freeze. Freezes are kept after the streak breaks.
- Using:
  - Day: the missed day is frozen, the streak stays the same, and only one freeze is used.
  - Several missed days use one freeze each.
  - Too few freezes: the streak breaks and earning starts again from 0.
  - Week: no freeze is used on the last day the run can still be marked; once it passes, that day is frozen and the run gets one more day.
  - Opening the app daily or after a gap gives the same result.
- Streak: frozen days bridge Day and Week runs but don't count toward the streak or the target. Frozen today only on the day of use and only while the streak is alive.
- Coloring: pills and banners are icy when frozen. Banner titles stay white. Complete beats frozen.
- Components: the Snowflake replaces the check, selector and chart icon, the bar turns icy, and "n freezes left" shows on frozen banners only, never on pills.
- Services: earning on mark, unmark, hours logged and group sync. `applyStreakFreezes` saves only what changed.
- Habits screen: freezes are used on load.
- Seed: every fixture state above.

## Acceptance criteria
- [ ] Habits and groups store their freeze interval and freeze state
- [ ] Freezes are earned in blocks of N that don't overlap, and kept after a break
- [ ] A freeze is used on the first day a streak would break and keeps the streak without adding to it
- [ ] On that day the habit or group is icy blue with a Snowflake icon and an icy bar, and banners show "n freezes left" at the bottom centre
- [ ] Marking a frozen habit turns it orange
- [ ] The seeded fixtures show frozen Checkmark and Hours habits, a frozen Checkmark group and Hours group, a frozen Week habit, and a habit with freezes held but not needed

## Decision pending
None. Icy blue color, text placement and ice icon: decisions 6-8.
