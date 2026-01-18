# Supabase Database Setup Instructions

## Steps to Set Up Database in Supabase

### 1. Create a Supabase Project
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or use an existing one

### 2. Get Your Database URL
   - Go to **Settings** → **Database**
   - Find **Connection String** → **URI**
   - Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

### 3. Set Environment Variable
   - Create a `.env` file in the `expense-predictor-backend` directory (if not already exists)
   - Add your database URL:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   - Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual values

### 4. Run the SQL Schema
   - Go to **SQL Editor** in your Supabase dashboard
   - Open the file `supabase_schema.sql` from this directory
   - Copy and paste the entire SQL into the editor
   - Click **Run** to execute

### 5. Verify the Table Was Created
   - Go to **Table Editor** in Supabase dashboard
   - You should see the `expenses` table with the following columns:
     - `id` (uuid, primary key)
     - `user_id` (uuid)
     - `date` (date)
     - `amount` (decimal)
     - `description` (text)
     - `category` (varchar)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

### 6. Test the Connection
   - Make sure your backend server is running
   - Test the API endpoint with a valid user_id

## Notes

- **Row Level Security (RLS)**: The schema includes RLS policies that assume you're using Supabase Auth. If you're using a different authentication method, you may need to adjust or disable these policies.

- **For Testing**: You can temporarily disable RLS by running:
  ```sql
  ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
  ```

- **Indexes**: The schema includes indexes on `user_id`, `date`, and a composite index for optimal query performance.
