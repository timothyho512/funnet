// Server Actions for progress tracking
// Import createServerSupabaseClient for database access
// Create markLessonComplete(lessonId: string) function
// Create markNodeComplete(nodeId: string) function
// Handle authentication (ensure user is logged in)
// Insert into lesson_completions and node_completions tables
// Return success/error responses with proper typing
// Handle duplicate completion attempts gracefully
"use server";

import { createServerSupabaseClient } from "@/lib/supabase";

export async function checkSpecificNodeCompletion(
  nodeId: string,
  lessonIds: string[]
) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { count } = await supabase
      .from("lesson_completions")
      .select("*", { count: "exact" })
      .in("lesson_id", lessonIds)
      .eq("user_id", user.id);

    return {
      success: true,
      isComplete: count === lessonIds.length,
    };
  } catch (error) {
    return { success: false, error: "Failed to check lesson completion" };
  }
}

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

    // XP earning logic here
    // Award 10 XP to the user's profile
    // Update both current_xp and total_xp_earned columns
    // Check if user should level up (current_xp >= current_level * 50)
    // If leveling up, subtract threshold from current_xp and increment current_level
    // Handle as atomic operations to prevent race conditions

    const result = await supabase.rpc("complete_lesson_with_rewards", {
      p_user_id: user.id,
      p_lesson_id: lessonId,
      p_xp_amount: 10,
    });

    if (result.error || !result.data?.success) {
      return {
        success: false,
        error:
          result.error?.message ||
          result.data?.error ||
          "Failed to award XP and gems",
      };
    }

    return { success: true, data: result.data };
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

    const result = await supabase.rpc("increment_nodes_completed", {
      p_user_id: user.id,
    });
    if (result.error || !result.data?.success) {
      return {
        success: false,
        error:
          result.error?.message ||
          result.data?.error ||
          "Failed to increment nodes count",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark node complete" };
  }
}

// getUserProgress Server Action
// Get the authenticated user
// Query lesson_completions and node_completions tables
// Return completed lesson IDs and node IDs as arrays
// Handle unauthenticated users by returning empty arrays

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
        completedLessons: lessonData?.map((row) => row.lesson_id) || [],
        completedNodes: nodeData?.map((row) => row.node_id) || [],
      },
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

// Get the authenticated user
// Query user_profiles table for their profile data
// If no profile exists, create one with default values
// Return profile data: { current_xp, current_level, total_xp_earned, lessons_completed, nodes_completed }
// Handle authentication and database errors properly
export async function getUserProfile() {
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

    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id);
    if (userError) {
      return { success: false, error: userError.message };
    }
    if (!userData || userData.length === 0) {
      const { data: newProfile, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          display_name: user.email?.split("@")[0],
        })
        .select("*");
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: newProfile[0] };
    } else {
      return { success: true, data: userData[0] };
    }
  } catch (error) {
    return { success: false, error: "failed to get user profile" };
  }
}

export async function getGlobalLeaderboard(limit: number = 10) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: leaderboard, error } = await supabase
      .from("global_leaderboard")
      .select(
        "id, display_name, total_xp_earned, current_level, lessons_completed, nodes_completed, rank, updated_at"
      )
      .limit(limit);

    if (error) {
      console.error("Error fetching global leaderboard", error);
      return { success: false, error: "Failed to fetch leaderboard" };
    }
    return {
      success: true,
      data: leaderboard || [],
      count: leaderboard?.length || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getGlobalLeaderboard", error);
    return { success: false, error: "Unexpected error occured" };
  }
}

