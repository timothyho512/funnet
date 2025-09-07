/**
   * Learn page - Lesson selection and progress overview
   * 
   * Purpose: Display available lessons, progress, and next actions
   * Dependencies: Topic path data, progress tracking
   * UX: Duolingo-style skill tree with locked/available/completed 
  states
   */
import { notFound } from "next/navigation";
import { loadTopicData } from "@/lib/topic-loader";
import SkillGrid from "@/components/learn/SkillGrid";

export default async function LearnPage() {
  const topicData = await loadTopicData("Maths");

  if (!topicData) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Learn {topicData.topic}
        </h1>
        <SkillGrid topicData={topicData} />
      </div>
    </div>
  );
}
