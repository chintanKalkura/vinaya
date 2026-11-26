# Feature: Choose a colour for habits and groups.

Status: done (26 Nov 2026). Look and values: `../../style-choices/theme/completion-colours.md`.

## Goal
Users can give each habit and group its own colour from a small fixed set, and that colour is used wherever orange marks "complete".

## Scope (owner's answers, 16 Nov 2026)
- A fixed set of colours, very few choices.
- Grey and the freeze (icy blue) colour are excluded, so complete never looks like not complete or frozen.
- The chosen colour replaces orange as the complete colour.

## Decisions
1. **Field.** `colour?: CompletionColourId` on `Habit` and `HabitGroup`. Missing means the default, orange, so existing data needs no migration.
2. **Set.** Orange (default) plus a few more. Six colours: orange (default), blue, red, yellow, green and purple (purple replaces white, which can't show on the light theme). Each is a pair, one shade per theme, because no single hex passes 4.5:1 as text on both cards. Each passes 4.5:1 as text on its tint and on the card, in every theme. Values: `../../style-choices/theme/completion-colours.md`.
3. **Where it applies.** Every place `colorRules.ts` uses orange for complete: banner border, complete card background (as a tint of the colour), streak number, check icon fill, group selector and Hours chart icons, and the progress bar fill. Frozen and not complete looks are unchanged.
4. **Pills inside a group card.** Pills and Hours cells use the group's colour (owner's choice, 26 Nov 2026).
5. **Picker.** "COMPLETION COLOUR", right after Name on New/Edit Habit and New/Edit Habit Group. The swatches are filled check circles in one row, with a Preview button at the end that opens a "Not done" / "Done" row under them, showing that the colour only appears when complete. The preview row can be closed.
6. **Backup.** The colour is part of the habit/group and is included in backups.
7. **Other uses of orange** (FAB, selected tab, filter highlights, buttons) stay the app's orange.

## Out of scope
- Free colour picker or custom hex values

## Tests
- `getColorScheme` uses the item's colour for every complete element and orange when none is set; frozen and not complete unchanged.
- Contrast test over every colour in the set, in every theme.
- Forms: swatch selection saves; Edit loads and changes it; Save enables on change.

## Acceptance criteria
- [x] Each habit and group can be given a colour from the set when creating or editing
- [x] A completed item shows its chosen colour wherever orange was used
- [x] No colour in the set is grey or the freeze colour, and all pass contrast
