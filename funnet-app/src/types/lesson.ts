/**
 * TypeScript interfaces for FunNet skill-based lesson system
 *
 * Purpose: Define type-safe data structures for the gamified math learning system
 * Dependencies: None (pure type definitions)
 * Inputs: JSON data from fractions_path.json and individual lesson files
 * Outputs: Type safety for React components and data handling
 *
 * Limitations: No runtime validation
 * TODOs: Add question type interfaces (starting with the most complex ones)
 */

// TODO(human): Define the base question interface and question types
// Start here - create the foundation for all question types

interface BaseQuestion {
  type: QuestionType;
  question: string;
  correct_feedback: string;
  incorrect_feedback: string;
  explanation: string;
}

type QuestionType = "MCQ" | "TypeIn" | "TrueFalse" | "Order" | "Match";

type Question =
  | MCQQuestion
  | TypeInQuestion
  | TrueFalseQuestion
  | OrderQuestion
  | MatchQuestion;

interface MCQQuestion extends BaseQuestion {
  type: "MCQ";
  options: string[];
  answer: string;
}

interface TypeInQuestion extends BaseQuestion {
  type: "TypeIn";
  answer: string;
}

interface TrueFalseQuestion extends BaseQuestion {
  type: "TrueFalse";
  answer: boolean;
}

interface OrderQuestion extends BaseQuestion {
  type: "Order";
  items: string[];
  answer: string[];
}

interface MatchQuestion extends BaseQuestion {
  type: "Match";
  pairs: Record<string, string>;
}

export interface LessonContent {
  lesson_id: string;
  questions: Question[];
}

interface LessonRef {
  id: string;
  question_count: number;
  content_ref: string;
  reward: { xp: number; bonus_xp: number };
}

export type LearningNode = SkillNode | CheckpointNode;

interface SkillNode {
  id: string;
  type: "skill";
  title: string;
  lessons: LessonRef[];
  totalLessons: number;
}

interface CheckpointNode {
  id: string;
  type: "checkpoint";
  title: string;
  lessons: LessonRef[];
  totalLessons: number;
  requires: string[];
  reward: { gems: number; badge: string };
}

interface Unit {
  name: string;
  guidebook: { summary: string; key_points: string[] };
  nodes: LearningNode[];
}

interface Section {
  name: string;
  units: Unit[];
}

export interface Topic {
  topic: string;
  sections: Section[];
}
