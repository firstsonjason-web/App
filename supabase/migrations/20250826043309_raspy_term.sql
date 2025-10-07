/*
  # Add privacy setting to user profiles

  1. Changes
    - Add privacy_setting column to user_profiles table
    - Set default value to 'public'
    - Add check constraint for valid privacy values

  2. Security
    - Users can only update their own privacy settings
    - Privacy setting affects visibility in community features
*/

-- Add privacy_setting column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN privacy_setting text DEFAULT 'public';

-- Add constraint to ensure only valid privacy values
ALTER TABLE user_profiles 
ADD CONSTRAINT privacy_setting_check 
CHECK (privacy_setting IN ('public', 'private'));

-- Update the updated_at trigger to include privacy_setting changes
-- (The trigger already exists, so this will work automatically)

-- Add index for privacy queries (optional, for performance)
CREATE INDEX idx_user_profiles_privacy ON user_profiles(privacy_setting);