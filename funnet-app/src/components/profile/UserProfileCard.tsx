/**
 * UserProfileCard - Display user gamification stats and progress
 *
 * Show XP, level, and progress in attractive card format
 * Dependencies: getUserProfile Server Action, Tailwind CSS
 * UX: Display of user achievements and progress
 */
"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "@/app/actions/progress";

interface UserProfile {
  current_xp: number;
  current_level: number;
  total_xp_earned: number;
  lessons_completed: number;
  nodes_completed: number;
  display_name: string;
}

export default function UserProfileCard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect to fetch profile data
  // Call getUserProfile() when component mounts
  // Handle loading/error/success states appropriately
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getUserProfile();
        if (!result.success) {
          setError(result.error || "Failed to load profile");
          setIsLoading(false);
          return;
        }
        setUserProfile(result.data);
        setIsLoading(false); // Set loading to false after data is loaded
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setError("Failed to load profile");
        setIsLoading(false); // Still stop loading on error
      }
    };
    loadData();
  }, []);

  // Loading state JSX
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Error state JSX
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold mb-2">Error loading profile</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Success state JSX
  // Display profile data
  if (!userProfile) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Profile display UI here */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {userProfile.display_name}!
        </h2>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
            Level {userProfile.current_level}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>XP Progress</span>
            <span>{userProfile.current_xp} XP</span>
          </div>
          {/* Simplified XP progress bar - current_xp is XP within current level */}
          {(() => {
            // XP needed for next level (Level 1->2 = 50, Level 2->3 = 100, etc.)
            const xpForNextLevel = userProfile.current_level * 50;
            const progressPercentage = Math.min(
              (userProfile.current_xp / xpForNextLevel) * 100,
              100
            );

            return (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, progressPercentage)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {userProfile.current_xp} / {xpForNextLevel} XP to Level{" "}
                  {userProfile.current_level + 1}
                </div>
              </>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {userProfile.lessons_completed}
            </div>
            <div className="text-sm text-gray-600">Lessons</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {userProfile.nodes_completed}
            </div>
            <div className="text-sm text-gray-600">Nodes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
