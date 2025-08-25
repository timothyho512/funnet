# Architecture Decisions Log

This log tracks important architectural and strategic decisions made during the FunNet project development.

## ADR-001: Learning Strategy - Frontend-First Dynamic Routing

**Date:** 2025-08-22  
**Status:** Decided  
**Context:** Need to balance rapid progress with maximum learning for developer with some app building experience. Project has strong planning foundation (specs, tech stack, question content) but needs to start implementation strategically.

**Decision:** Build `/lesson/[id]` dynamic routing pages directly instead of starting with single component on home page or full backend-first approach.

**Rationale:** 
- Teaches multiple React/Next.js concepts simultaneously (dynamic routing, data fetching, state management, component design)
- Uses existing JSON question content to avoid time spent on mock data
- Builds real scalable architecture from day 1 rather than throwaway demo code
- Matches developer's experience level and desire for fast progress with deep learning

**Alternatives Considered:**
1. **Single component on home page**: Too simple, doesn't teach routing or real architecture patterns
2. **Backend + database first**: Too complex setup overhead, delays visible progress and learning feedback
3. **Landing page first**: Beautiful but hollow without core functionality behind it

**Consequences:**
- Week 1 focus: JSON data structure analysis � dynamic lesson routing � interactive question components
- Steeper initial learning curve but higher learning density
- Clear path to add database layer later without architectural changes

## ADR-002: JSON Data Structure Priority

**Date:** 2025-08-22  
**Status:** Decided  
**Context:** Existing question content exists in various JSON formats across different topics (Fractions, Percentages, Basic Algebra). Need standardized structure before building components.

**Decision:** Analyze and standardize JSON data structure as the critical first implementation step.

**Rationale:** 
- Component design depends entirely on data shape
- Better to standardize once than refactor components multiple times
- Existing content provides real-world constraints rather than idealized schema

**Next Steps:** Examine existing JSON files and create unified TypeScript interfaces

## ADR-003: Simplified Gamification System

**Date:** 2025-08-25  
**Status:** Decided  
**Context:** Original JSON structure included stars system (current/max stars per skill) alongside XP rewards, badges, and 100% completion requirements. Multiple overlapping progress indicators could create user confusion and implementation complexity.

**Decision:** Remove stars system and rely on binary completion (100% to proceed) plus XP/badge rewards for progress tracking.

**Rationale:** 
- 100% completion requirement creates clear, unambiguous progression gates
- XP and badges provide sufficient gamification motivation
- Reduces complexity in UI state management and progress calculations
- Eliminates redundant progress indicators that could confuse users
- Aligns with binary skill mastery model rather than gradual improvement tracking

**Alternatives Considered:**
1. **Keep stars + XP + badges**: More gamification but potentially overwhelming
2. **Stars only**: Missing XP/badge progression rewards
3. **XP progression gates**: Complex threshold calculations instead of simple completion

**Consequences:**
- Cleaner TypeScript interfaces without optional stars properties
- Simpler progress tracking logic (boolean completion + XP totals)
- Clear user expectation: complete lesson perfectly to unlock next content
- Future flexibility to add stars back if user testing shows need