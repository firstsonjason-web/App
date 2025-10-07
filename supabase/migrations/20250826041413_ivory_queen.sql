/*
  # Create comprehensive user system for Stay Healthy Be Happy app

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `addiction_level` (text: low/moderate/high)
      - `total_score` (integer)
      - `answers` (jsonb - stores all question answers)
      - `completed_at` (timestamp)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `plan_type` (text: free/pro/promax)
      - `payment_method` (text: alipay/fps/wechat/bank)
      - `amount` (decimal)
      - `currency` (text, default 'USD')
      - `status` (text: active/cancelled/expired)
      - `started_at` (timestamp)
      - `expires_at` (timestamp)
    
    - `daily_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `title` (text)
      - `description` (text)
      - `difficulty` (text: easy/medium/hard)
      - `points` (integer)
      - `category` (text)
      - `completed` (boolean, default false)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `goal_date` (date)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `date` (date)
      - `total_points` (integer, default 0)
      - `goals_completed` (integer, default 0)
      - `goals_total` (integer, default 0)
      - `screen_time_hours` (decimal)
      - `focus_time_hours` (decimal)
      - `streak_days` (integer, default 0)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Secure user data access patterns

  3. Indexes
    - Add performance indexes for common queries
    - User-based data retrieval optimization
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  level text DEFAULT 'Digital Beginner',
  streak_days integer DEFAULT 0,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  addiction_level text NOT NULL CHECK (addiction_level IN ('low', 'moderate', 'high')),
  total_score integer NOT NULL,
  max_score integer DEFAULT 40,
  answers jsonb NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'pro', 'promax')),
  payment_method text CHECK (payment_method IN ('alipay', 'fps', 'wechat', 'bank')),
  amount decimal(10,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points integer NOT NULL,
  category text DEFAULT 'custom',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  goal_date date DEFAULT CURRENT_DATE
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  total_points integer DEFAULT 0,
  goals_completed integer DEFAULT 0,
  goals_total integer DEFAULT 0,
  screen_time_hours decimal(4,2) DEFAULT 0,
  focus_time_hours decimal(4,2) DEFAULT 0,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Create RLS Policies for user_assessments
CREATE POLICY "Users can read own assessments"
  ON user_assessments
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can insert own assessments"
  ON user_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can update own assessments"
  ON user_assessments
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

-- Create RLS Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

-- Create RLS Policies for daily_goals
CREATE POLICY "Users can manage own goals"
  ON daily_goals
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text))
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

-- Create RLS Policies for user_progress
CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text))
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth.uid()::text = id::text));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(goal_date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_completed ON daily_goals(completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();