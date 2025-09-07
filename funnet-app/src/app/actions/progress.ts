// TODO(human): Create Server Actions for progress tracking
// This file should:
// 1. Use "use server" directive for Server Actions
// 2. Import createServerSupabaseClient for database access
// 3. Create markLessonComplete(lessonId: string) function
// 4. Create markNodeComplete(nodeId: string) function
// 5. Handle authentication (ensure user is logged in)
// 6. Insert into lesson_completions and node_completions tables
// 7. Return success/error responses with proper typing
// 8. Handle duplicate completion attempts gracefully
"use server";

import { createServerSupabaseClient } from "@/lib/supabase";

export async function markLessonComplete(lessonId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get Authenticated user (security!)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }
    // Insert lesson completion
    const { error } = await supabase.from("lesson_completions").insert({
      lesson_id: lessonId,
      user_id: user.id,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark lesson complete" };
  }
}

export async function markNodeComplete(nodeId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get Authenticated user (security!)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }
    // Insert node completion
    const { error } = await supabase.from("node_completions").insert({
      node_id: nodeId,
      user_id: user.id,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark node complete" };
  }
}

// TODO(human): Add getUserProgress Server Action
// This function should:
// 1. Get the authenticated user
// 2. Query lesson_completions and node_completions tables
// 3. Return completed lesson IDs and node IDs as arrays
// 4. Handle unauthenticated users by returning empty arrays

export async function getUserProgress() {
  try {
    const supabase = await createServerSupabaseClient();
    // Get Authenticated user (security!)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Query lesson completions
    const { data: lessonData, error: lessonError } = await supabase
      .from("lesson_completions")
      .select("lesson_id")
      .eq("user_id", user.id);
    if (lessonError) {
      return { success: false, error: lessonError.message };
    }

    // Query node completions
    const { data: nodeData, error: nodeError } = await supabase
      .from("node_completions")
      .select("node_id")
      .eq("user_id", user.id);
    if (nodeError) {
      return { success: false, error: nodeError.message };
    }

    return { 
      success: true, 
      data: {
        completedLessons: lessonData?.map(row => row.lesson_id) || [],
        completedNodes: nodeData?.map(row => row.node_id) || []
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to retrieve user progress" };
  }
}

export async function getTopicData(topicName: string) {
  try {
    // Import loadTopicData here (server-only)
    const { loadTopicData } = await import("@/lib/topic-loader");
    const topicData = await loadTopicData(topicName);
    
    if (!topicData) {
      return { success: false, error: "Topic not found" };
    }
    
    return { success: true, data: topicData };
  } catch (error) {
    return { success: false, error: "Failed to load topic data" };
  }
}
