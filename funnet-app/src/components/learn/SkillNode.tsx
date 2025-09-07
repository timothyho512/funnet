/**
   * Individual skill node component for learn page
   * 
   * Purpose: Display a single lesson/skill with state (available, 
  locked, completed)
   * Dependencies: Lesson node data, progress state
   * UX: Duolingo-style circular/hexagonal tile with progress 
  indicators
   */
"use client";

import { LearningNode } from "@/types/lesson";

interface SkillNodeProps {
  node: LearningNode;
  isLocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export default function SkillNode({
  node,
  isLocked,
  isCompleted,
  onClick,
}: SkillNodeProps) {
  const getNodeStyle = () => {
    if (isCompleted) return "bg-green-500 text-white border-green-600";
    if (isLocked)
      return "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
    return "bg-white text-blue-600 border-blue-400 hover:border-blue-500 cursor-pointer";
  };

  const getIcon = () => {
    if (isCompleted) return "✅";
    if (isLocked) return "🔒";
    if (node.type === "checkpoint") return "👑";
    return "📝";
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <button
        onClick={isLocked ? undefined : onClick}
        disabled={isLocked}
        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${getNodeStyle()}`}
      >
        {getIcon()}
      </button>
      <p className="text-sm text-center mt-2 max-w-24">{node.title}</p>
      {/* Show lesson count for skill nodes */}
      {node.type === "skill" && (
        <p className="text-xs text-gray-500">
          {"lessons" in node ? node.lessons.length : 0} lessons
        </p>
      )}
    </div>
  );
}
