-- =============================================
-- Atomic Lesson Completion with XP + Gems
-- =============================================

-- Combined function that awards both XP and gems atomically
-- If either fails, the entire transaction rolls back
CREATE OR REPLACE FUNCTION complete_lesson_with_rewards(
    p_user_id UUID,
    p_lesson_id TEXT,
    p_xp_amount INTEGER DEFAULT 10
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp INTEGER;
    v_current_level INTEGER;
    v_total_xp_earned INTEGER;
    v_lessons_completed INTEGER;
    v_xp_for_next_level INTEGER;
    v_leveled_up BOOLEAN := FALSE;
    v_new_level INTEGER;
    v_gems_earned INTEGER;
    v_new_gem_balance INTEGER;
    v_result JSON;
BEGIN
    IF auth.uid() IS NULL THEN
    -- or RAISE EXCEPTION 'Not authenticated';
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    IF p_user_id IS DISTINCT FROM auth.uid() THEN
    -- or RAISE EXCEPTION 'Forbidden';
    RETURN json_build_object('success', false, 'error', 'Access denied: cannot modify other users data');
    END IF;

     IF p_xp_amount <= 0 THEN
      RETURN json_build_object(
          'success', false,
          'error', 'XP amount must be positive'
      );
    END IF;
    -- Step 1: Get current user profile (with row lock to prevent race conditions)
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

    -- Step 2: Calculate new XP values
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

    -- Step 3: Update user profile with new XP values
    UPDATE user_profiles SET
        current_xp = v_current_xp,
        current_level = v_new_level,
        total_xp_earned = v_total_xp_earned,
        lessons_completed = v_lessons_completed,
        weekly_xp = weekly_xp + p_xp_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Step 4: Award gems (1 XP = 2 gems)
    v_gems_earned := p_xp_amount * 2;
    
    -- Insert or update user currency balance
    INSERT INTO user_currency (user_id, gems, total_gems_earned, total_gems_spent)
    VALUES (p_user_id, v_gems_earned, v_gems_earned, 0)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        gems = user_currency.gems + v_gems_earned,
        total_gems_earned = user_currency.total_gems_earned + v_gems_earned,
        updated_at = NOW();
    
    -- Get new gem balance
    SELECT gems INTO v_new_gem_balance
    FROM user_currency 
    WHERE user_id = p_user_id;
    
    -- Step 5: Log the gem transaction
    INSERT INTO currency_transactions (
        user_id, transaction_type, gems_amount, balance_after, 
        source, source_detail
    ) VALUES (
        p_user_id, 'earn', v_gems_earned, v_new_gem_balance,
        'lesson_xp', json_build_object('lesson_id', p_lesson_id, 'xp_earned', p_xp_amount)
    );

    -- Step 6: Return comprehensive success result
    v_result := json_build_object(
        'success', true,
        'xp_awarded', p_xp_amount,
        'leveled_up', v_leveled_up,
        'old_level', v_current_level,
        'new_level', v_new_level,
        'current_xp', v_current_xp,
        'xp_for_next_level', v_new_level * 50,
        'gems_earned', v_gems_earned,
        'new_gem_balance', v_new_gem_balance,
        'lesson_id', p_lesson_id
    );
    
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- Handle any errors - automatic rollback
    RETURN json_build_object(
        'success', false,
        'error', 'Failed to complete lesson: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_lesson_with_rewards(UUID, TEXT, INTEGER) TO authenticated;