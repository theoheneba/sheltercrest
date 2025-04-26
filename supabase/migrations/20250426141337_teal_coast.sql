-- Create function to get dashboard analytics
CREATE OR REPLACE FUNCTION get_dashboard_analytics(date_range text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamp;
  result json;
BEGIN
  -- Calculate start date based on range
  start_date := CASE date_range
    WHEN '7d' THEN NOW() - INTERVAL '7 days'
    WHEN '30d' THEN NOW() - INTERVAL '30 days'
    WHEN '90d' THEN NOW() - INTERVAL '90 days'
    ELSE NOW() - INTERVAL '30 days'
  END;

  WITH analytics AS (
    SELECT
      COUNT(*) FILTER (WHERE created_at >= start_date) as total_applications,
      COUNT(*) FILTER (WHERE status = 'approved' AND created_at >= start_date) as approved_applications,
      COUNT(*) FILTER (WHERE status = 'pending' AND created_at >= start_date) as pending_applications,
      AVG(monthly_rent) FILTER (WHERE created_at >= start_date) as avg_rent_amount,
      COUNT(DISTINCT user_id) FILTER (WHERE created_at >= start_date) as unique_users
    FROM applications
  )
  SELECT json_build_object(
    'applications', json_build_object(
      'total', total_applications,
      'approved', approved_applications,
      'pending', pending_applications
    ),
    'metrics', json_build_object(
      'avg_rent', avg_rent_amount,
      'unique_users', unique_users
    )
  ) INTO result
  FROM analytics;

  RETURN result;
END;
$$;

-- Create function to get payment analytics
CREATE OR REPLACE FUNCTION get_payment_analytics(date_range text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamp;
  result json;
BEGIN
  -- Calculate start date based on range
  start_date := CASE date_range
    WHEN '7d' THEN NOW() - INTERVAL '7 days'
    WHEN '30d' THEN NOW() - INTERVAL '30 days'
    WHEN '90d' THEN NOW() - INTERVAL '90 days'
    ELSE NOW() - INTERVAL '30 days'
  END;

  WITH payment_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE created_at >= start_date) as total_payments,
      COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= start_date) as completed_payments,
      COUNT(*) FILTER (WHERE status = 'failed' AND created_at >= start_date) as failed_payments,
      SUM(amount) FILTER (WHERE status = 'completed' AND created_at >= start_date) as total_amount,
      AVG(amount) FILTER (WHERE status = 'completed' AND created_at >= start_date) as avg_amount
    FROM payments
  )
  SELECT json_build_object(
    'payments', json_build_object(
      'total', total_payments,
      'completed', completed_payments,
      'failed', failed_payments
    ),
    'metrics', json_build_object(
      'total_amount', total_amount,
      'avg_amount', avg_amount
    )
  ) INTO result
  FROM payment_stats;

  RETURN result;
END;
$$;

-- Create support ticket tables if they don't exist
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_ticket_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT valid_ticket_priority CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on support tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for support tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Create policies for ticket replies
CREATE POLICY "Users can view ticket replies"
  ON ticket_replies
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = ticket_id
    AND (support_tickets.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ))
  ));

CREATE POLICY "Users can create ticket replies"
  ON ticket_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = ticket_id
    AND (support_tickets.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ))
  ));

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Enable RLS on system settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can modify system settings
CREATE POLICY "Only admins can modify system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_user ON ticket_replies(user_id);

-- Update triggers
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();