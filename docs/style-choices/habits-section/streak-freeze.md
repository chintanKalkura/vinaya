# Streak Freeze

Scope: how a habit or group looks on the day a streak freeze is used, in the Habits section (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

The colors are implemented in `../../../src/screens/habits/colorRules.ts` (see `coloring-rules.md`). The banner text is `src/screens/habits/FreezeLabel.tsx`. The freeze rules themselves are in `../../feature-development/habits-section/streak-freeze.md`.

## When it shows

The frozen look shows only on the day a freeze is used, and only while the element is not complete:

1. **Complete:** orange (`coloring-rules.md`).
2. **Frozen today:** icy blue (this document).
3. **Otherwise:** grey.

When a frozen habit is marked later that day, it turns orange. The next day it follows the normal rules again.

## Design

| Token | Value | Use |
|---|---|---|
| `colors.v2Ice` | `#5ec8e5` (Glacier) | number, icon, border, bar fill, pill title, freeze text |
| `colors.v2IceCardBackground` | `#1f2c43` | banner background (Glacier mixed into the app background) |

| Part | Pill | Banner |
|---|---|---|
| Border and background | unchanged | icy 2px border, icy card background |
| Title | icy | white (as always) |
| Streak number | icy | icy |
| Icon | lucide `Snowflake` replaces the check | `Snowflake` replaces the list-row check, the group selector and the Hours chart icon |
| Hours progress bar | solid icy fill | solid icy fill |
| "n freezes left" | never | bottom centre |

```
┌───────────────────────────────┐
│ ❄ Meditate                  9 │
│                               │
│       0 freezes left  ⟳ Daily │
└───────────────────────────────┘
```

**Freeze text.** It reads "n freezes left", or "1 freeze left". It is 11px semi-bold icy blue, centred, 7px from the bottom. It sits in the same reserved bottom space as the cadence label (`cadence-label.md`), which stays in the bottom-right corner.

Unchanged: the group name under a list row, the `{hours}/{target}h` label, the track of the bar, and the cadence label.

## Why

These were chosen from a comparison of four icy shades (Sky, Pale cyan, Glacier, Periwinkle frost), four lucide ice icons (Snowflake, CloudSnow, ThermometerSnowflake, MountainSnow) and four bar styles:
- solid ice fill
- frosted stripes
- ice fill with a snowflake label
- an iced track around an orange fill

Glacier is deep enough to read clearly on the dark background without competing with orange. Snowflake is the plainest sign of "frozen". The solid fill matches how the orange bar works.
