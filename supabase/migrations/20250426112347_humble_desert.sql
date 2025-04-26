/*
  # Add salary validation and admin role

  1. Changes
    - Add check constraint for minimum salary after deductions
    - Add admin role column to profiles
    - Add validation functions
  
  2. Security
    - Update RLS policies for admin access
*/

-- Add function to calculate net salary (after SSNIT and taxes)
CREATE OR REPLACE FUNCTION calculate_net_salary(gross_salary numeric)
RETURNS numeric AS $$
BEGIN
  -- SSNIT is 5.5% of gross
  -- Assume average tax rate of 15% for simplification
  RETURN gross_salary * (1 - 0.055 - 0.15);
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for minimum salary
ALTER TABLE profiles
ADD CONSTRAINT check_minimum_salary
CHECK (
  monthly_income IS NULL OR 
  calculate_net_salary(monthly_income) >= 100
);

-- Add admin role column
ALTER TABLE profiles
ADD COLUMN role text NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Update RLS policies for admin access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for other tables
CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );