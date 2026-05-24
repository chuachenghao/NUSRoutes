CREATE TABLE places (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_code TEXT UNIQUE,

    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'other',
    category TEXT,

    building_code TEXT,
    room_name TEXT,
    floor INTEGER,

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    google_maps_url TEXT,
    description TEXT,
    keywords TEXT[] DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'manual',
    osm_id TEXT UNIQUE,
    osm_type TEXT,

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
            'food',
            'shop',
            'toilet',
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

CREATE INDEX places_type_idx
ON places (type);

CREATE INDEX places_category_idx
ON places (category);

CREATE INDEX places_source_idx
ON places (source);


CREATE TABLE osm_nodes (
    osm_id BIGINT PRIMARY KEY,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL
);

CREATE TABLE route_edges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    from_node_id BIGINT NOT NULL REFERENCES osm_nodes(osm_id),
    to_node_id BIGINT NOT NULL REFERENCES osm_nodes(osm_id),

    distance_m DOUBLE PRECISION NOT NULL,

    source TEXT NOT NULL DEFAULT 'osm',

    -- OSM way metadata.
    way_id BIGINT,
    highway TEXT,

    CONSTRAINT route_edges_distance_check
        CHECK (distance_m >= 0)
);

CREATE INDEX idx_route_edges_from_node
ON route_edges(from_node_id);

CREATE INDEX idx_route_edges_to_node
ON route_edges(to_node_id);

CREATE INDEX idx_route_edges_way_id
ON route_edges(way_id);

CREATE INDEX idx_route_edges_highway
ON route_edges(highway);