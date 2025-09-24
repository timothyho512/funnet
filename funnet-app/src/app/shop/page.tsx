// Shop page for virtual economy interface

// Client component (needs useState, useEffect for interactivity)
// Check authentication and redirect to /auth if not logged in
// Load user currency using getUserCurrency Server Action
// Load shop items using getShopItems Server Action
// Display user gem balance prominently at the top
// Show shop items in a responsive grid using ShopCard components
// Handle loading states while data is being fetched
// Implement refresh functionality after successful purchases
//
// - Authentication check and redirect logic
// - Currency display section (gems balance with icon)
// - Shop items grid (responsive: 1 col mobile, 2-3 cols desktop)
// - Loading states for both currency and items
// - Error handling for Server Action failures
// - Refresh function that gets called by ShopCard onPurchaseSuccess
//
// Consider adding a page header like "💎 Shop" and navigation back to /learn
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUserCurrency, getShopItems } from "@/app/actions/progress";
import ShopCard from "@/components/shop/ShopCard";

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

export default function ShopPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userGems, setUserGems] = useState(0);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Load user currency
  const loadUserCurrency = async () => {
    setIsLoadingCurrency(true);
    try {
      const result = await getUserCurrency();
      if (result.success && result.data) {
        setUserGems(result.data.gems);
      } else {
        setError(result.error || "Failed to load currency");
      }
    } catch (error) {
      setError("failed to load currency");
    } finally {
      setIsLoadingCurrency(false);
    }
  };

  // Load shop items
  const loadShopItems = async () => {
    setIsLoadingItems(true);
    try {
      const result = await getShopItems();
      if (result.success && result.data) {
        setShopItems(result.data);
      } else {
        setError(result.error || "Failed to load shop items");
      }
    } catch (error) {
      setError("failed to load shop items");
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Refresh data after successful purchase
  const handlePurchaseSuccess = () => {
    loadUserCurrency(); // Refresh gem balance
    // Optionally refresh shop items if needed
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadUserCurrency();
      loadShopItems();
    }
  }, [user]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 
  flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 border-purple-500 
  border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💎 Shop</h1>
            <p className="text-gray-600">
              Purchase items to boost your learning
            </p>
          </div>
          <button
            onClick={() => router.push("/learn")}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium
 hover:bg-purple-50 transition-colors"
          >
            ← Back to Learn
          </button>
        </div>

        {/* Currency Display */}
        <div
          className="bg-white rounded-lg shadow-md p-6 mb-8 border 
border-gray-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-4xl">💎</span>
            <div className="text-center">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Your Balance
              </p>
              {isLoadingCurrency ? (
                <div
                  className="w-6 h-6 border-2 border-purple-500 
border-t-transparent rounded-full animate-spin mx-auto"
                ></div>
              ) : (
                <p
                  className="text-3xl font-bold 
text-purple-600"
                >
                  {userGems.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-gray-400">gems</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Available Items
          </h2>

          {isLoadingItems ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
gap-6"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md p-6 border
 border-gray-200 animate-pulse"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : shopItems.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
gap-6"
            >
              {shopItems.map((item) => (
                <ShopCard
                  key={item.id}
                  item={item}
                  userGems={userGems}
                  onPurchaseSuccess={handlePurchaseSuccess}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No items available in the shop
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
