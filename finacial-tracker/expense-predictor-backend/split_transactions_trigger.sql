-- ============================================
-- Split Transactions into Expenses and Income Tables
-- This script creates separate tables and a trigger to automatically split transactions
-- ============================================

-- ============================================
-- Table 4: EXPENSES
-- ============================================
-- Stores expense transactions separately
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_transaction_id ON expenses(transaction_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses"
    ON expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
    ON expenses FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Table 5: INCOME
-- ============================================
-- Stores income transactions separately
CREATE TABLE IF NOT EXISTS income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_income_transaction_id ON income(transaction_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date);
CREATE INDEX IF NOT EXISTS idx_income_category ON income(category);

-- Enable Row Level Security (RLS)
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income
CREATE POLICY "Users can view their own income"
    ON income FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income"
    ON income FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income"
    ON income FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income"
    ON income FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Function to split transactions into expenses/income
-- ============================================
CREATE OR REPLACE FUNCTION split_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- If transaction type is 'expense', insert into expenses table
    IF NEW.type = 'expense' THEN
        INSERT INTO expenses (
            transaction_id,
            user_id,
            date,
            amount,
            description,
            category,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.date,
            NEW.amount,
            NEW.description,
            NEW.category,
            NEW.created_at,
            NEW.updated_at
        );
    
    -- If transaction type is 'income', insert into income table
    ELSIF NEW.type = 'income' THEN
        INSERT INTO income (
            transaction_id,
            user_id,
            date,
            amount,
            description,
            category,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.date,
            NEW.amount,
            NEW.description,
            NEW.category,
            NEW.created_at,
            NEW.updated_at
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to handle transaction updates
-- ============================================
CREATE OR REPLACE FUNCTION update_split_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- If transaction type changed from expense to income
    IF OLD.type = 'expense' AND NEW.type = 'income' THEN
        -- Delete from expenses
        DELETE FROM expenses WHERE transaction_id = NEW.id;
        -- Insert into income
        INSERT INTO income (
            transaction_id,
            user_id,
            date,
            amount,
            description,
            category,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.date,
            NEW.amount,
            NEW.description,
            NEW.category,
            NEW.created_at,
            NEW.updated_at
        );
    
    -- If transaction type changed from income to expense
    ELSIF OLD.type = 'income' AND NEW.type = 'expense' THEN
        -- Delete from income
        DELETE FROM income WHERE transaction_id = NEW.id;
        -- Insert into expenses
        INSERT INTO expenses (
            transaction_id,
            user_id,
            date,
            amount,
            description,
            category,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.date,
            NEW.amount,
            NEW.description,
            NEW.category,
            NEW.created_at,
            NEW.updated_at
        );
    
    -- If type didn't change, just update the corresponding table
    ELSIF NEW.type = 'expense' THEN
        UPDATE expenses SET
            user_id = NEW.user_id,
            date = NEW.date,
            amount = NEW.amount,
            description = NEW.description,
            category = NEW.category,
            updated_at = NOW()
        WHERE transaction_id = NEW.id;
    
    ELSIF NEW.type = 'income' THEN
        UPDATE income SET
            user_id = NEW.user_id,
            date = NEW.date,
            amount = NEW.amount,
            description = NEW.description,
            category = NEW.category,
            updated_at = NOW()
        WHERE transaction_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to handle transaction deletes
-- ============================================
CREATE OR REPLACE FUNCTION delete_split_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete from expenses if it was an expense
    IF OLD.type = 'expense' THEN
        DELETE FROM expenses WHERE transaction_id = OLD.id;
    -- Delete from income if it was income
    ELSIF OLD.type = 'income' THEN
        DELETE FROM income WHERE transaction_id = OLD.id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create triggers
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS split_transaction_on_insert ON transactions;
DROP TRIGGER IF EXISTS split_transaction_on_update ON transactions;
DROP TRIGGER IF EXISTS split_transaction_on_delete ON transactions;

-- Trigger to split transaction on INSERT
CREATE TRIGGER split_transaction_on_insert
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION split_transaction();

-- Trigger to update split tables on UPDATE
CREATE TRIGGER split_transaction_on_update
    AFTER UPDATE ON transactions
    FOR EACH ROW
    WHEN (OLD.type IS DISTINCT FROM NEW.type OR 
          OLD.amount IS DISTINCT FROM NEW.amount OR
          OLD.date IS DISTINCT FROM NEW.date OR
          OLD.description IS DISTINCT FROM NEW.description OR
          OLD.category IS DISTINCT FROM NEW.category)
    EXECUTE FUNCTION update_split_transaction();

-- Trigger to delete from split tables on DELETE
-- Note: CASCADE will handle this, but this ensures cleanup
CREATE TRIGGER split_transaction_on_delete
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION delete_split_transaction();
