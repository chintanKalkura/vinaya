# Refactor: Clean up before release.

Status: done.

## Goal
Remove dead v1 code, stop flaky tests, and make the docs Claude Code reads first match the code.

## Scope
- Flaky screen tests.
- Dead and stub code.
- Stale docs.
- Split `HabitsScreen.tsx` before navigation and new tabs are added.

## Decisions
1. **Flaky tests.** `src/screens/HabitsScreen.test.tsx` fails 1–2 tests per run, different ones each time ("returns from Create Habit with the new habit assigned", "deletes a group from group view and keeps its habits"). Find the cause (likely `waitFor` racing several sequential async storage calls) and fix it in the test setup or by awaiting the operation, not by raising timeouts alone. Done when 20 consecutive runs pass. Outcome (22 Nov 2026): no flake reproduced in 60 runs: the Habits screen file alone 20 times, the full suite 10 times, two full suites at once 10 times, and the full suite 20 consecutive times after this cleanup. The storage write queue (`storage-write-safety.md`) and the test fixes since appear to have removed the race; no test was changed for it.
2. **Stub functions.** Remove `assignHabitToGroup`, `removeHabitFromGroup` and `setRequiredHabits` from `habitService.ts`; they throw "not implemented" and nothing calls them.
3. **v1 leftovers in `src/`.** Remove `src/storage/storage.ts` (`DayLog` logs) and v1-only types and theme colours that nothing in v2 imports. Notifications are removed with `release-build-config.md` (owner's decision) and can be restored from `v1-reference`.
4. **`src_v1_backup/`.** It isn't built, tested or linted, so it doesn't affect the release. Decided: deleted, and the last commit that has it is tagged `v1-reference` (it also has the v1 notifications and Kotlin bell and widget).
5. **ESLint.** Add `coverage/` to `.eslintignore`.
6. **Docs.** Update `docs/architecture.md` and `docs/app-context.md`: `App.tsx` renders `HabitsScreen`, the `src/` layout (`services/`, `screens/habits/`, `storage/habitStorage.ts`, `types/habit*.ts`), and the v2 palette in `theme.ts`.
7. **Split `HabitsScreen.tsx`.** Move the create/edit flow state (13 `useState` flags, seven mounted forms) into a reducer with explicit steps, and mount only the active form. No behaviour change; existing screen tests must pass unchanged.

## Out of scope
- Navigation library and new tabs

## Tests
- Full suite passes 20 times in a row.
- Coverage stays at or above 80% on business logic after removals.

## Acceptance criteria
- [x] No flaky test in 20 consecutive runs *(the owner ran the suite repeatedly hunting for flakiness and found none, 27 Nov 2026)*
- [x] No exported function throws "not implemented"
- [x] `architecture.md` and `app-context.md` describe the current code
- [x] `HabitsScreen.tsx` mounts only the form that is open *(the forms now live in `src/screens/habits/HabitsData.tsx`, same rule)*
