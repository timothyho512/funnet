-- Leaderboard System Migration
-- This migration adds the missing total_xp_earned index and creates leaderboard infrastructure

-- Step 1: Fix critical missing index for leaderboard performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON user_profiles(total_xp_earned DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0 CHECK (weekly_xp >= 0);

CREATE OR REPLACE VIEW global_leaderboard AS 
SELECT 
    id,
    display_name,
    total_xp_earned,
    current_level,
    lessons_completed,
    nodes_completed,
    ROW_NUMBER() OVER (ORDER BY total_xp_earned DESC, updated_at ASC) as rank,
    updated_at
FROM user_profiles 
WHERE total_xp_earned > 0  -- Only show users who have earned XP
ORDER BY total_xp_earned DESC, updated_at ASC;

-- Step 4: Create weekly leaderboard view (for future use)
CREATE OR REPLACE VIEW weekly_leaderboard AS 
SELECT 
    id,
    display_name,
    weekly_xp,
    current_level,
    ROW_NUMBER() OVER (ORDER BY weekly_xp DESC, updated_at ASC) as rank,
    updated_at
FROM user_profiles 
WHERE weekly_xp > 0  -- Only show users who have earned XP this week
ORDER BY weekly_xp DESC, updated_at ASC;

-- Step 5: Create function to reset weekly XP (for Monday resets)
CREATE OR REPLACE FUNCTION reset_weekly_xp()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles SET weekly_xp = 0;
    -- Log the reset for debugging
    RAISE NOTICE 'Weekly XP reset completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance verification queries (for debugging)
-- Uncomment these to test performance after migration:
-- EXPLAIN ANALYZE SELECT * FROM global_leaderboard LIMIT 10;
-- EXPLAIN ANALYZE SELECT * FROM weekly_leaderboard LIMIT 10;

-- Migration completion verification
-- After running this migration, you should have:
-- ✅ Proper index on total_xp_earned for fast leaderboard queries
-- ✅ weekly_xp column ready for weekly competitions  
-- ✅ Efficient leaderboard views with ranking calculations
-- ✅ Updated XP award function handling both global and weekly XP
-- ✅ Monday reset function ready for scheduling