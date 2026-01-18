-- Supabase Database Schema for Financial Tracker
-- Run this SQL in your Supabase SQL Editor

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- Create index on date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Create index on user_id and date for optimized monthly aggregation queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only see their own expenses
-- Note: Adjust this based on your authentication setup
-- This assumes you're using Supabase Auth and the user_id matches auth.uid()
CREATE POLICY "Users can view their own expenses"
    ON expenses FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own expenses"
    ON expenses FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert sample data for testing (remove in production)
-- Uncomment and adjust user_id to match your test user
-- INSERT INTO expenses (user_id, date, amount, description, category) VALUES
-- ('11111111-1111-1111-1111-111111111111', '2024-12-01', 1500.00, 'Monthly Rent', 'Housing'),
-- ('11111111-1111-1111-1111-111111111111', '2024-12-05', 120.00, 'Electric Bill', 'Utilities'),
-- ('11111111-1111-1111-1111-111111111111', '2024-12-10', 145.00, 'Groceries', 'Groceries'),
-- ('11111111-1111-1111-1111-111111111111', '2025-01-01', 1500.00, 'Monthly Rent', 'Housing'),
-- ('11111111-1111-1111-1111-111111111111', '2025-01-05', 120.00, 'Electric Bill', 'Utilities'),
-- ('11111111-1111-1111-1111-111111111111', '2025-01-10', 145.00, 'Groceries', 'Groceries');
