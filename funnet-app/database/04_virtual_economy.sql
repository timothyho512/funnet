-- =============================================
-- Virtual Economy Database Schema
-- =============================================

-- User Currency Balance Table
CREATE TABLE user_currency (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gems INTEGER NOT NULL DEFAULT 0 CHECK (gems >= 0),
    total_gems_earned INTEGER NOT NULL DEFAULT 0,
    total_gems_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one currency record per user
    UNIQUE(user_id)
);

-- Shop Items Catalog Table
CREATE TABLE shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('consumable', 'cosmetic', 'boost')),
    price_gems INTEGER NOT NULL CHECK (price_gems > 0),

    -- Inventory management
    max_inventory INTEGER,
    
    -- Metadata
    icon_emoji TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE boost_items (
    item_id TEXT PRIMARY KEY REFERENCES shop_items(id) ON DELETE CASCADE,
    multiplier DECIMAL(3,2) NOT NULL CHECK (multiplier > 1.0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Inventory Table
CREATE TABLE user_inventory (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    
    -- Track when items were acquired
    first_acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one inventory record per user per item
    UNIQUE(user_id, item_id)
);

-- Currency Transaction Log Table
CREATE TABLE currency_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend')),
    gems_amount INTEGER NOT NULL CHECK (gems_amount > 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    
    -- Source tracking
    source TEXT NOT NULL, -- 'lesson_xp', 'purchase', 'level_reward', etc.
    source_detail JSONB, -- Additional context (lesson_id, item_purchased, etc.)
    
    -- Purchase-specific fields
    item_id TEXT REFERENCES shop_items(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL

    
);

  -- Enable RLS on all tables
  ALTER TABLE user_currency ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
  ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;
   -- User Currency Policies
  CREATE POLICY "Users can view own currency balance" ON user_currency
      FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own currency balance" ON user_currency
      FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "System can insert currency records" ON user_currency
      FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- User Inventory Policies
  CREATE POLICY "Users can view own inventory" ON user_inventory
      FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own inventory" ON user_inventory
      FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "System can insert inventory records" ON user_inventory
      FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- Transaction Log Policies (read-only for users)
  CREATE POLICY "Users can view own transactions" ON currency_transactions
      FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "System can insert transactions" ON currency_transactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
-- User Currency Indexes
  CREATE INDEX idx_user_currency_user_id ON user_currency(user_id);

  -- User Inventory Indexes  
  CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
  CREATE INDEX idx_user_inventory_item_id ON user_inventory(item_id);
  CREATE INDEX idx_user_inventory_user_item ON user_inventory(user_id, item_id);
  -- Composite for lookups

  -- Currency Transactions Indexes (already has one, but missing user_id)
  CREATE INDEX idx_currency_transactions_user_id ON
  currency_transactions(user_id);
  CREATE INDEX idx_currency_transactions_user_created ON currency_transactions(user_id, created_at DESC);
  CREATE INDEX idx_currency_transactions_source ON currency_transactions(source);
  -- For analytics

  -- Shop Items Indexes
  CREATE INDEX idx_shop_items_type_active ON shop_items(item_type, active); -- For filtered queries
  CREATE INDEX idx_shop_items_active_sort ON shop_items(active, sort_order) WHERE
  active = true; -- For shop display

  -- Boost Items Index
  CREATE INDEX idx_boost_items_item_id ON boost_items(item_id);

  -- Apply triggers to tables with updated_at columns
  CREATE TRIGGER update_user_currency_updated_at
      BEFORE UPDATE ON user_currency
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_shop_items_updated_at
      BEFORE UPDATE ON shop_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Initial Shop Items Data
-- =============================================
INSERT INTO shop_items (id, name, description, item_type, price_gems, max_inventory, icon_emoji, sort_order) VALUES
('xp_boost_15m', '15-Minute XP Boost', 'Double XP for 15 minutes of learning', 'boost', 150, 5, '⚡', 1),
('xp_boost_30m', '30-Minute XP Boost', 'Double XP for 30 minutes of learning', 'boost', 250, 5, '🔥', 2);

INSERT INTO boost_items (item_id, multiplier, duration_minutes) VALUES ('xp_boost_15m', 2.00, 15), ('xp_boost_30m', 2.00, 30);

-- =============================================
-- Database Functions
-- =============================================

-- Function to award gems from XP earning
CREATE OR REPLACE FUNCTION award_gems_from_xp(
    p_user_id UUID,
    p_xp_amount INTEGER,
    p_source TEXT DEFAULT 'lesson_xp',
    p_source_detail JSONB DEFAULT '{}'::jsonb
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gems_earned INTEGER;
    v_new_balance INTEGER;
    v_result JSON;
BEGIN
    -- Calculate gems: 1 XP = 2 gems
    v_gems_earned := p_xp_amount * 2;
    
    -- Insert or update user currency balance
    INSERT INTO user_currency (user_id, gems, total_gems_earned)
    VALUES (p_user_id, v_gems_earned, v_gems_earned)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        gems = user_currency.gems + v_gems_earned,
        total_gems_earned = user_currency.total_gems_earned + v_gems_earned,
        updated_at = NOW();
    
    -- Get new balance
    SELECT gems INTO v_new_balance
    FROM user_currency 
    WHERE user_id = p_user_id;
    
    -- Log the transaction
    INSERT INTO currency_transactions (
        user_id, transaction_type, gems_amount, balance_after, 
        source, source_detail
    ) VALUES (
        p_user_id, 'earn', v_gems_earned, v_new_balance,
        p_source, p_source_detail
    );
    
    -- Return result
    v_result := json_build_object(
        'success', true,
        'gems_earned', v_gems_earned,
        'new_balance', v_new_balance
    );
    
    RETURN v_result;
END;
$$;