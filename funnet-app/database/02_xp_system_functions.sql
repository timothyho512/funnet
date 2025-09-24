-- Function to award XP and handle both level-ups and node completion atomically
-- This prevents race conditions and ensures data consistency
CREATE OR REPLACE FUNCTION award_lesson_xp(
  p_user_id UUID,
  p_xp_amount INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_total_xp_earned INTEGER;
  v_lessons_completed INTEGER;
  v_nodes_completed INTEGER;
  v_xp_for_next_level INTEGER;
  v_leveled_up BOOLEAN := FALSE;
  v_new_level INTEGER;
BEGIN
  -- Get current user profile (with row lock to prevent race conditions)
  SELECT current_xp, current_level, total_xp_earned, lessons_completed
  INTO v_current_xp, v_current_level, v_total_xp_earned, v_lessons_completed 
  FROM user_profiles 
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If user profile doesn't exist, return error
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;

  -- Calculate new XP values
  v_current_xp := v_current_xp + p_xp_amount;
  v_total_xp_earned := v_total_xp_earned + p_xp_amount;
  v_lessons_completed := v_lessons_completed + 1;
  v_new_level := v_current_level;

  -- Check for level-up (Duolingo-style: Level 1->2 = 50 XP, Level 2->3 = 100 XP, etc.)
  v_xp_for_next_level := v_current_level * 50;
  
  WHILE v_current_xp >= v_xp_for_next_level LOOP
    -- Level up!
    v_current_xp := v_current_xp - v_xp_for_next_level;
    v_new_level := v_new_level + 1;
    v_leveled_up := TRUE;
    
    -- Calculate XP needed for the next level
    v_xp_for_next_level := v_new_level * 50;
  END LOOP;

  -- Update user profile with new values
  UPDATE user_profiles SET
    current_xp = v_current_xp,
    current_level = v_new_level,
    total_xp_earned = v_total_xp_earned,
    lessons_completed = v_lessons_completed,
    weekly_xp = weekly_xp + p_xp_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return success with comprehensive information
  RETURN json_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'leveled_up', v_leveled_up,
    'old_level', v_current_level,
    'new_level', v_new_level,
    'current_xp', v_current_xp,
    'xp_for_next_level', v_new_level * 50
  );

EXCEPTION WHEN OTHERS THEN
  -- Handle any errors
  RETURN json_build_object(
    'success', false,
    'error', 'Failed to award XP: ' || SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION award_lesson_xp(UUID, INTEGER) TO authenticated;


CREATE OR REPLACE FUNCTION increment_nodes_completed(
    p_user_id UUID
  )
  RETURNS JSON AS $$
  BEGIN
    -- Atomically increment the nodes_completed counter
    UPDATE user_profiles
    SET
      nodes_completed = nodes_completed + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Check if user was found and updated
    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'User profile not found'
      );
    END IF;

    -- Return success
    RETURN json_build_object(
      'success', true,
      'message', 'Node completion count incremented'
    );

  EXCEPTION WHEN OTHERS THEN
    -- Handle any errors
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to increment node count: ' || SQLERRM
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Grant execute permission to authenticated users
  GRANT EXECUTE ON FUNCTION increment_nodes_completed(UUID) TO authenticated;

-- TESTING QUERIES (run after function creation to verify)
-- ============================================================================

-- Test the function with a user (replace with actual user ID)
-- SELECT award_lesson_xp('your-user-id-here'::uuid, 10);

-- Check if user leveled up after multiple lessons
-- SELECT award_lesson_xp('your-user-id-here'::uuid, 50);

-- ============================================================================
-- FUNCTION COMPLETION NOTES
-- ============================================================================

-- When this function is deployed, you can:
-- ✅ Award XP atomically without race conditions
-- ✅ Handle multiple level-ups in a single transaction
-- ✅ Get detailed level-up information for UI celebrations
-- ✅ Maintain data consistency across concurrent requests
--
-- Usage in Server Actions:
-- const result = await supabase.rpc('award_lesson_xp', { 
--   p_user_id: user.id, 
--   p_xp_amount: 10 
-- });