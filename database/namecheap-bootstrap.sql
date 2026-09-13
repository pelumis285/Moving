CREATE TABLE IF NOT EXISTS bookings (
  id serial PRIMARY KEY,
  full_name varchar(160) NOT NULL,
  email varchar(200) NOT NULL,
  phone varchar(40) NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  service_type varchar(40) NOT NULL DEFAULT 'moving',
  load_size varchar(60) NOT NULL,
  driver_vehicle_type varchar(40),
  driver_request_notes text,
  move_date varchar(40) NOT NULL,
  distance_km double precision DEFAULT 0,
  fragile_items integer NOT NULL DEFAULT 0,
  heavy_items integer NOT NULL DEFAULT 0,
  stair_flights integer NOT NULL DEFAULT 0,
  elevator_access boolean NOT NULL DEFAULT false,
  packing_help boolean NOT NULL DEFAULT false,
  assembly_help boolean NOT NULL DEFAULT false,
  long_carry varchar(20) NOT NULL DEFAULT 'standard',
  building_type varchar(30) NOT NULL DEFAULT 'house-ground',
  carry_floor integer NOT NULL DEFAULT 0,
  estimated_cost numeric(10, 2) DEFAULT '0',
  final_cost numeric(10, 2),
  target_budget numeric(10, 2),
  negotiation_notes text,
  notes text,
  admin_notes text,
  status varchar(30) NOT NULL DEFAULT 'new',
  confirmed_at timestamptz,
  confirmation_email_sent_at timestamptz,
  reschedule_token varchar(80),
  reschedule_token_expires_at timestamptz,
  last_rescheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS contacts (
  id serial PRIMARY KEY,
  name varchar(160) NOT NULL,
  email varchar(200) NOT NULL,
  phone varchar(40),
  subject varchar(200),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_profiles (
  id serial PRIMARY KEY,
  full_name varchar(160) NOT NULL,
  email varchar(200) NOT NULL,
  phone varchar(40) NOT NULL,
  city varchar(160) NOT NULL,
  service_area varchar(200) NOT NULL,
  license_class varchar(80) NOT NULL,
  years_experience integer NOT NULL DEFAULT 0,
  price_per_km numeric(10, 2) NOT NULL,
  vehicle_types text NOT NULL,
  available_for_long_distance boolean NOT NULL DEFAULT false,
  weekend_availability boolean NOT NULL DEFAULT false,
  bio text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  admin_notes text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_move_date_idx ON bookings (move_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews (status);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS driver_profiles_status_idx ON driver_profiles (status);
CREATE INDEX IF NOT EXISTS driver_profiles_created_at_idx ON driver_profiles (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_reschedule_token_idx ON bookings (reschedule_token)
WHERE reschedule_token IS NOT NULL;

GRANT USAGE, CREATE ON SCHEMA public TO surftmove_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO surftmove_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO surftmove_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO surftmove_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO surftmove_app;
