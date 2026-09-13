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

CREATE INDEX IF NOT EXISTS driver_profiles_status_idx ON driver_profiles (status);
CREATE INDEX IF NOT EXISTS driver_profiles_created_at_idx ON driver_profiles (created_at DESC);
