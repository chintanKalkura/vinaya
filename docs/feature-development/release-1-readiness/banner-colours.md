# Feature: Choose a colour for habits and groups.

Status: needs design (colour set and picker), then ready for planning.

## Goal
Users can give each habit and group its own colour from a small fixed set, and that colour is used wherever orange marks "complete".

## Scope (owner's answers, 16 Nov 2026)
- A fixed set of colours, very few choices.
- Grey and the freeze (icy blue) colour are excluded, so complete never looks like not complete or frozen.
- The chosen colour replaces orange as the complete colour.

## Decisions
1. **Field.** `colour?: BannerColourId` on `Habit` and `HabitGroup`. Missing means the default, orange, so existing data needs no migration.
2. **Set.** Orange (default) plus a few more. Exact count, hues and their card-background tints: **to be designed with Claude Code**. Each colour must pass 3:1 against the card background and 4.5:1 where it colours text (streak number), in every theme (`display-settings.md`).
3. **Where it applies.** Every place `colorRules.ts` uses orange for complete: banner border, complete card background (as a tint of the colour), streak number, check icon fill, group selector and Hours chart icons, and the progress bar fill. Frozen and not complete looks are unchanged.
4. **Pills inside a group card.** Whether a pill uses its own habit's colour or the group's colour: design decision required.
5. **Picker.** A row of swatches on New/Edit Habit and New/Edit Habit Group forms. Placement in the field order: to be designed with Claude Code.
6. **Backup.** The colour is part of the habit/group and is included in backups.
7. **Other uses of orange** (FAB, selected tab, filter highlights, buttons) stay the app's orange.

## Out of scope
- Free colour picker or custom hex values

## Tests
- `getColorScheme` uses the item's colour for every complete element and orange when none is set; frozen and not complete unchanged.
- Contrast test over every colour in the set, in every theme.
- Forms: swatch selection saves; Edit loads and changes it; Save enables on change.

## Acceptance criteria
- [ ] Each habit and group can be given a colour from the set when creating or editing
- [ ] A completed item shows its chosen colour wherever orange was used
- [ ] No colour in the set is grey or the freeze colour, and all pass contrast
