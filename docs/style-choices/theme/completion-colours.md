# Completion Colours

Scope: the colour a habit or group shows when it is complete, and the picker that sets it. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in:
- `../../../src/theme.ts`: `completion` in each palette, and `completionColour()`
- `../../../src/screens/habits/colorRules.ts`: where the colour is applied
- `../../../src/screens/habits/CompletionColourField.tsx`: the picker

Spec: `../../feature-development/release-1-readiness/banner-colours.md`. Chosen by the owner on 26 Nov 2026 from a review page with three shades per colour (blue A, red C, yellow A, green B, purple B).

## The colour means "complete"

The colour is not the habit's theme. It only shows when the habit or group is complete. It replaces orange everywhere `coloring-rules.md` uses orange for complete:
- the banner border and its tint
- the streak number
- the filled check, the group status shape and the Hours chart icon
- the progress bar

Not complete stays grey, and frozen stays icy blue. Everything else that is orange (FAB, selected tab, buttons, form highlights) stays the app's orange.

## Values

Each colour is a pair: one shade per theme. A single hex can't reach 4.5:1 as text on both the dark card (#23233f) and the light card (#f8f7fc).

| Colour | Dark | Dark tint | Light | Light tint |
|---|---|---|---|---|
| Orange (default) | #f5821f | #3a2a12 | #a44a00 | #f5e2d1 |
| Blue | #7d8cec | #19204d | #223bdf | #c8cdf2 |
| Red | #ef6c7e | #4d1920 | #a81327 | #f1c5cb |
| Yellow | #f5c73d | #352c12 | #795c06 | #f1e6c5 |
| Green | #61d1a2 | #113224 | #206d4d | #c5f1df |
| Purple | #bc7ade | #3c194d | #7f2aaa | #e3c5f1 |

Every colour passes 4.5:1 in both themes:
- as text on its tint
- as text on the plain card
- under the check on its fill (`v2Background` on the colour)
- for white and grey text on its tint

`theme.contrast.test.ts` checks these.

Why these hues:
- **Blue** leans indigo, so it stays apart from the required border's blue and from icy blue.
- **Red** is closer to rose than the delete red.
- **Yellow** in the light theme has to be a deep gold to pass.
- **Purple** replaces white: white can't show on the light card.

## Storage

- `colour?: CompletionColourId` on `Habit` and `HabitGroup`, stored only when not orange.
- A missing or unknown colour reads as orange, so older data needs no migration.
- The colour is part of the item, so it's backed up with it.

## Group cards

A group card's pills and Hours cells take the **group's** colour, not each habit's own. A habit's own colour shows on its banner in list view.

## Picker

- **Label and placement:** "COMPLETION COLOUR", right after Name on New/Edit Habit and New/Edit Habit Group.
- **Swatches:**
  - one 32dp filled circle per colour, each with the same white check a completed habit shows
  - each inside a 48dp tap target
  - the selected one has a 2dp ring in the text colour
  - TalkBack reads "<Colour> when complete" and the selected state
- **Preview:** below the swatches, two small banners, "Not done" (grey) and "Done" (the chosen colour with its tint and filled check). They use the draft's name, or "Your habit" / "Your group" while it has none. The preview is hidden from TalkBack.
- **Defaults:** Orange is selected on a new item. Changing the colour enables Save on the edit forms.
