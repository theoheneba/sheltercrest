/*
  # Authentication and Profile Setup

  1. New Tables
    - `profiles` table for user profile information
      - Links to auth.users via id
      - Stores user details and preferences
      - Includes role-based access control

  2. Security
    - Enable RLS on profiles table
    - Add policies for user and admin access
    - Create trigger for automatic profile creation

  3. Changes
    - Add handle_new_user trigger function
    - Set up initial security policies
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  employment_status text,
  employer_name text,
  employment_start_date date,
  monthly_income numeric(10,2),
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create or update admin user
DO $$
BEGIN
  -- Try to create admin user if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000001',
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Admin","last_name":"User"}',
      now(),
      now(),
      ''
    );
  END IF;

  -- Try to create test user if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user@example.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000002',
      'authenticated',
      'authenticated',
      'user@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"John","last_name":"Doe"}',
      now(),
      now(),
      ''
    );
  END IF;
END $$;

-- Ensure profiles exist for both users
INSERT INTO profiles (id, email, first_name, last_name, role)
SELECT id, email, 
  COALESCE(raw_user_meta_data->>'first_name', 'Admin'),
  COALESCE(raw_user_meta_data->>'last_name', 'User'),
  CASE 
    WHEN email = 'admin@example.com' THEN 'admin'
    ELSE 'user'
  END
FROM auth.users
WHERE email IN ('admin@example.com', 'user@example.com')
ON CONFLICT (id) DO UPDATE
SET 
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;