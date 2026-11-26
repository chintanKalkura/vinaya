# Coming Soon

Scope: the Journal and Level-Up tabs until those sections are built. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/ComingSoonScreen.tsx`. Behaviour: `../../feature-development/release-1-readiness/bottom-tab-navigation.md`.

## Design

The Habits background, the title in the Habits title style (phone serif, italic, white, 20dp) and one paragraph in grey (`v2GreyText`, 16dp, 24dp line height), 16dp from the sides. No illustration, no buttons. The tab is orange in the bottom menu.

```
┌─────────────────────────────────┐
│ Vinaya - Journal                │
│                                 │
│ Journal is coming soon. It will │
│ be a private place to write ... │
│                                 │
├─────────────────────────────────┤
│ Habits  Journal  Level-Up  Prof │
└─────────────────────────────────┘
```

## Wording (owner-approved, 25 Nov 2026)

| Tab | Title | Text |
|---|---|---|
| Journal | Vinaya - Journal | Journal is coming soon. It will be a private place to write down your thoughts each day or whenever you need, with topics for each entry and short guides on why journaling helps and what to write. |
| Level-Up | Vinaya - Level-Up | Level-Up is coming soon. It will help you build discipline step by step: choose a habit and a goal, like running 5 km, and follow a plan that raises it a little each week until you get there, with suggested plans to help you start. |

## Why

One line saying what each section will be sets expectations without promising dates. Journal is separate from habits; Level-Up builds on them, so its example uses a habit with a goal. The AI assistant planned for Level-Up isn't mentioned until it's built.