export async function getCurrentUserRank() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: userRank, error } = await supabase
      .from("global_leaderboard")
      .select("rank, display_name, total_xp_earned, current_level")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching user rank:", error);
      return { success: false, error: "Failed to fetch user rank" };
    }
    return {
      success: true,
      data: userRank || null,
    };
  } catch (error) {
    console.error("Unexpected error in getCurrentUserRank:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

export async function getWeeklyLeaderboard(limit: number = 10) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: leaderboard, error } = await supabase
      .from("weekly_leaderboard")
      .select("id, display_name, weekly_xp, current_level, rank, updated_at")
      .limit(limit);

    if (error) {
      console.error("Error fetching weekly leaderboard", error);
      return { success: false, error: "Failed to fetch weekly leaderboard" };
    }
    return {
      success: true,
      data: leaderboard || [],
      count: leaderboard?.length || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getWeeklyLeaderboard:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

export async function getCurrentUserWeeklyRank() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: userRank, error } = await supabase
      .from("weekly_leaderboard")
      .select("rank, display_name, weekly_xp, current_level")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching user weekly rank:", error);
      return { success: false, error: "Failed to fetch user weekly rank" };
    }
    return {
      success: true,
      data: userRank || null,
    };
  } catch (error) {
    console.error("Unexpected error in getCurrentUserRank:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

// =============================================
// Virtual Economy Server Actions
// =============================================

// TODO(human): Implement virtual economy Server Actions
// Create these 4 functions following the exact same patterns as above:
// 1. getUserCurrency() - Get user's gem balance and totals
export async function getUserCurrency() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: currencyData, error } = await supabase
      .from("user_currency")
      .select("gems, total_gems_earned, total_gems_spent")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // no row found
      return { success: false, error: "Failed to fetch currency data" };
    }

    if (!currencyData) {
      const { data: newCurrency, error: insertError } = await supabase
        .from("user_currency")
        .insert({
          user_id: user.id,
          gems: 0,
          total_gems_earned: 0,
          total_gems_spent: 0,
        })
        .select("gems, total_gems_earned, total_gems_spent")
        .single();

      if (insertError) {
        return { success: false, error: "Failed to create currency record" };
      }

      return { success: true, data: newCurrency };
    }
    return { success: true, data: currencyData };
  } catch (error) {
    return { success: false, error: "failed to get user currency" };
  }
}
// 2. getShopItems() - Get all active shop items with boost data
export async function getShopItems() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }
    // Query shop_items with boost_items data (LEFT JOIN)
    const { data: shopItems, error } = await supabase
      .from("shop_items")
      .select(
        `
        id,
        name,
        description,
        item_type,
        price_gems,
        max_inventory,
        icon_emoji,
        sort_order,
        boost_items (
          multiplier,
          duration_minutes
        )
      `
      )
      .eq("active", true)
      .order("sort_order");

    if (error) {
      return { success: false, error: "failed to fetch shop items" };
    }

    return { success: true, data: shopItems || [] };
  } catch (error) {
    return { success: false, error: "Failed to get shop items" };
  }
}
// 3. purchaseItem(itemId: string) - Buy item (atomic: check balance, deduct gems, add inventory)
export async function purchaseItem(itemId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: purchaseResult, error: purchaseError } = await supabase.rpc(
      "process_item_purchase",
      {
        p_user_id: user.id,
        p_item_id: itemId,
      }
    );
    if (purchaseError) {
      return { success: false, error: "Purchase failed" };
    }

    return purchaseResult;
  } catch (error) {
    return { success: false, error: "Failed to purchase item" };
  }
}
// 4. getUserInventory() - Get user's inventory items with quantities
export async function getUserInventory() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user inventory with item details
    const { data: inventory, error } = await supabase
      .from("user_inventory")
      .select(
        `
      quantity,
      last_acquired_at,
      shop_items (
        id,
        name,
        description,
        item_type,
        icon_emoji,
        boost_items (
          multiplier,
          duration_minutes
        )
      )`
      )
      .eq("user_id", user.id)
      .eq("quantity", 0);

    if (error) {
      return { success: false, error: "failed to fetch inventory" };
    }

    return { success: true, data: inventory || [] };
  } catch (error) {
    return { success: false, error: "Failed to get user inventory" };
  }
}
