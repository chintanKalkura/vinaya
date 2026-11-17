# Feature: Accessibility fixes for the Habits screen.

Status: ready for planning.

## Goal
The Habits screen meets WCAG 2.2 AA contrast and Android touch-target guidance, reads correctly in TalkBack, and stays usable at the largest system font size.

## Findings (v2 review, 16 Nov 2026)
- Unchecked circle `v2GreyOutline` `#4a4a6a` on `v2CardBackground` `#23233f`: **1.79:1**. Non-text UI needs 3:1.
- `v2GreyText` `#8a8aa3` on `#23233f`: 4.51:1, passes AA by 0.01.
- Banner ⋮: 18px icon + `hitSlop` 10 ≈ 38dp. Android recommends 48dp.
- Streak number is read as a bare number ("12").
- Hours rows use role `button` with a `checked` state.
- Fixed font sizes (11–32) and a fixed 60px bottom menu; no handling for large system fonts.

## Decisions
1. **Contrast.** Raise `v2GreyOutline` (used for the unchecked circle and not-complete icons) to at least 3:1 on `v2CardBackground`, and `v2GreyText` to at least 4.6:1 for margin. New values: design decision required (keep the current look as close as possible).
2. **Touch targets.** Every tappable element is at least 48×48dp, through size or `hitSlop`: the ⋮, the checkmark area (see `usability-fixes.md`), cadence filter, view toggle, sort button, steppers, sheet chips.
3. **Labels.**
   - Checkmark habit: role `checkbox`, label "<name>, <n> day streak", checked state.
   - Hours habit: role `button`, label "<name>, <hours> of <target> hours today, <n> day streak", no checked state.
   - Group card: label "<group name>, <type> group, complete/not complete, <n> day streak".
   - Frozen state adds ", streak freeze used today, <n> freezes left".
   - Decorative icons are hidden from TalkBack.
4. **Font scaling.** Layouts grow with text: no fixed heights on rows, menu or buttons; the bottom menu height is measured, not a constant. `maxFontSizeMultiplier` capped at 2 on dense labels (cadence label, streak, chips) only if needed after testing.

## Out of scope
- Light theme contrast (handled with `display-settings.md`)

## Tests
- A contrast test over the theme pairs used for text and icons asserts the minimum ratios.
- Labels and roles on list rows, Hours rows, pills and group cards in each state.
- ⋮ and checkmark targets have a 48dp effective size.

## Acceptance criteria
- [ ] Every text and icon colour pair on the Habits screen passes AA (4.5:1 text, 3:1 icons)
- [ ] All tappable elements are at least 48dp
- [ ] TalkBack reads each habit and group with name, state and streak
- [ ] At the largest system font size nothing is clipped or overlapping
