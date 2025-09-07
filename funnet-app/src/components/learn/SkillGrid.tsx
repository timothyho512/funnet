/**
   * Skill Grid component - Main layout for learn page
   * 
   * Purpose: Render topic structure as navigable skill nodes with unlock logic
   * Dependencies: Topic data, progress tracking, unlock calculator, SkillNode 
  component
   * Inputs: Topic data with sections/units/nodes
   * Outputs: Interactive skill tree with proper lock/unlock states
   * UX: Duolingo-style vertical progression with dependency gates
   */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Topic, LearningNode } from "@/types/lesson";
import { getUserProgress, UserProgress } from "@/lib/progress-tracker";
import { calculatNodeState } from "@/lib/unlock-calculator";
import SkillNode from "./SkillNode";

interface SkillGridProps {
  topicData: Topic;
}

export default function SkillGrid({ topicData }: SkillGridProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: new Set(),
    completedNodes: new Set(),
  });

  // Load progress on component mount
  useEffect(() => {
    const userProgress = getUserProgress();
    setProgress(userProgress);
  }, []);

  // Helper function to find the next incomplete lesson in a node
  const getNextLessonId = (node: LearningNode): string | null => {
    if (node.type !== 'skill' && node.type !== 'checkpoint') return null;
    if (!node.lessons || node.lessons.length === 0) return null;
    
    // Find first incomplete lesson
    const nextLesson = node.lessons.find(lesson => 
      !progress.completedLessons.has(lesson.id)
    );
    
    return nextLesson ? nextLesson.id : node.lessons[0].id; // Fallback to first lesson
  };

  // Handle lesson navigation
  const handleLessonSelect = (nodeId: string) => {
    // Find the node in topicData
    const allNodes = topicData.sections
      .flatMap(section => section.units)
      .flatMap(unit => unit.nodes);
    
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const nextLessonId = getNextLessonId(node);
    if (nextLessonId) {
      router.push(`/lesson/${nextLessonId}`);
    }
  };

  // TODO(human): Implement the main rendering logic
  // You need to:
  // 1. Iterate through topicData.sections and their units/nodes
  // 2. Calculate state for each node using calculatNodeState
  // 3. Render SkillNode components in a responsive grid
  // 4. Handle the nested structure (sections contain units contain nodes)

  return (
    <div className="space-y-8">
      {topicData.sections.map((section) => (
        <section key={section.name}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
          {/* Units mapping goes here */}
          {section.units.map((unit) => (
            <div key={unit.name} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">{unit.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unit.nodes.map((node) => {
                  const nodeState = calculatNodeState(node.id, progress, topicData);
                  return (
                    <SkillNode 
                      key={node.id}
                      node={node} 
                      isLocked={nodeState.isLocked} 
                      isCompleted={nodeState.isCompleted}
                      onClick={() => handleLessonSelect(node.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
