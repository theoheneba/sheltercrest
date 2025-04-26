/*
  # Auth Setup Migration
  
  1. New Tables
    - Ensures profiles table exists with proper structure
    - Links profiles to auth.users
    
  2. Security
    - Enables RLS on profiles table
    - Sets up policies for user and admin access
    
  3. Automation
    - Creates trigger for automatic profile creation
    - Sets up test users if they don't exist
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
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
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'first_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'last_name')::text, ''),
    'user'
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

-- Create admin user if it doesn't exist
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      encode(sha256(random()::text::bytea), 'hex'),
      encode(sha256(random()::text::bytea), 'hex')
    )
    RETURNING id INTO admin_user_id;

    -- Insert into profiles only if not exists
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE email = 'admin@example.com'
    ) THEN
      INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role
      )
      VALUES (
        admin_user_id,
        'admin@example.com',
        'Admin',
        'User',
        'admin'
      );
    END IF;
  END IF;
END $$;

-- Create test user if it doesn't exist
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'user@example.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'user@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      encode(sha256(random()::text::bytea), 'hex'),
      encode(sha256(random()::text::bytea), 'hex')
    )
    RETURNING id INTO test_user_id;

    -- Insert into profiles only if not exists
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE email = 'user@example.com'
    ) THEN
      INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role
      )
      VALUES (
        test_user_id,
        'user@example.com',
        'John',
        'Doe',
        'user'
      );
    END IF;
  END IF;
END $$;