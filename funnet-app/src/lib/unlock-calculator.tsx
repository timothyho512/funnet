/**
   * Unlock calculation utilities
   * 
   * Determine which nodes are locked/unlocked based on 
  user progress
   * Logic: Sequential unlocking with checkpoint gates
   */

import { LearningNode, Topic } from "@/types/lesson";
import { UserProgress } from "./progress-tracker";

export interface NodeState {
  isLocked: boolean;
  isCompleted: boolean;
  isAvailable: boolean; // unlocked but not completed
}

export function calculateNodeState(
  nodeId: string,
  progress: UserProgress,
  topicData: Topic
): NodeState {
  // Find the specific node
  const allNodes: LearningNode[] = topicData.sections
    .flatMap((section) => section.units)
    .flatMap((unit) => unit.nodes);

  const node = allNodes.find((n) => n.id === nodeId);
  if (!node) {
    return { isLocked: true, isCompleted: false, isAvailable: false };
  }

  const isCompleted = progress.completedNodes.has(node.id);

  // First node is always available
  if (node.id === "FRA-101") {
    return {
      isLocked: false,
      isCompleted,
      isAvailable: !isCompleted,
    };
  }

  // Find the previous node in sequence
  const currentIndex = allNodes.findIndex((n) => n.id === node.id);
  if (currentIndex <= 0) {
    return { isLocked: true, isCompleted, isAvailable: false };
  }

  const previousNode = allNodes[currentIndex - 1];
  const isPreviousCompleted = progress.completedNodes.has(previousNode.id);

  // For checkpoint nodes, check if all required nodes are completed
  if (node.type === "checkpoint" && "requires" in node) {
    const allRequiredCompleted = node.requires.every((requiredId) =>
      progress.completedNodes.has(requiredId)
    );
    return {
      isLocked: !allRequiredCompleted,
      isCompleted,
      isAvailable: allRequiredCompleted && !isCompleted,
    };
  }
  // Regular sequential unlocking
  return {
    isLocked: !isPreviousCompleted,
    isCompleted,
    isAvailable: isPreviousCompleted && !isCompleted,
  };
}
