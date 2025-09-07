/**
 * Progress tracking utilities
 *
 * Purpose: Track lesson completion and calculate unlock states
 * Dependencies: localStorage for persistence
 * Inputs: Lesson IDs and completion status
 * Outputs: Progress data and unlock calculations
 */

export interface UserProgress {
  completedLessons: Set<string>;
  completedNodes: Set<string>;
}

export function getUserProgress(): UserProgress {
  if (typeof window === "undefined") {
    // Server-side rendering - return empty progress
    return {
      completedLessons: new Set(),
      completedNodes: new Set(),
    };
  }

  const completed = localStorage.getItem("funnet_progress");
  if (!completed) {
    return {
      completedLessons: new Set(),
      completedNodes: new Set(),
    };
  }

  const data = JSON.parse(completed);
  return {
    completedLessons: new Set(data.completedLessons || []),
    completedNodes: new Set(data.completedNodes || []),
  };
}

export function saveUserProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "funnet_progress",
    JSON.stringify({
      completedLessons: Array.from(progress.completedLessons),
      completedNodes: Array.from(progress.completedNodes),
    })
  );
}

export function markLessonCompleted(lessonId: string) {
  const progress = getUserProgress();
  progress.completedLessons.add(lessonId);
  saveUserProgress(progress);
}

export function markNodeCompleted(nodeId: string) {
  const progress = getUserProgress();
  progress.completedNodes.add(nodeId);
  saveUserProgress(progress);
}
