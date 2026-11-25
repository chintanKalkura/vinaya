// Two palettes with the same keys; components read the active one through
// usePalette() / useThemedStyles() (src/theming.tsx). `v2White` is the main text
// colour in both (white in dark, near-black in light).
// docs/style-choices/theme/light-palette.md

export const darkColors = {
  v2Background: '#15152b',
  v2CardBackground: '#23233f',
  v2CardBackgroundInset: '#1c1c35',
  v2Border: '#3a3a5c',
  v2BorderActive: '#f5821f',
  v2Orange: '#f5821f',
  v2OrangeCardBackground: '#3a2a12',
  v2Blue: '#3d9be9',
  v2Ice: '#5ec8e5',
  v2Red: '#ef5b5b',
  v2MenuBackground: '#1e1510', // espresso: bottom menu bar
  v2MenuBorder: '#130d09', // bitter coffee: bottom menu top edge
  v2IceCardBackground: '#1f2c43',
  v2GreyText: '#9393aa', // 4.6:1 or more on every card: accessibility-fixes.md
  v2GreyOutline: '#70709b', // 3:1 or more on the card, for icons
  v2White: '#f5f5fa',
  v2Scrim: 'rgba(5, 5, 12, 0.85)', // behind sheets and dialogs
  v2ScrimSoft: 'rgba(10, 10, 25, 0.7)', // behind the Hours modal
};

export type Palette = typeof darkColors;

// "Lavender": a soft lilac-grey that keeps the dark theme's blue-violet feel.
// Orange and ice are deeper so they pass AA as text on pale cards and as fills
// under light labels.
export const lightColors: Palette = {
  v2Background: '#ecebf4',
  v2CardBackground: '#f8f7fc',
  v2CardBackgroundInset: '#e5e3ef',
  v2Border: '#cfcce2',
  v2BorderActive: '#a44a00',
  v2Orange: '#a44a00',
  v2OrangeCardBackground: '#f5e2d1',
  v2Blue: '#2a57a0',
  v2Ice: '#11627b',
  v2Red: '#aa2a2a',
  v2MenuBackground: '#e4e2ee',
  v2MenuBorder: '#cbc7de',
  v2IceCardBackground: '#dbebf1',
  v2GreyText: '#575474',
  v2GreyOutline: '#817ea2',
  v2White: '#1c1a36',
  v2Scrim: 'rgba(28, 26, 54, 0.5)',
  v2ScrimSoft: 'rgba(28, 26, 54, 0.4)',
};

// The dark palette, for code outside components and for tests
export const colors = darkColors;
