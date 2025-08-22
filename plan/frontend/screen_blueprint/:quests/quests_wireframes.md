# /quests Wireframes (Revised)

## Desktop (3‑column shell; RightPanel visible, TopBar docked at top)
+----------------------------------------------------------------------------------+
| LEFT NAV (80px) |                     MAIN: /quests              | RIGHT PANEL  |
|                 |------------------------------------------------|--------------|
|                 |  QuestBanner (purple hero)                     |  TopBarDock  |
|                 |                                                |--------------|
|                 |  Daily Quests                    [⏱ 7 HOURS]  |  PromoCard?  |
|                 |  ┌───────────────────────────────────────────┐ |--------------|
|                 |  | ⚡ Earn 30 XP     ▓▓▓▓▓▓▓▓ 30/30   [CLAIM] | |  QuestsTip? |
|                 |  └───────────────────────────────────────────┘ |--------------|
|                 |  ┌───────────────────────────────────────────┐ |  AdSlot?     |
|                 |  | 🔒 More quests unlock soon (locked)       | |              |
|                 |  └───────────────────────────────────────────┘ |              |
|                 |                                                |              |
|                 |  Weekly Quests                  [⏱ 3 DAYS]    |              |
|                 |  ┌───────────────────────────────────────────┐ |              |
|                 |  | ⭐ Earn 150 XP     ▓▓░ 80/150              | |              |
|                 |  └───────────────────────────────────────────┘ |              |
+-----------------+------------------------------------------------+--------------+

Notes:
- RightPanel is always visible on ≥md breakpoints.
- TopBarDock sits at the top of RightPanel (streak/gems/avatar).

## Mobile (collapsed shell; RightPanel cards fold inline below MAIN)
[Header (TopBar merged)]
[QuestBanner]

Daily Quests   [⏱ 7 HOURS]
 ┌ Card: Earn 30 XP — progress bar — [CLAIM]
 └ Card: Locked placeholder

Weekly Quests  [⏱ 3 DAYS]
 └ Card: Earn 150 XP — progress bar

-- Below the lists, RightPanel cards appear inline --
[PromoCard?]
[QuestsTip?]
[AdSlot?]
