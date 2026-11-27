# Walkthrough and Help

Scope: the first-launch walkthrough, Profile → How to use, and the empty Habits screen line. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/howToUse/WalkthroughScreen.tsx`, `HelpScreen.tsx`, `../../../src/content/howToUse.ts` (all wording) and `../../../src/screens/HabitsScreen.tsx` (empty line). Behaviour: `../../feature-development/release-1-readiness/how-to-use.md`.

## Walkthrough

Full screen over the app, on the screen background. Five cards swiped sideways (paging, no library), each a large orange lucide icon (88, thin stroke), a title in the Habits title look (serif italic, 26) and a centred grey body (16/24).

```
                       Skip
          [icon]
   Build habits your way
   Give a habit a name …
        ▬ • • • •
   [        Next        ]
```

| Card | Icon | Title | Body |
|---|---|---|---|
| 1 | ListChecks | Build habits your way | Give a habit a name and choose how often it repeats: every day, or a number of days each week, month or year. A habit is either a Checkmark you tick off or Hours you log. |
| 2 | CircleCheck | Mark it done | Tap the circle to mark a habit done today. For an Hours habit, tap its bar to log the hours you spent. |
| 3 | Snowflake | Keep your streak going | Each day you complete a habit adds to its streak. Streaks earn freezes, and you choose how many streak days earn one. A freeze covers a missed day so the streak isn't lost. |
| 4 | LayoutGrid | Group related habits | Put habits in a group and choose what completes it: all of them, any one, the required ones, or a total of hours. |
| 5 | Cloud | Keep your progress safe | Sign in with Google in Profile to back up your habits to the cloud and bring them to a new phone. |

- **Skip** (grey, top right) on every card; **Next** (orange button) becomes **Get started** on the last card. Android back acts as Skip.
- **Dots** show the position; the current one is a wider orange bar.
- **First launch:** shown over Habits when `onboarding_seen_v1` is missing. Skip, Get started or back set it. The flag stays on this phone (not in backups), so a restore doesn't show it again. A failed read counts as seen.
- **Replay** from How to use shows the same cards and doesn't change the flag.

## How to use (Profile)

The Profile stack header "How to use", then nine topic rows (white 16 semibold, chevron down; up when open, hairline divider). Tapping a topic opens its text (grey 15/22) under it and closes the one open before. An orange "Show the walkthrough again" button sits below the list.

| Topic | Text |
|---|---|
| Creating a habit | Tap + and choose New Habit. Give it a name, a cadence (Day, Week, Month or Year) and, for Week, Month or Year, how many days in that period it should be done. Choose Checkmark to mark it done, or Hours to log time against a daily target. You can add it to a group here, or create a new group for it. |
| Marking done and logging hours | Tap a habit's circle to mark it done today, and tap again to undo. For an Hours habit, tap its progress bar, set today's hours and tap Done. To fix a day you missed, open the habit, tap ⋮ and choose Edit past days. |
| Streaks and streak freezes | The number beside a habit is its streak. "1 skip per N streaks" means every N days of streak earns one freeze. When you miss a day, a freeze is used automatically and the streak carries on; the habit turns icy blue that day and shows how many freezes are left. |
| Groups and their types | A group completes when its habits meet its rule. Required: the habits you mark as required are done. Any: any one habit is done. All: every habit is done. Hours: the hours logged across its habits reach the group's target. A habit can be in several groups. |
| Week, Month and Year cadence | These use rolling windows that end today: the last 7 days, the last month's worth of days, or the last year. A Week habit with a target of 3 is complete while it has been done on 3 of the last 7 days. |
| Views, sort and filter | Switch between list view and group view with the icons at the top. The cadence filter shows only Day, Week, Month or Year items. Sort and filter orders by streak, name or most recent, and can show only what is completed. |
| A habit's page | Tap a habit or a group to open its page, with its rating, streaks, completion rate and history. |
| Editing and deleting | Tap ⋮ on a habit or a group to edit or delete it. A habit's type can't be changed. Deleting a habit removes it from its groups; deleting a group keeps its habits. |
| Backup and sign-in | Signing in is optional. Signed in with Google, Vinaya backs up your habits once a week to a hidden folder in your own Google Drive, and you can tap Back up now in Profile at any time. Sign in on a new phone to bring them back. Without signing in, your habits stay only on this phone. |

Any change to how the app works should update the matching topic and card in `howToUse.ts`.

## Empty Habits screen

With no habits and no groups stored (after loading), the list shows one centred grey line (16/24, 48 from the top): "No habits yet. Tap + to create your first one."

## Why

Five short cards cover the essentials without blocking the app for long, and every card can be skipped. The help page keeps the full detail one tap away, collapsed so the topic list fits on one screen.
