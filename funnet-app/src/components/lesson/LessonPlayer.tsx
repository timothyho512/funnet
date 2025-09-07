"use client";

import { useState, useEffect, useMemo } from "react";
import { LessonContent, Topic } from "@/types/lesson";
import {
  markLessonCompleted,
  markNodeCompleted,
  getUserProgress,
} from "@/lib/progress-tracker";
import { loadTopicData } from "@/lib/topic-loader";

interface LessonPlayerProps {
  lessonId: string;
  lessonData: LessonContent;
  topicData: Topic;
}

type LessonState = "answering" | "incorrect" | "correct" | "completed";

// TODO: Define your state type here
// What should the lesson state be called, and what are the possible values?

export default function LessonPlayer({
  lessonId,
  lessonData,
  topicData,
}: LessonPlayerProps) {
  // TODO: Add your useState hooks here
  // You'll need: current question index, lesson state, user answer, etc.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lessonState, setLessonState] = useState<LessonState>("answering");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [userOrderAnswer, setUserOrderAnswer] = useState<string[]>([]);
  const [userMatchAnswer, setUserMatchAnswer] = useState<
    Record<string, string>
  >({});
  const [selectedMatchItem, setSelectedMatchItem] = useState<{
    item: string;
    side: "left" | "right";
  } | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const currentQuestion = lessonData.questions[currentQuestionIndex];

  // Helper function to shuffle an array
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledValues = useMemo(() => {
    if (currentQuestion.type === "Match" && "pairs" in currentQuestion) {
      return shuffleArray(Object.values(currentQuestion.pairs));
    }
    return [];
  }, [currentQuestion]);

  // Initialize Order answer when question changes
  useEffect(() => {
    if (currentQuestion.type === "Order" && "items" in currentQuestion) {
      // Initialize with shuffled items for Order questions
      setUserOrderAnswer([...currentQuestion.items]);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const ExitModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
          <h3 className="text-lg font-bold mb-2">Wait, don't go</h3>
          <p className="text-gray-600 mb-6">
            You'll lose your progress if you quit now
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExitModal(false)}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded font-semibold hover:bg-green-600"
            >
              KEEP LEARNING
            </button>
            <button
              onClick={() => (window.location.href = "/learn")}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-semibold hover:bg-red-600"
            >
              END SESSION
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to check if user has provided an answer
  const hasUserAnswer = () => {
    switch (currentQuestion.type) {
      case "Order":
        return userOrderAnswer.length > 0;
      case "Match":
        return Object.keys(userMatchAnswer).length > 0;
      case "MCQ":
      case "TypeIn":
      case "TrueFalse":
      default:
        return userAnswer !== "";
    }
  };

  const handleCheck = () => {
    //TODO: Check if answer is correct
    let isCorrect = false;
    // Check answer based on question type
    switch (currentQuestion.type) {
      case "MCQ":
      case "TypeIn":
        isCorrect = userAnswer === currentQuestion.answer;
        break;
      case "TrueFalse":
        isCorrect = userAnswer === currentQuestion.answer.toString();
        break;
      case "Order":
        // TODO(human): Implement array comparison for Order questions
        // Compare userOrderAnswer array with currentQuestion.answer array
        isCorrect =
          userOrderAnswer.length === currentQuestion.answer.length &&
          userOrderAnswer.every(
            (item, index) => item === currentQuestion.answer[index]
          );
        break;
      case "Match":
        // TODO: Implement object comparison for Match questions
        const correctPairs = currentQuestion.pairs;
        isCorrect =
          Object.keys(correctPairs).length ===
            Object.keys(userMatchAnswer).length &&
          Object.keys(correctPairs).every(
            (key) => userMatchAnswer[key] === correctPairs[key]
          );
        break;
    }

    if (isCorrect) {
      setLessonState("correct");
    } else {
      setLessonState("incorrect");
    }
  };

  const handleTryAgain = () => {
    setUserAnswer(""); // Clear the wrong answer
    setUserOrderAnswer([]); // Clear order answer
    setUserMatchAnswer({});
    setSelectedMatchItem(null); // Clear seletion
    setLessonState("answering"); // Back to answering state
  };

  // Helper function to check and mark node completion
  const checkAndMarkNodeCompletion = async (completedLessonId: string) => {
    try {
      // Extract nodeId from lessonId: "FRA-101-L1" -> "FRA-101"
      const nodeId = completedLessonId.split("-").slice(0, 2).join("-");

      // Load topic data to find the node

      if (!topicData) return;

      // Find the specific node
      const allNodes = topicData.sections
        .flatMap((section) => section.units)
        .flatMap((unit) => unit.nodes);

      const node = allNodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Both skill and checkpoint nodes now have lessons array
      if (node.type !== "skill" && node.type !== "checkpoint") return;

      // Check if all lessons in this node are now completed
      const progress = getUserProgress();
      const allLessonsComplete = node.lessons.every((lesson) =>
        progress.completedLessons.has(lesson.id)
      );

      if (allLessonsComplete) {
        markNodeCompleted(nodeId);
        console.log(`🎉 Node ${nodeId} completed!`);
      }
    } catch (error) {
      console.error("Error checking node completion:", error);
    }
  };

  const handleContinue = () => {
    // Move to next question or complete lesson
    if (currentQuestionIndex < lessonData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer(""); // Clear answer for new question
      setUserOrderAnswer([]); // Clear order answer
      setUserMatchAnswer({});
      setLessonState("answering");
    } else {
      markLessonCompleted(lessonId);
      checkAndMarkNodeCompletion(lessonId); // Add smart node completion check
      setLessonState("completed");
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newArray = [...userOrderAnswer]; // Copy the array
      const temp = newArray[index];
      newArray[index] = newArray[index - 1];
      newArray[index - 1] = temp;
      setUserOrderAnswer(newArray);
    }
  };

  const moveDown = (index: number) => {
    const newArray = [...userOrderAnswer];
    if (index < newArray.length - 1) {
      const temp = newArray[index];
      newArray[index] = newArray[index + 1];
      newArray[index + 1] = temp;
      setUserOrderAnswer(newArray);
    }
  };

  const handleMatchClick = (item: string, side: "left" | "right") => {
    // if no selection, select this item
    if (!selectedMatchItem) {
      setSelectedMatchItem({ item, side });
      return;
    }
    // if same item clicked, deselect
    if (selectedMatchItem.item === item) {
      setSelectedMatchItem(null);
      return;
    }
    // if different sides clicked, create match
    if (selectedMatchItem.side !== side) {
      // Determine which is left and which is right
      const leftItem =
        selectedMatchItem.side === "left" ? selectedMatchItem.item : item;
      const rightItem =
        selectedMatchItem.side === "left" ? item : selectedMatchItem.item;
      // Check if this right item is already matched to another left item
      const rightItemAlreadyUsed =
        Object.values(userMatchAnswer).includes(rightItem);
      if (rightItemAlreadyUsed) {
        // Remove old match before creating new one
        const oldLeftItem = Object.keys(userMatchAnswer).find(
          (key) => userMatchAnswer[key] === rightItem
        );
        const newMatches = { ...userMatchAnswer };
        if (oldLeftItem) {
          delete newMatches[oldLeftItem];
        }
        setUserMatchAnswer({ ...newMatches, [leftItem]: rightItem });
      } else {
        setUserMatchAnswer((prev) => ({ ...prev, [leftItem]: rightItem }));
      }

      setSelectedMatchItem(null);
    } else {
      // Same side clicked - just change selection to new item
      setSelectedMatchItem({ item, side });
    }
  };

  if (lessonState === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-2">Complete!</h1>
          <p className="text-xl mb-6">
            You mastered {lessonData.questions.length} questions!
          </p>
          <div className="bg-white/20 rounded-lg p-4 mb-6">
            <p className="text-lg">+10 XP earned</p>
          </div>
          <button
            onClick={() => (window.location.href = "/learn")}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar section */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => setShowExitModal(true)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
          <div className="flex-1 mx-6">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / lessonData.questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {currentQuestionIndex + 1}/{lessonData.questions.length}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h1>Lesson Player for {lessonId}</h1>
        <p>
          Question {currentQuestionIndex + 1} of {lessonData.questions.length}
        </p>
        <p>Current state: {lessonState}</p>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Debug Panel - Remove this after testing */}
        {currentQuestion.type === "Match" && (
          <div
            className="bg-yellow-100 border border-yellow-400 p-4 
  rounded-lg mb-4"
          >
            <h4 className="font-bold text-sm">🐛 Debug Info:</h4>
            <p className="text-sm">
              Selected:{" "}
              {selectedMatchItem
                ? `${selectedMatchItem.item} (${selectedMatchItem.side})`
                : "None"}
            </p>
            <p className="text-sm">
              User Matches:
              {JSON.stringify(userMatchAnswer, null, 2)}
            </p>
            <p className="text-sm">
              Correct Answer:
              {JSON.stringify(currentQuestion.pairs, null, 2)}
            </p>
            <p className="text-sm">
              Shuffled Values:
              {JSON.stringify(shuffledValues)}
            </p>
          </div>
        )}

        {/* Question Type Rendering */}
        {currentQuestion.type === "MCQ" && (
          <div className="space-y-3 mb-8">
            {"options" in currentQuestion &&
              currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2
                transition-colors ${
                  userAnswer === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                >
                  {option}
                </button>
              ))}
          </div>
        )}
        {/* TODO: Add other question types here */}
        {currentQuestion.type === "TypeIn" && (
          <div className="mb-8">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={lessonState !== "answering"}
            />
          </div>
        )}

        {currentQuestion.type === "TrueFalse" && (
          <div className="mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => setUserAnswer("true")}
                disabled={lessonState !== "answering"}
                className={`flex-1 p-6 text-xl font-semibold rounded-lg
                        border-2 transition-colors ${
                          userAnswer === "true"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 disabled:hover:border-gray-200"
                        } ${
                  lessonState !== "answering"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                True
              </button>
              <button
                onClick={() => setUserAnswer("false")}
                disabled={lessonState !== "answering"}
                className={`flex-1 p-6 text-xl font-semibold rounded-lg
            border-2 transition-colors ${
              userAnswer === "false"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 disabled:hover:border-gray-200"
            } ${
                  lessonState !== "answering"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                False
              </button>
            </div>
          </div>
        )}

        {/* Order Questions */}
        {currentQuestion.type === "Order" && (
          <div className="space-y-3 mb-8">
            {/* TODO(human): Implement Order question drag-and-drop interface */}
            {/* Your task: Create draggable items that can be reordered */}
            {/* Available data: currentQuestion.items (shuffled items to order) */}
            {/* State: userOrderAnswer (array of strings in current order) */}
            {/* Goal: Allow user to drag items to reorder them */}
            {userOrderAnswer.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="flex-1">{item}</span>
                <button onClick={() => moveUp(index)}>↑</button>
                <button onClick={() => moveDown(index)}>↓</button>
              </div>
            ))}
          </div>
        )}

        {/* Match Questions */}
        {currentQuestion.type === "Match" && "pairs" in currentQuestion && (
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Column - Keys */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 mb-3">Left Column</h3>
              {Object.keys(currentQuestion.pairs).map((leftItem) => (
                <button
                  key={leftItem}
                  onClick={() => handleMatchClick(leftItem, "left")}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    selectedMatchItem?.item === leftItem
                      ? "border-blue-500 bg-blue-50"
                      : userMatchAnswer[leftItem]
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {leftItem}
                </button>
              ))}
            </div>
            {/* Right Column - Values (shuffled) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 mb-3">Right Column</h3>
              {shuffledValues.map((rightItem) => (
                <button
                  key={rightItem}
                  onClick={() => handleMatchClick(rightItem, "right")}
                  className={`w-full p-3 text-left rounded-lg border-2
                    transition-colors ${
                      selectedMatchItem?.item === rightItem
                        ? "border-blue-500 bg-blue-50"
                        : Object.values(userMatchAnswer).includes(rightItem)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {rightItem}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback section */}
        {(lessonState === "correct" || lessonState === "incorrect") && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              lessonState === "correct"
                ? "bg-green-100 border border-green-300"
                : "bg-red-100 border border-red-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {lessonState === "correct" ? "✅" : "❌"}
              </span>
              <span className="font-semibold">
                {lessonState === "correct" ? "Correct!" : "Incorrect"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {lessonState === "correct"
                ? currentQuestion.correct_feedback
                : currentQuestion.incorrect_feedback}
            </p>
          </div>
        )}
        {/* Action Button */}
        <div className="mt-8">
          {lessonState === "answering" && (
            <button
              onClick={handleCheck}
              disabled={!hasUserAnswer()}
              className={`px-8 py-3 rounded-lg font-semibold ${
                hasUserAnswer()
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              CHECK
            </button>
          )}
          {lessonState === "incorrect" && (
            <button
              onClick={handleTryAgain}
              className="bg-red-500 text-white px-8 py-3 rounded-lg 
            font-semibold hover:bg-red-600"
            >
              TRY AGAIN
            </button>
          )}
          {lessonState === "correct" && (
            <button
              onClick={handleContinue}
              className="bg-green-500 text-white px-8 py-3 
            rounded-lg font-semibold hover:bg-green-600"
            >
              CONTINUE
            </button>
          )}
        </div>
      </div>
      {showExitModal && <ExitModal />}
    </div>
  );
}
