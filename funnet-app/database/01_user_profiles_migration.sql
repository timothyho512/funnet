-- This migration adds the core user_profiles table for the gamification system
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    total_xp_earned INTEGER DEFAULT 0 CHECK (total_xp_earned >= 0),
    lessons_completed INTEGER DEFAULT 0 CHECK (lessons_completed >= 0),
    nodes_completed INTEGER DEFAULT 0 CHECK (nodes_completed >= 0),
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON user_profiles(current_xp DESC);


ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_profile_self" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "update_profile_self" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "insert_profile_self" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
--
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- When this migration is complete, you should have:
-- ✅ user_profiles table with all required columns and constraints
-- ✅ Row Level Security enabled with proper policies
-- ✅ Performance indexes for common queries
-- ✅ Automatic updated_at timestamp management
-- ✅ Data integrity checks preventing invalid values
--
-- Next steps after this migration:
-- 1. Create Server Action to get/create user profiles
-- 2. Create XP transaction system for audit trail
-- 3. Build achievement framework
-- 4. Add user profile UI components