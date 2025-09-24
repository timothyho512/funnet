/**
 * Lesson data loading utilities for FunNet
 *
 * Purpose: Load and transform lesson data from JSON files
 * Inputs: Lesson ID string (e.g., "FRA-101-L1")
 * Outputs: Type-safe lesson data or null if not found
 */

import fs from "fs";
import path from "path";
import { LessonContent } from "@/types/lesson";

// Subject/Topic mapping for scalable content organization
const subjectMap: Record<string, { topic: string; section: string }> = {
  // Mathematics
  FRA: { topic: "Maths", section: "Fraction" },
  PER: { topic: "Maths", section: "Percentage" },
  ALG: { topic: "Maths", section: "Basic_Algebra" },

  // Physics (future)
  PHY: { topic: "Physics", section: "Mechanics" },
  OPT: { topic: "Physics", section: "Optics" },

  // Chemistry (future)
  CHE: { topic: "Chemistry", section: "Organic" },
  BIO: { topic: "Chemistry", section: "Biochemistry" },
};
/**
 * Loads lesson content from hierarchical JSON structure
 *
 * Strategy: Parse lesson IDs using position-based extraction for performance
 * over regex patterns. The lessonId format "FRA-101-L1" encodes:
 * - Subject (FRA), Node (101), Lesson (L1)
 * - Node format: Unit[1]0[NodeNumber]
 */

export async function loadLessonData(
  lessonId: string
): Promise<LessonContent | null> {
  // Extract subject code from lessonId (e.g., "FRA" from "FRA-101-L1")
  const subjectCode = lessonId.split("-")[0]; // Gets "FRA"

  const nodeCode = lessonId.split("-")[1]; // Gets "101"

  const unitNumber = nodeCode[0]; // "2"
  const nodeNumber = nodeCode[2]; //"1"

  // Get topic and section from subjectMap defined above
  const mapping = subjectMap[subjectCode]; // { topic: 'Maths', section: 'Fraction' }

  if (!mapping) {
    return null;
  }

  // Parse unit and node numbers as before
  const unitFolder = `unit_${unitNumber}`; // "unit_2"
  const nodeFolder = `Node ${nodeNumber}`; // "101" -> "Node 1"

  const { topic, section } = mapping;

  // Build the new file path: plan/question_demo/{topic}/{section}/unit_{x}/Node {y}/{lessonId}.json
  const filePath = path.join(
    process.cwd(),
    "../plan/question_demo", // Go up one directory from funnet-app to funnet
    topic,
    section,
    unitFolder,
    nodeFolder,
    `${lessonId}.json`
  );

  // Load and return the data
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent) as LessonContent;
  } catch (error) {
    // Log error for production debugging
    console.error(`Failed to load lesson file: ${filePath}`, error);
    return null; // File not found or invalid JSON
  }
}
