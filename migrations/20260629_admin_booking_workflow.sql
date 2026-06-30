ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS final_cost numeric(10, 2),
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS reschedule_token varchar(80),
ADD COLUMN IF NOT EXISTS reschedule_token_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS last_rescheduled_at timestamptz;
