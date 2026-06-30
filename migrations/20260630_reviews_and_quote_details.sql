ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS fragile_items integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS heavy_items integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stair_flights integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS elevator_access boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS packing_help boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS assembly_help boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS long_carry varchar(20) NOT NULL DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS target_budget numeric(10, 2),
ADD COLUMN IF NOT EXISTS negotiation_notes text;

CREATE TABLE IF NOT EXISTS reviews (
  id serial PRIMARY KEY,
  full_name varchar(160) NOT NULL,
  email varchar(200) NOT NULL,
  location varchar(160),
  rating integer NOT NULL,
  review text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  admin_notes text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
