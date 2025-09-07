# Engineering Journal

This log tracks design choices, experiments, and learning outputs for the FunNet project.

## 2025-08-22 - Project Planning & Strategy Session (Claude)

**Files analyzed:** CLAUDE.md, project structure, maths_duolingo_plan.json, duolingo_style_full_stack.json, existing Next.js app

**Summary of changes:** 
- Created DECISIONS.md with initial architecture decision records
- Conducted comprehensive project assessment and learning strategy definition
- Established development approach prioritizing JSON data structure analysis

**Why this approach:** 
- Chose fast-track `/lesson/[id]` dynamic routing approach to maximize learning density while building real architecture from day 1
- Frontend-first approach allows immediate visual feedback and builds confidence
- Leverages existing question content to avoid mock data delays
- Matches developer's experience level and goals for rapid progress with deep learning

**What was learned:** 
- Project has excellent planning foundation (comprehensive specs, tech stack definitions, question content) but was missing required DECISIONS.md file
- Current state is initialized Next.js app with default template - no functionality implemented yet
- JSON question content exists across 3 topics (Fractions, Percentages, Basic Algebra) but needs standardization before component development
- Key insight: Data structure must be analyzed first since component design depends entirely on data shape

**Next step:** Analyze existing JSON question files and create unified TypeScript interfaces, then implement `/lesson/[id]` dynamic routing

## 2025-08-25 - TypeScript Interface Architecture Session (Claude + Human)

**Files created/modified:** src/types/lesson.ts (new), fractions_path.json (simplified)

**Summary of changes:** 
- Built complete TypeScript interface system for skill-based lesson architecture
- Created 5 question type interfaces (MCQ, TypeIn, TrueFalse, Match, Order) with discriminated union
- Designed hierarchical data structure: Question → LessonContent → LessonRef → LearningNode → Unit → Section → Topic
- Removed stars system in favor of simpler 100% completion + XP/badge progression
- Simplified fractions_path.json by removing version field and focusing on essential structure

**Why this approach:** 
- Bottom-up design ensured complex question types (most variety) were solved first as foundation
- Discriminated unions provide type safety while handling multiple question formats
- Hierarchical interfaces match JSON structure exactly, avoiding transformation complexity
- Learning by doing approach built understanding through hands-on decision making rather than passive code generation

**What was learned:** 
- TypeScript discriminated unions automatically narrow types based on literal type fields (e.g., question.type === "MCQ")
- Bottom-up architecture prevents refactoring by solving complexity at foundation level first  
- Interface naming and structure decisions have long-term impact on developer experience
- Data-first development prevents component design mistakes by understanding constraints upfront
- Trade-offs between matching JSON exactly vs clean internal types require deliberate choice

**Next step:** Implement `/lesson/[id]` dynamic route with data loading utilities to load and transform JSON into our type-safe interfaces

## 2025-08-26 - Complete Duolingo-Style Lesson Player Implementation (Claude + Human)

**Files created/modified:** 
- src/app/lesson/[id]/page.tsx (restructured for single-question flow)
- src/lib/lesson-loader.ts (enhanced with topic/section mapping)  
- src/components/lesson/LessonPlayer.tsx (new, complete lesson player)

**Summary of changes:**
- Built production-quality Duolingo-style lesson player with single-question focus
- Implemented complete state machine: answering → incorrect → retry loop → correct → continue
- Added 3 question types: MCQ (multiple choice), TypeIn (text input), TrueFalse (boolean buttons)
- Created scalable lesson data loader supporting multiple topics (Maths, Physics, Chemistry)
- Added full UX polish: progress bar, feedback messages, completion celebration, exit modal

**Why this approach:**
- Learning by doing methodology: human coded all components with step-by-step mentoring
- State machine design ensures users must answer correctly before proceeding (key requirement)
- Component architecture separates business logic (state) from presentation (UI)
- Incremental development: built simple working version first, then added complexity

**What was learned:**
- React state management with useState for complex user flows
- Conditional rendering patterns for different UI states and question types  
- Event handling differences: onClick vs onChange for different input types
- TypeScript discriminated unions enable type-safe question rendering
- Modal patterns and z-index layering for proper UX
- Path resolution challenges in Next.js applications (process.cwd() + relative paths)
- Learning by doing builds deeper understanding than passive code generation

**Next step:** Choose next feature - Order/Match question types, lesson selection screen, or user progress persistence

## 2025-08-26 - Learn Page Foundation & Progress Tracking System (Claude + Human)

**Files created/modified:**
- src/app/learn/page.tsx (new, lesson selection route)
- src/lib/topic-loader.ts (new, loads topic structure)
- src/lib/progress-tracker.ts (new, localStorage-based progress persistence)
- src/lib/unlock-calculator.tsx (new, node unlock logic)
- src/components/learn/SkillNode.tsx (new, individual skill node component)
- src/components/lesson/LessonPlayer.tsx (enhanced with completion tracking)

**Summary of changes:**
- Built foundation for lesson selection screen with topic structure loading
- Implemented complete progress tracking system using localStorage
- Created unlock calculation logic for sequential lesson progression
- Enhanced lesson player to mark lessons completed upon finish
- Designed skill node component with locked/available/completed states
- Established data flow from individual lessons back to learn page progress

