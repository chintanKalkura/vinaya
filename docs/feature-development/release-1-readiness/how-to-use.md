# Feature: How to use — first-launch walkthrough and help page.

Status: needs design (screens and wording), then ready for planning.

## Goal
New users understand how Vinaya works before they see an empty list, and anyone can look it up again later.

## Scope (owner's answer, 16 Nov 2026)
- A walkthrough on first launch.
- A help page in Profile.

## Decisions
1. **First launch.** Shown once, before the empty Habits screen. Skippable on every step. A flag `onboarding_seen_v1` is saved when it's finished or skipped. Restoring a backup doesn't show it again on that phone if already seen.
2. **Topics to cover** (both walkthrough and help page; the walkthrough can be the short version):
   - Creating a habit: cadence, target, type (Checkmark or Hours).
   - Marking a habit done and logging hours.
   - Streaks and streak freezes ("1 skip per N streaks").
   - Groups and their types (Required, Any, All, Hours).
   - Week, Month and Year cadence with rolling windows.
   - Sort, filter, list and group views.
   - Editing and deleting.
   - Signing in for backup, and what happens without it.
3. **Help page.** In Profile, the full version of the same topics, plus "Show the walkthrough again".
4. **Empty Habits screen.** After the walkthrough, an empty Habits screen shows a short line pointing to the ＋ button. Wording: with the rest of the copy.
5. **Screens, number of walkthrough steps, illustrations and wording:** to be designed with Claude Code.

## Out of scope
- Tooltips on individual controls

## Tests
- Walkthrough shows on first launch only; Skip and Finish both set the flag; it doesn't show after a restart.
- "Show the walkthrough again" opens it from Profile.
- Empty state shows when there are no habits and no groups.

## Acceptance criteria
- [ ] A fresh install shows the walkthrough once, and it can be skipped
- [ ] The help page in Profile covers every topic in decision 2
- [ ] An empty Habits screen tells the user how to start
