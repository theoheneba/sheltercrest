/*
  # Add minimum salary requirement

  1. Changes
    - Add function to calculate net salary after SSNIT and taxes
    - Add check constraint for minimum salary of 100 GH₵ after deductions
    - Update existing salary check constraint

  2. Security
    - No changes to RLS policies
*/

-- Create or replace the net salary calculation function
CREATE OR REPLACE FUNCTION calculate_net_salary(gross_salary numeric)
RETURNS numeric AS $$
BEGIN
  -- SSNIT is 5.5% of gross
  -- Income tax estimated at 15% average rate
  RETURN gross_salary * (1 - 0.055 - 0.15);
END;
$$ LANGUAGE plpgsql;

-- Drop existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_minimum_salary;

-- Add new check constraint for minimum salary
ALTER TABLE profiles
ADD CONSTRAINT check_minimum_salary
CHECK (
  monthly_income IS NULL OR 
  calculate_net_salary(monthly_income) >= 100
);