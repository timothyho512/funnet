# /leaderboards Wireframes (Revised)

## Desktop (3‑column shell; RightPanel visible, TopBar docked)
+----------------------------------------------------------------------------------+
| LEFT NAV (80px) |                 MAIN: /leaderboards             | RIGHT PANEL |
|                 |--------------------------------------------------|------------|
|                 |  BoardHeader: Week Aug 18–Aug 24   [Friends|Global?]         |
|                 |                                                  | TopBarDock |
|                 |  LeaderboardTable                                |------------|
|                 |  ┌────┬──────────────────┬──────────┬──────────┐ | PromoCard? |
|                 |  | #  | User             |   XP     | Change   | |------------|
|                 |  |  1 | @alexa           |  1240    |  ▲ +3    | | QuestsCard |
|                 |  |  2 | @you (pinned)    |  1205    |  ▬  0    | |------------|
|                 |  |  3 | @rami            |  1180    |  ▼ -1    | | AdSlot?    |
|                 |  | .. | ...              |   ...    |   ...    | |            |
|                 |  └────┴──────────────────┴──────────┴──────────┘ |            |
|                 |  [ Jump to me ]   [ Prev ] [ Next ]                           |
+-----------------+--------------------------------------------------+------------+

Notes:
- RightPanel is shown on ≥md breakpoints; TopBarDock anchors the counters at the top.
- Table is virtualized; “Jump to me” scrolls to the pinned row.
- Global tab can be flag-gated; Friends tab is default.

## Mobile (collapsed shell; RightPanel cards fold inline)
[Header (TopBar merged): week range]

Tabs: [Friends] [Global?]

[Pinned me strip]  #2  you — 1205 XP

List (virtualized):
 #1  alexa — 1240 XP   ▲ +3
 #2  you   — 1205 XP   ▬  0
 #3  rami  — 1180 XP   ▼ -1
 ...

[Jump to me]

-- Below the list, RightPanel cards appear inline --
[PromoCard?]
[QuestsCard]
[AdSlot?]
