# Light Palette ("Lavender")

Scope: the light theme's colours and how components pick them. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/theme.ts` (`darkColors`, `lightColors`) and `../../../src/theming.tsx`. Chosen by the owner on 25 Nov 2026 from three options (Lavender was option C). Setting: `../profile/display-settings.md`.

## Values

Same keys as the dark palette. `v2White` is the main text colour in both themes, so it is near-black here.

| Key | Dark | Light | Use |
|---|---|---|---|
| v2Background | #15152b | #ecebf4 | screen |
| v2CardBackground | #23233f | #f8f7fc | cards, sheets |
| v2CardBackgroundInset | #1c1c35 | #e5e3ef | pills, fields |
| v2Border | #3a3a5c | #cfcce2 | outlines, dividers |
| v2Orange / v2BorderActive | #f5821f | #a44a00 | accent, complete |
| v2OrangeCardBackground | #3a2a12 | #f5e2d1 | complete card tint |
| v2Blue | #3d9be9 | #2a57a0 | blue accents |
| v2Ice | #5ec8e5 | #11627b | frozen accent |
| v2IceCardBackground | #1f2c43 | #dbebf1 | frozen card tint |
| v2Red | #ef5b5b | #aa2a2a | errors, Delete |
| v2MenuBackground | #1e1510 | #e4e2ee | tab bar |
| v2MenuBorder | #130d09 | #cbc7de | tab bar top edge |
| v2GreyText | #9393aa | #575474 | secondary text |
| v2GreyOutline | #70709b | #817ea2 | empty checks, icons |
| v2White | #f5f5fa | #1c1a36 | main text |
| v2Scrim | rgba(5,5,12,0.85) | rgba(28,26,54,0.5) | behind sheets and dialogs |
| v2ScrimSoft | rgba(10,10,25,0.7) | rgba(28,26,54,0.4) | behind the Hours modal |

Labels and icons on orange fills (buttons, the selected toggle and segment, the FAB) use `v2Background`, so they are dark on bright orange in dark and pale on deep orange in light.

## Contrast (WCAG AA)

`../../../src/theme.contrast.test.ts` runs the same checks on both palettes. Light values:

| Pair | Ratio |
|---|---|
| main text on card / screen | 15.8 / 14.2 |
| grey text on card, inset, orange tint, icy tint | 6.7, 5.7, 5.7, 5.9 |
| orange on orange tint / card | 4.7 / 5.5 |
| ice on icy tint | 5.6 |
| label on orange fill | 5.0 |
| red on screen | 5.8 |
| grey outline on card / inset (non-text, 3:1) | 3.6 / 3.1 |

## How components use it

- Styles: `const makeStyles = (colors: Palette) => StyleSheet.create({...})`, then `const styles = useThemedStyles(makeStyles)` in the component. Styles are built once per palette.
- Colours in JSX (icon colours): `const colors = usePalette()`.
- `getColorScheme` (`colorRules.ts`) takes the palette as its last argument.
- `colors` exported from `theme.ts` is the dark palette, for tests and code outside components. New components should not import it.
- Status bar icons follow the theme (`StatusBar barStyle`), and the navigation bar icons follow it through the `SystemBars` native method (`../../native-modules.md`). The app draws behind both bars, so their background is the app's own.

## Why

Lavender keeps the dark theme's blue-violet character on a soft lilac-grey rather than a stark white. The orange and ice accents are deepened so they pass AA both as text on the pale cards and as fills under light labels, and the complete and frozen tints stay recognisable from the dark theme.
