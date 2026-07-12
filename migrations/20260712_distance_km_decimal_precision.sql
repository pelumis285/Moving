ALTER TABLE bookings
ALTER COLUMN distance_km TYPE double precision
USING distance_km::double precision;
