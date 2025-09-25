/**
 * LeaderboardCard - Real-time competitive leaderboards with live updates
 *
 * Display global and weekly rankings with real-time WebSocket integration
 * Dependencies: Supabase real-time subscriptions, leaderboard Server Actions
 * UX: Competitive rankings with live position updates and user highlighting
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getUserProfile } from "@/app/actions/progress";
import {
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
  getCurrentUserRank,
  getCurrentUserWeeklyRank,
} from "@/app/actions/progress";

interface GlobalLeaderboardEntry {
  id: string;
  display_name: string;
  total_xp_earned: number;
  current_level: number;
  lessons_completed: number;
  nodes_completed: number;
  rank: number;
  updated_at: string;
}

interface WeeklyLeaderboardEntry {
  id: string;
  display_name: string;
  current_level: number;
  weekly_xp: number;
  rank: number;
  updated_at: string;
}

interface GlobalUserRank {
  rank: number;
  display_name: string;
  total_xp_earned: number;
  current_level: number;
}

interface WeeklyUserRank {
  rank: number;
  display_name: string;
  weekly_xp: number;
  current_level: number;
}

export default function LeaderboardCard() {
  const [activeTab, setActiveTab] = useState<"global" | "weekly">("global");
  const [globalLeaderboard, setGlobalLeaderboard] = useState<
    GlobalLeaderboardEntry[]
  >([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<
    WeeklyLeaderboardEntry[]
  >([]);
  const [userGlobalRank, setUserGlobalRank] = useState<GlobalUserRank | null>(
    null
  );
  const [userWeeklyRank, setUserWeeklyRank] = useState<WeeklyUserRank | null>(
    null
  );
  const [currentUserProfileId, setCurrentUserProfileId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both global and weekly leaderboards (limit 10)
  // Fetch current user's rank in both leaderboards
  // Handle loading states and errors appropriately
  // Use Promise.all for concurrent loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchLeaderboards = [
          getGlobalLeaderboard(10),
          getWeeklyLeaderboard(10),
          getCurrentUserRank(),
          getCurrentUserWeeklyRank(),
          getUserProfile(), // Get current user's profile for ID
        ];

        const results = await Promise.all(fetchLeaderboards);
        const [
          globalBoardResult,
          weeklyBoardResult,
          globalRankResult,
          weeklyRankResult,
          userProfileResult,
        ] = results;

        if (!globalBoardResult.success)
          throw new Error(
            globalBoardResult.error || "Failed to load global leaderboard"
          );
        if (!weeklyBoardResult.success)
          throw new Error(
            weeklyBoardResult.error || "Failed to load weekly leaderboard"
          );
        if (!globalRankResult.success)
          throw new Error(
            globalRankResult.error || "Failed to load global rank"
          );
        if (!weeklyRankResult.success)
          throw new Error(
            weeklyRankResult.error || "Failed to load weekly rank"
          );
        if (!userProfileResult.success)
          throw new Error(
            userProfileResult.error || "Failed to load user profile"
          );

        setGlobalLeaderboard(
          (globalBoardResult.data as GlobalLeaderboardEntry[]) || []
        );
        setWeeklyLeaderboard(
          (weeklyBoardResult.data as WeeklyLeaderboardEntry[]) || []
        );
        setUserGlobalRank((globalRankResult.data as GlobalUserRank) || null);
        setUserWeeklyRank((weeklyRankResult.data as WeeklyUserRank) || null);
        setCurrentUserProfileId(
          userProfileResult.data?.id ? String(userProfileResult.data.id) : null
        );
      } catch (error) {
        console.error("failed to load leaderboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load leaderboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time subscription for global leaderboard updates
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes in user_profiles table
    const subscription = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "user_profiles",
        },
        (payload) => {
          console.log("Real-time update received:", payload);

          // Refresh both global and weekly leaderboard data when user_profiles changes
          const refreshLeaderboardData = async () => {
            try {
              const [
                globalBoardResult,
                globalRankResult,
                weeklyBoardResult,
                weeklyRankResult,
              ] = await Promise.all([
                getGlobalLeaderboard(10),
                getCurrentUserRank(),
                getWeeklyLeaderboard(10),
                getCurrentUserWeeklyRank(),
              ]);

              // Update global leaderboard
              if (globalBoardResult.success) {
                setGlobalLeaderboard(
                  (globalBoardResult.data as GlobalLeaderboardEntry[]) || []
                );
              }
              if (globalRankResult.success) {
                setUserGlobalRank(
                  (globalRankResult.data as GlobalUserRank) || null
                );
              }

              // Update weekly leaderboard
              if (weeklyBoardResult.success) {
                setWeeklyLeaderboard(
                  (weeklyBoardResult.data as WeeklyLeaderboardEntry[]) || []
                );
              }
              if (weeklyRankResult.success) {
                setUserWeeklyRank(
                  (weeklyRankResult.data as WeeklyUserRank) || null
                );
              }
            } catch (error) {
              console.error("Error refreshing leaderboard data:", error);
            }
          };

          refreshLeaderboardData();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Leaderboard</h2>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("global")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "global"
                ? "bg-blue-500 text-white font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "weekly"
                ? "bg-blue-500 text-white font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            This Week
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-600">
            <p className="font-semibold mb-2">Unable to load leaderboard</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Leaderboard display logic */}
        {/*
         * Show current user's rank at the top (if not in top 10)
         * Display the leaderboard entries based on activeTab
         * Highlight the current user if they appear in the list
         * Handle empty states appropriately
         * Show proper ranking with trophy icons for top 3
         */}
        <div>
          {(() => {
            // Data selection logic here
            const currentLeaderboard =
              activeTab === "global" ? globalLeaderboard : weeklyLeaderboard;
            const currentUserRank =
              activeTab === "global" ? userGlobalRank : userWeeklyRank;

            // Helper function to get XP value
            const getXpValue = (
              entry: GlobalLeaderboardEntry | WeeklyLeaderboardEntry
            ) => {
              return activeTab === "global"
                ? (entry as GlobalLeaderboardEntry).total_xp_earned
                : (entry as WeeklyLeaderboardEntry).weekly_xp;
            };

            // Helper function to get trophy icon
            const getTrophyIcon = (rank: number) => {
              if (rank === 1) return "🏆";
              if (rank === 2) return "🥈";
              if (rank === 3) return "🥉";
              return null;
            };

            // Use profile ID for highlighting (secure approach)
            const currentUserId = currentUserProfileId;

            return (
              <div>
                {/* Current user rank (if not in top 10) */}
                {currentUserRank && currentUserRank.rank > 10 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Your Rank</div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        #{currentUserRank.rank} {currentUserRank.display_name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-bold">
                          {activeTab === "global"
                            ? (currentUserRank as GlobalUserRank)
                                .total_xp_earned
                            : (currentUserRank as WeeklyUserRank)
                                .weekly_xp}{" "}
                          XP
                        </span>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                          Level {currentUserRank.current_level}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leaderboard entries */}
                {currentLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {currentLeaderboard.map((entry) => {
                      const isCurrentUser = entry.id === currentUserId;
                      const trophy = getTrophyIcon(entry.rank);

                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isCurrentUser
                              ? "bg-yellow-50 border-2 border-yellow-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8">
                              {trophy ? (
                                <span className="text-2xl">{trophy}</span>
                              ) : (
                                <span className="font-bold text-gray-600">
                                  #{entry.rank}
                                </span>
                              )}
                            </div>
                            <div>
                              <div
                                className={`font-semibold ${
                                  isCurrentUser
                                    ? "text-yellow-800"
                                    : "text-gray-800"
                                }`}
                              >
                                {entry.display_name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-yellow-600 text-sm">
                                    (You)
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                Level {entry.current_level}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${
                                isCurrentUser
                                  ? "text-yellow-800"
                                  : "text-blue-600"
                              }`}
                            >
                              {getXpValue(entry)} XP
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="font-semibold mb-2">No rankings yet</p>
                    <p className="text-sm">
                      Complete some lessons to appear on the leaderboard!
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
