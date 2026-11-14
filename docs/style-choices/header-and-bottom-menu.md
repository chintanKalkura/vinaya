# Header and Bottom Menu

Scope: the Habits screen's header row and bottom menu bar (screens 01 and 04). Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `src/screens/habits/HabitsHeader.tsx`, `src/screens/habits/BottomMenu.tsx` and `src/screens/HabitsScreen.tsx`.

## Header

One row, below the status bar (the screen is padded by the top safe-area inset):

```
Vinaya - Habits        [All ⌄] [▦|☰] [⚟]
```

| Part | Style |
|---|---|
| Title | "Vinaya - Habits", the phone's own serif (`fontFamily: 'serif'`, Noto Serif on Android), italic, weight 600, 20dp, white. One line; shrinks to 80% to fit narrow phones |
| Cadence filter | moved right, just left of the group/list toggle (see `cadence-filter.md`) |
| View toggle, sort button | unchanged, at the right end |

## Bottom menu

| Part | Style |
|---|---|
| Position | flush with the screen: full width, touching the bottom edge, no side margins or rounded corners |
| Background | espresso `#1e1510` (`colors.v2MenuBackground`), a warm dark brown that contrasts with the orange and the blue-grey list; it runs down under the gesture or 3-button bar |
| Top edge | 1px bitter coffee `#130d09` line (`colors.v2MenuBorder`) |
| Padding | 10dp at the top; 10dp plus the bottom safe-area inset at the bottom |
| Items | unchanged: Habits, Journal, Level-Up, Profile |

The + button sits 16dp above the menu: its bottom offset is the menu height (60dp) + 16dp + the bottom inset.

## Why

Chosen from a comparison of title fonts (Playfair Display, Lora, Cormorant Garamond, Fraunces and the phone serif), two header layouts (title on its own line, or one line) and three flush menus (card colour, page colour, rounded top). The phone serif needs no font file. One line keeps the list starting high. The flush bar was first drawn in the card colour, then changed to espresso so it contrasts with both the orange and the blue-grey list instead of blending into them; it was picked over deep teal, aubergine, forest, burgundy and midnight violet, and lighter or darker browns.
