-- =============================================
-- Atomic Purchase Function for Virtual Economy
-- =============================================

-- Function to process item purchases atomically
CREATE OR REPLACE FUNCTION process_item_purchase(
    p_user_id UUID,
    p_item_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_price_gems INTEGER;
    v_max_inventory INTEGER;
    v_current_quantity INTEGER;
    v_new_balance INTEGER;
    v_result JSON;
    v_rows_affected INTEGER;
BEGIN
    -- Get the REAL price from database AND Check inventory limits
    SELECT price_gems, max_inventory
    INTO v_price_gems, v_max_inventory
    FROM shop_items
    WHERE id = p_item_id AND active = true;
    -- If item doesn't exist or is inactive
    IF NOT FOUND THEN
        v_result := json_build_object(
            'success', false,
            'error', 'Item not found or inactive'
        );
        RETURN v_result;
    END IF;

    
 UPDATE user_currency
  SET
      gems = gems - v_price_gems,
      total_gems_spent = total_gems_spent + v_price_gems
  WHERE user_id = p_user_id
    AND gems >= v_price_gems;  -- ✅ Atomic constraint check

  -- Check if the update actually happened
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected = 0 THEN
      v_result := json_build_object(
          'success', false,
          'error', 'Insufficient gems'
      );
      RETURN v_result;
  END IF;

  -- Get the new balance for logging
  SELECT gems INTO v_new_balance
  FROM user_currency
  WHERE user_id = p_user_id;
    
    -- Step 4: Add item to inventory (upsert)
    INSERT INTO user_inventory (user_id, item_id, quantity, last_acquired_at)
    VALUES (p_user_id, p_item_id, 1, NOW())
    ON CONFLICT (user_id, item_id)
    DO UPDATE SET 
        quantity = user_inventory.quantity + 1,
        last_acquired_at = NOW()
    WHERE
        -- Only update if within inventory limit
        v_max_inventory IS NULL
        OR user_inventory.quantity < v_max_inventory;

      -- Check if any rows were actually affected
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

    IF v_rows_affected = 0 THEN
        RAISE EXCEPTION 'Inventory limit reached';
        
    END IF;
    
    -- Step 5: Log the transaction
    INSERT INTO currency_transactions (
        user_id, 
        transaction_type, 
        gems_amount, 
        balance_after, 
        source, 
        source_detail,
        item_id
    ) VALUES (
        p_user_id, 
        'spend', 
        v_price_gems, 
        v_new_balance,
        'purchase',
        json_build_object('item_id', p_item_id),
        p_item_id
    );
    
    -- Return success result
    v_result := json_build_object(
        'success', true,
        'gems_spent', v_price_gems,
        'new_balance', v_new_balance,
        'item_id', p_item_id
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback happens automatically on exception
        v_result := json_build_object(
            'success', false,
            'error', 'Purchase failed: ' || SQLERRM
        );
        RETURN v_result;
END;
$$;