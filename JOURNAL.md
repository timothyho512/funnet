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
