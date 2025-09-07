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

## ADR-004: Client-Side Progress Tracking with localStorage

**Date:** 2025-08-26  
**Status:** Decided  
**Context:** Need user progress persistence for lesson unlocking and completion tracking. Options include server-side database, client-side localStorage, or hybrid approach.

**Decision:** Implement progress tracking using browser localStorage with structured data format.

**Rationale:**
- Immediate persistence without backend complexity or user authentication requirements
- Enables offline functionality and instant state updates
- Perfect for MVP and learning-focused development phase
- Data structure designed to be easily migrated to server-side storage later
- Supports guest users without friction

**Alternatives Considered:**
1. **Server-side only**: Requires authentication, database, API endpoints - too complex for MVP
2. **Session storage**: Lost on browser close, poor user experience
3. **Hybrid (localStorage + server sync)**: Over-engineered for current needs

**Implementation:**
```typescript
interface UserProgress {
  completedLessons: Set<string>;
  completedNodes: Set<string>;
}
```

**Consequences:**
- Users can access their progress across sessions on the same device
- Progress is device-specific (acceptable for MVP)
- Data loss if user clears browser data (documented limitation)
- Clear migration path to server-side persistence when authentication is added
- Enables rapid iteration on progress-dependent features

## ADR-005: Full-Stack Migration with Supabase

**Date:** 2025-08-28  
**Status:** Decided  
**Context:** Ready to migrate from localStorage to proper database with multi-user support. Need to choose database, authentication, and deployment strategy for production-ready full-stack architecture.

**Decision:** Migrate to Supabase (PostgreSQL) with Row Level Security, maintaining exact localStorage data structure in database schema.

**Rationale:**
- Supabase provides PostgreSQL + Auth + Real-time in single platform, reducing vendor sprawl
- RLS enforces multi-tenant security at database level, not just application code
- Direct mapping from localStorage structure minimizes migration complexity
- Strong TypeScript integration and Next.js SSR support
- Immutable completion tracking matches business logic (no lesson failure states)

**Database Schema:**
```sql
-- Direct localStorage equivalent
lesson_completions(user_id, lesson_id, completed_at)
node_completions(user_id, node_id, completed_at)
user_progress view (computed: completed_lessons[], completed_nodes[])
```

**Security Design:**
- Minimal RLS policies: SELECT/INSERT only (no UPDATE/DELETE)
- Immutable completions prevent data tampering
- Each user isolated by RLS policies using auth.uid()

**Alternatives Considered:**
1. **Firebase**: Good real-time, poor relational queries for progress calculations
2. **PlanetScale + NextAuth**: More vendor coordination, no built-in RLS
3. **Complex event sourcing**: Over-engineered for completion-only tracking

**Consequences:**
- Multi-user support with secure data isolation
- Clear migration path from current localStorage implementation  
- Production-ready authentication and database persistence
- Maintained system simplicity while adding enterprise security features
- Foundation for future real-time features (leaderboards, collaborative learning)