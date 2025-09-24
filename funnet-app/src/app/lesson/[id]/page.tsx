/**
 * Single-question focused learning experience with progress tracking
 * Inputs: Lesson ID from URL params (e.g., /lesson/FRA-101-L1)
 * Outputs: Interactive single-question lesson with CHECK/CONTINUE flow
 *
 * UX Flow: Question → User Input → CHECK → Feedback → CONTINUE → Next Question
 */

import { notFound } from "next/navigation";
import { loadLessonData } from "@/lib/lesson-loader";
import { loadTopicData } from "@/lib/topic-loader";
import LessonPlayer from "@/components/lesson/LessonPlayer";

interface LessonPageProps {
  params: { id: string };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;

  const lessonData = await loadLessonData(id);
  const topicData = await loadTopicData("Maths");

  if (!lessonData) {
    notFound();
  }
  if (!topicData) {
    notFound();
  }

  return (
    <LessonPlayer lessonId={id} lessonData={lessonData} topicData={topicData} />
  );
}
