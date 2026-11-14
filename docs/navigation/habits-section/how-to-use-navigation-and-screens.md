# How to Use the Navigation and Screen Docs

Scope: the Habits section only. Journal, Level-Up and Profile appear in the bottom nav on every screen, but they have no designs and are out of scope for now.

---

## 1. What exists and what each is the source of truth for

| Artifact | Location | Source of truth for |
|---|---|---|
| Screen images | `../../screens/habits-section/` (PNG exports of the Penpot boards, filenames prefixed with the screen number) | Layout, components, copy, visual styling of each screen |
| Navigation files | `01-main-views.md`, `02-habit-creation.md`, `03-group-creation.md` (in this folder) | Which screen leads to which, and what triggers it |
| Gaps and additional info | `../../screens/habits-section/habits-gaps-and-additional-info.md` | Changes decided after the screens and flows were produced, plus known gaps |
| CLAUDE.md | repo root | Project conventions and architecture |

**Precedence:** the gaps document overrides the screen PNGs and the Mermaid files wherever they conflict.

---

## 2. Screen index

The number prefix is the same everywhere: the Penpot board name, the PNG filename, and the node label in the Mermaid files.

| # | Screen | Navigation file |
|---|---|---|
| 01 | Habits - Group view | 01-main-views |
| 02 | Hours Entry Modal | 01-main-views |
| 03 | Sort & Filter Sheet | 01-main-views |
| 04 | Habits - List View | 01-main-views |
| 05 | Create: Choice Sheet | 01-main-views, 02-habit-creation, 03-group-creation |
| 06 | Create: New Habit - Day | 02-habit-creation |
| 07 | Create: New Habit - Week | 02-habit-creation |
| 08 | Create: New Habit - Month | 02-habit-creation |
| 09 | Create: New Habit - Year | 02-habit-creation |
| 10 | Create: New Habit - Day - Hours | 02-habit-creation |
| 11 | Create: New Habit Group | 03-group-creation |
| 12 | Create: New Habit Group - Assign Sheet | 03-group-creation |
| 13 | Create: New Habit Group - Required | 03-group-creation |
| 14 | Create: New Habit Group - Required Sheet | 03-group-creation |
| 15 | Create: New Habit Group - Hours | 03-group-creation |

---

## 3. How to read the Mermaid files

- Boxes are screens, sheets or modals. Arrows are transitions. The label on an arrow is the UI element that triggers it.
- A solid arrow goes forward. A "back" or "Done" arrow returns to a previous screen.
- Notation: `A & B & C -->|"label"| D` means each of A, B and C has that transition to D.

**Screens that are states of one form.** Several screens in the files are the same form in different states, not separate routes.

- **06, 07, 08, 09, 10** are one "New Habit" screen. The cadence pill (Day, Week, Month, Year) and the type pill (Checkmark, Hours) change which fields are shown. The arrows between them in `02-habit-creation.md` are in-screen state changes.
- **11, 13, 15** are one "New Habit Group" screen. The group type pill (Required, Any, All, Hours) changes which fields are shown. The arrows between them in `03-group-creation.md` are in-screen state changes.
- **01 and 04** are two presentations of the same habits list, switched by the grid/list toggle.
- **02, 03, 05, 12 and 14** are sheets or modals opened over a screen. They return to the screen that opened them.

---

## 4. Implementing a screen

For any screen or flow, read in this order:

1. The relevant navigation file (section 2 table shows which).
2. The PNG for each screen involved.
3. `../../screens/habits-section/habits-gaps-and-additional-info.md`. Check sections 1 and 2 for anything that changes or extends the screen.
4. CLAUDE.md for conventions.

Where something is listed as a gap, it has no design yet. Do not invent one; ask.

---

## 5. Example prompt

> Implement the New Habit screen. Read `02-habit-creation.md`, the PNGs for screens 06-10, and `../../screens/habits-section/habits-gaps-and-additional-info.md`.

> Implement the group creation flow. Read `03-group-creation.md`, the PNGs for screens 11-15, and `../../screens/habits-section/habits-gaps-and-additional-info.md`.

---

## 6. Keeping the docs current

- When a screen changes in Penpot, re-export its PNG over the old one, keeping the same filename.
- When a transition changes, edit the single affected line in the Mermaid file.
- When a design decision is made but not yet drawn, add it to section 1 of the gaps document. When it is drawn and exported, remove it from the gaps document.