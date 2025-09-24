/**
   * Topic data loading utilities for FunNet
   * 
   * Purpose: Load topic structure and calculate progress/unlock 
  states
   * Inputs: Topic name (e.g., "Maths")
   * Outputs: Topic structure with lesson nodes
   */

import fs from "fs";
import path from "path";
import { Topic } from "@/types/lesson";

export async function loadTopicData(topicName: string): Promise<Topic | null> {
  try {
    // Load the main topic structure file
    const filePath = path.join(
      process.cwd(),
      "../plan/question_demo/question_path.json"
    );

    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent) as Topic;
  } catch (error) {
    console.log("failed to load topic:", topicName, error);
    return null;
  }
}
