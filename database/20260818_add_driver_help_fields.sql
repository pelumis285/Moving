ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_type varchar(40) NOT NULL DEFAULT 'moving';

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS driver_vehicle_type varchar(40);

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS driver_request_notes text;
