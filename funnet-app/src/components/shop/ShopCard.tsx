// ShopCard component for displaying and purchasing shop items

// Accept shop item data as props (from getShopItems Server Action)
// Display item details: name, description, price, icon emoji, boost stats if applicable
// Show purchase button with appropriate states (enabled/disabled/loading)
// Handle purchase clicks using purchaseItem Server Action
// Display success/error messages after purchase attempts
// Consider gem balance for purchase button state (pass user gems as prop)
"use client";

import { useState } from "react";
import { purchaseItem } from "@/app/actions/progress";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  item_type: string;
  price_gems: number;
  max_inventory: number | null;
  icon_emoji: string;
  boost_items?:
    | {
        multiplier: string;
        duration_minutes: number;
      }[]
    | null;
}

interface ShopCardProps {
  item: ShopItem;
  userGems: number;
  onPurchaseSuccess?: () => void;
}

export default function ShopCard({
  item,
  userGems,
  onPurchaseSuccess,
}: ShopCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canAfford = userGems >= item.price_gems;

  const handlePurchase = async () => {
    if (!canAfford || isLoading) return;
    setIsLoading(true);
    setMessage("");
    try {
      const result = await purchaseItem(item.id);

      if (result.success) {
        setMessage("✅ Purchase successful!");
        onPurchaseSuccess?.();
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Purchase failed");
    } finally {
      setIsLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Item Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{item.icon_emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{item.item_type}</p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="flex items-center space-x-1 text-lg font-semibold 
    text-purple-600"
          >
            <span>💎</span>
            <span>{item.price_gems}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">{item.description}</p>

      {/* Boost Details (if applicable) */}
      {item.boost_items?.[0] && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700 font-medium">
              {parseFloat(item.boost_items[0].multiplier)}x XP Multiplier
            </span>
            <span className="text-blue-600">
              {item.boost_items[0].duration_minutes} minutes
            </span>
          </div>
        </div>
      )}

      {/* Inventory Limit */}
      {item.max_inventory && (
        <div className="text-xs text-gray-500 mb-4">
          Max inventory: {item.max_inventory}
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={!canAfford || isLoading}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          !canAfford
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : isLoading
            ? "bg-purple-400 text-white cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-4 h-4 border-2 border-white border-t-transparent 
    rounded-full animate-spin"
            ></div>
            <span>Purchasing...</span>
          </div>
        ) : !canAfford ? (
          "Insufficient gems"
        ) : (
          "Purchase"
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-3 text-sm text-center ${
            message.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
