/**
 * Progress tracking utilities
 *
 * Track lesson completion and calculate unlock states
 * Server Actions for database persistence
 * Inputs: Lesson IDs and completion status
 * Outputs: Progress data and unlock calculations
 */
// Server Actions (aliased to avoid naming conflicts)
import {
  getUserProgress as getUserProgressAction,
  markLessonComplete as markLessonCompleteAction,
  markNodeComplete as markNodeCompleteAction,
} from "@/app/actions/progress";

export interface UserProgress {
  completedLessons: Set<string>;
  completedNodes: Set<string>;
}

export async function getUserProgress(): Promise<UserProgress> {
  try {
    const result = await getUserProgressAction();
    if (result.success && result.data) {
      return {
        completedLessons: new Set(result.data.completedLessons),
        completedNodes: new Set(result.data.completedNodes),
      };
    }

    return {
      completedLessons: new Set(),
      completedNodes: new Set(),
    };
  } catch (error) {
    console.error("Failed to get user progress:", error);
    return {
      completedLessons: new Set(),
      completedNodes: new Set(),
    };
  }
}

export async function markLessonCompleted(lessonId: string): Promise<boolean> {
  try {
    const result = await markLessonCompleteAction(lessonId);
    if (result.success) {
      return true;
    } else {
      console.error("Failed to mark lesson complete:", result.error);
      return false;
    }
  } catch (error) {
    console.error("Failed to mark lesson complete:", error);
    return false;
  }
}
export async function markNodeCompleted(nodeId: string): Promise<boolean> {
  try {
    const result = await markNodeCompleteAction(nodeId);
    if (result.success) {
      return true;
    } else {
      console.error("Failed to mark node complete:", result.error);
      return false;
    }
  } catch (error) {
    console.error("Failed to mark node complete:", error);
    return false;
  }
}
