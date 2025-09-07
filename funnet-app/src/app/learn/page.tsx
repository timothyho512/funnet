/**
 * Learn page - Lesson selection and progress overview (PROTECTED)
 *
 * Purpose: Display available lessons, progress, and next actions for authenticated users
 * Dependencies: Authentication, topic path data, progress tracking
 * UX: Duolingo-style skill tree with locked/available/completed states
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkillGrid from "@/components/learn/SkillGrid";
import { useAuth } from "@/components/auth/AuthProvider";
import { Topic } from "@/types/lesson";
import { getTopicData } from "@/app/actions/progress";

// TODO(human): Add authentication protection
// This component should:
// 1. Use useAuth() to check authentication state
// 2. Show loading spinner while auth is loading
// 3. Redirect to /auth if user is not authenticated
// 4. Only render the learning content if user is authenticated
// 5. Load topic data after confirming authentication

export default function LearnPage() {
  const router = useRouter();
  const [topicData, setTopicData] = useState<Topic | null>(null);
  const [isLoadingTopic, setIsLoadingTopic] = useState(true);
  const { user, loading } = useAuth();

  // Handle authentication and data loading
  useEffect(() => {
    // If still loading auth, wait
    if (loading) return;
    
    // If no user, redirect to auth
    if (!user) {
      router.push("/auth");
      return;
    }
    
    // User is authenticated, load data
    const loadData = async () => {
      try {
        const result = await getTopicData("Maths");
        if (!result.success || !result.data) {
          console.error("Failed to load topic data:", result.error);
          return;
        }
        setTopicData(result.data);
      } catch (error) {
        console.error("Failed to load topic data:", error);
      } finally {
        setIsLoadingTopic(false);
      }
    };

    loadData();
  }, [user, loading, router]);

  // Check auth loading first
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated (redirect happens in useEffect)
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoadingTopic || !topicData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading learning content...</p>
        </div>
      </div>
    );
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
