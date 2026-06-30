ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS building_type varchar(30) NOT NULL DEFAULT 'house-ground',
ADD COLUMN IF NOT EXISTS carry_floor integer NOT NULL DEFAULT 0;
