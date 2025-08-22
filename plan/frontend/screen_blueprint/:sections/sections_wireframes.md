# /sections Wireframes

## Desktop
┌────────────────────────────────────────────────────────────────────────────┐
│ LeftNav │             MAIN ( /sections )                 │  RightPanel   │
│         │-------------------------------------------------│───────────────│
│         │ SectionsHeader: All Sections (Math / Fractions)│      [TopBar] │
│         │ FilterBar: [🔍] [Status: All▼] [Sort: Reco▼]    │      [Promo]  │
│         │                                                 │   [Leaders]   │
│         │ SectionGrid:                                    │   [Quests]    │
│         │  ┌───────────┐ ┌───────────┐ ┌───────────┐     │    [Ad?]     │
│         │  | Illus.    | | Illus.    | | Illus.    |     │              │
│         │  | Title     | | Title     | | Title     |     │              │
│         │  | ▓▓▓░ 40%  | | 🔒 Locked | | ✓ Complete|     │              │
│         │  | [Start]   | | [Why?]    | | [Review]  |     │              │
│         │  └───────────┘ └───────────┘ └───────────┘     │              │
│         │ FooterNote?                                     │              │
└─────────┴─────────────────────────────────────────────────────────────────┘


## Mobile
[Header (TopBar merged): logo • counters • hamburger]

SectionsHeader
FilterBar

SectionGrid (single column):
 [Illus.]
 Title
 ▓▓░ 40%
 [Start] / [Review]   (Locked → [Why locked?] tooltip)

RightPanel cards fold inline below the grid (Promo, Quests…)