**Why this approach:**
- Learning by doing methodology continued with step-by-step component building
- localStorage provides immediate persistence without database complexity
- Sequential unlock pattern matches Duolingo's pedagogical approach
- Separation of concerns: progress tracking, unlock logic, and UI rendering are independent modules
- Foundation architecture supports future features (achievements, streaks, analytics)

**What was learned:**
- Client-side data persistence strategies using localStorage
- Progress state calculation and dependency resolution logic
- Next.js routing patterns and server/client component integration
- Complex state management across multiple components and pages
- Educational app progression systems and unlock gate design
- Data loading patterns for structural metadata vs content data

**Next step:** Complete skill grid rendering and navigation integration to finish learn page MVP

## 2025-08-27 - Complete SkillGrid & Unified System Integration (Claude + Human)

**Files modified:** 
- `src/components/learn/SkillGrid.tsx` - Complete implementation with nested data rendering and smart navigation
- `src/lib/unlock-calculator.tsx` - Updated function signature for cleaner API and node finding logic  
- `src/lib/lesson-loader.ts` - Fixed checkpoint node parsing with standardized naming pattern
- `src/components/lesson/LessonPlayer.tsx` - Added intelligent node completion checking
- `src/types/lesson.ts` - Unified checkpoint and skill node interfaces for consistency
- `plan/question_demo/question_path.json` - Standardized checkpoint data structure
- File system: Renamed FRA-CHECK-1 → FRA-10X-L1, Node Check → Node X folders

**Summary of changes:**
- Completed SkillGrid with authentic Duolingo-style layout (sections → units → nodes hierarchy)
- Implemented smart lesson navigation that automatically resumes at next incomplete lesson
- Fixed lesson loader checkpoint parsing by standardizing file naming to use 'X' pattern
- Created unified completion tracking system for both individual lessons and complete nodes
- Standardized checkpoint and skill node data structures to eliminate special case handling
- Added intelligent node completion detection when all lessons in a node are finished

**Why this approach:**
- Data standardization over code complexity: checkpoint files using X pattern eliminated parsing edge cases
- Unified data structures enable single completion logic for both skills and checkpoints
- Smart navigation enhances UX by resuming learning exactly where users left off
- Nested data iteration with React maps teaches real-world component patterns
- Explicit lesson counts in data (Option C) chosen for performance over dynamic file system scanning

**What was learned:**
- Data-first system design: standardizing data structures simplifies code throughout the system
- React nested rendering patterns: sections.map → units.map → nodes.map for hierarchical data
- Advanced state management: coordinating progress tracking across lesson completion and unlock logic
- API design principles: making calling code clean even if implementation is more complex inside functions
- TypeScript interface evolution: updating interfaces to match evolving data requirements
- User experience patterns: intelligent lesson resumption and progress-aware navigation
- System integration: connecting lesson completion → node completion → unlock calculation → UI updates

**Next step:** Add responsive design, error boundaries, and consider implementing Order/Match question types or advanced gamification features

## 2025-08-27 - Complete Order & Match Question Implementation (Claude + Human)

**Files modified:**
- `src/components/lesson/LessonPlayer.tsx` - Added complete Order and Match question functionality with advanced interaction patterns
- `src/types/lesson.ts` - Confirmed support for Order (items/answer arrays) and Match (pairs object) question types

**Summary of changes:**
- Implemented complete Order question type with up/down button reordering interface
- Built sophisticated Match question system with click-to-connect bidirectional pairing
- Added proper state management for complex question types (arrays, objects, selection tracking)
- Created dynamic answer validation system supporting multiple question type patterns
- Fixed critical bugs: function hoisting issues, duplicate matching prevention, proper state cleanup
- Added comprehensive debugging tools for real-time state inspection during development

**Why this approach:**
- Learning by doing methodology: step-by-step guided implementation with hands-on problem solving
- Progressive complexity: started with simple button interface, upgraded to advanced interaction patterns
- Robust architecture: proper separation of concerns between UI state, business logic, and validation
- User experience focus: bidirectional clicking, visual feedback, proper one-to-one mapping constraints
- Production quality: comprehensive error handling, state cleanup, and edge case management

**What was learned:**
- Advanced React state management: complex nested state objects with type safety
- Interactive UI patterns: click-to-connect interfaces, selection state tracking, dynamic styling
- Algorithm implementation: Fisher-Yates shuffle, array manipulation, object key-value validation
- JavaScript fundamentals: function hoisting, variable scoping, initialization order dependencies
- Problem-solving methodology: systematic debugging, state inspection, logical constraint enforcement
- TypeScript advanced patterns: discriminated unions, optional chaining, complex state type definitions

**Technical achievements:**
- **Order Questions**: Array state management, immutable updates, boundary checking, sequential reordering
- **Match Questions**: Bidirectional interaction, one-to-one mapping enforcement, conflict resolution, proper data normalization
- **System Integration**: Extended hasUserAnswer helper, comprehensive state cleanup, consistent validation patterns
- **Developer Experience**: Real-time debugging panels, comprehensive state inspection, systematic testing approach

**Next step:** Consider implementing drag-and-drop for Order questions, or explore advanced gamification features like streaks and achievements
