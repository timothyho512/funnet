/**
 * Progress tracking utilities
 *
 * Purpose: Track lesson completion and calculate unlock states
 * Dependencies: Server Actions for database persistence
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

// TODO(human): Update getUserProgress function
// This function should:
// 1. Change from sync to async (return Promise<UserProgress>)
// 2. Call getUserProgress Server Action instead of localStorage
// 3. Handle the response: if success && data, convert arrays to Sets
// 4. Return empty Sets as fallback for errors
// 5. Add try/catch for error handling with console.error

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

// export function getUserProgress(): UserProgress {
//   if (typeof window === "undefined") {
//     // Server-side rendering - return empty progress
//     return {
//       completedLessons: new Set(),
//       completedNodes: new Set(),
//     };
//   }

//   const completed = localStorage.getItem("funnet_progress");
//   if (!completed) {
//     return {
//       completedLessons: new Set(),
//       completedNodes: new Set(),
//     };
//   }

//   const data = JSON.parse(completed);
//   return {
//     completedLessons: new Set(data.completedLessons || []),
//     completedNodes: new Set(data.completedNodes || []),
//   };
// }

// TODO(human): Update markLessonCompleted function
// This function should:
// 1. Change from sync to async (return Promise<boolean>)
// 2. Call markLessonComplete Server Action instead of localStorage
// 3. Return true if result.success, false otherwise
// 4. Add try/catch for error handling with console.error
// 5. Remove the getUserProgress/saveUserProgress logic

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
