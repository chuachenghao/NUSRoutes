CREATE TABLE places (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'venue',
    building_code TEXT,
    room_name TEXT,
    floor INTEGER,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    google_maps_url TEXT,
    description TEXT,

    CONSTRAINT places_type_check
        CHECK (type IN (
            'venue',
            'building',
            'bus_stop',
            'canteen',
            'library',
            'faculty',
            'mrt',
            'landmark',
            'other'
        )),

    CONSTRAINT places_latitude_check
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT places_longitude_check
        CHECK (longitude BETWEEN -180 AND 180)
);

CREATE INDEX places_name_lower_idx
ON places ((LOWER(name)));

CREATE INDEX places_venue_code_lower_idx
ON places ((LOWER(venue_code)));

CREATE INDEX places_building_code_idx
ON places (building_code);

CREATE TABLE osm_nodes (
  osm_id BIGINT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL
);

CREATE TABLE route_edges (
  id SERIAL PRIMARY KEY,
  from_node_id BIGINT NOT NULL REFERENCES osm_nodes(osm_id),
  to_node_id BIGINT NOT NULL REFERENCES osm_nodes(osm_id),
  distance_m DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL DEFAULT 'osm',
  way_id BIGINT,
  highway TEXT
);

CREATE INDEX idx_route_edges_from_node
ON route_edges(from_node_id);

CREATE INDEX idx_route_edges_to_node
ON route_edges(to_node_id);