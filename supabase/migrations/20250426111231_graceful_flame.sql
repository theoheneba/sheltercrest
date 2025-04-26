/*
  # Initial Schema Setup for RentAssist

  1. New Tables
    - `profiles`
      - User profile information including employment and contact details
    - `applications`
      - Rent assistance applications with status tracking
    - `payments`
      - Payment records and history
    - `documents`
      - Document uploads and verification status
    - `payment_schedules`
      - Scheduled payments and due dates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-specific policies
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  employment_status text,
  employer_name text,
  employment_start_date date,
  monthly_income numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  monthly_rent numeric(10,2) NOT NULL,
  deposit_amount numeric(10,2) NOT NULL,
  interest_amount numeric(10,2) NOT NULL,
  total_initial_payment numeric(10,2) NOT NULL,
  landlord_name text NOT NULL,
  landlord_email text NOT NULL,
  landlord_phone text NOT NULL,
  property_address text NOT NULL,
  lease_start_date date NOT NULL,
  lease_end_date date NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  paid_date timestamptz,
  late_fee numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment schedules table
CREATE TABLE IF NOT EXISTS payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for applications
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Create policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for payment schedules
CREATE POLICY "Users can view own payment schedules"
  ON payment_schedules FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_application_id ON payment_schedules(application_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at
    BEFORE UPDATE ON payment_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();