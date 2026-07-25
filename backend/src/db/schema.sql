CREATE TABLE IF NOT EXISTS places (
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

CREATE INDEX IF NOT EXISTS places_name_lower_idx
ON places ((LOWER(name)));

CREATE INDEX IF NOT EXISTS places_venue_code_lower_idx
ON places ((LOWER(venue_code)));

CREATE INDEX IF NOT EXISTS places_building_code_idx
ON places (building_code);

CREATE INDEX IF NOT EXISTS places_type_idx
ON places (type);

CREATE INDEX IF NOT EXISTS places_category_idx
ON places (category);

CREATE INDEX IF NOT EXISTS places_source_idx
ON places (source);


CREATE TABLE IF NOT EXISTS osm_nodes (
    osm_id BIGINT PRIMARY KEY,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS route_edges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    from_node_id BIGINT NOT NULL REFERENCES osm_nodes(osm_id),
    to_node_id BIGINT NOT NULL REFERENCES osm_nodes(osm_id),

    distance_m DOUBLE PRECISION NOT NULL,

    source TEXT NOT NULL DEFAULT 'osm',

    -- OSM way metadata.
    way_id BIGINT,
    highway TEXT,
    is_sheltered BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT route_edges_distance_check
        CHECK (distance_m >= 0)
);

ALTER TABLE route_edges
ADD COLUMN IF NOT EXISTS is_sheltered BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_route_edges_from_node
ON route_edges(from_node_id);

CREATE INDEX IF NOT EXISTS idx_route_edges_to_node
ON route_edges(to_node_id);

CREATE INDEX IF NOT EXISTS idx_route_edges_way_id
ON route_edges(way_id);

CREATE INDEX IF NOT EXISTS idx_route_edges_highway
ON route_edges(highway);

CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'info',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT announcements_type_check
        CHECK (type IN ('info', 'warning', 'closure', 'disruption'))
);

-- Community reports: user-generated live campus conditions.
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'obstruction',
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    reporter_id TEXT,
    reporter_name TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT reports_type_check
        CHECK (type IN ('obstruction', 'closure', 'crowded', 'hazard', 'other')),
    CONSTRAINT reports_status_check
        CHECK (status IN ('active', 'resolved')),
    CONSTRAINT reports_latitude_check
        CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT reports_longitude_check
        CHECK (longitude BETWEEN -180 AND 180)
);

-- Per-user votes on reports (upvote = still happening, irrelevant = no longer relevant).
CREATE TABLE IF NOT EXISTS report_votes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    voter_id TEXT NOT NULL,
    vote_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT report_votes_type_check
        CHECK (vote_type IN ('upvote', 'irrelevant')),
    CONSTRAINT report_votes_unique
        UNIQUE (report_id, voter_id, vote_type)
);

CREATE INDEX IF NOT EXISTS reports_status_idx
ON reports (status);

CREATE INDEX IF NOT EXISTS report_votes_report_idx
ON report_votes (report_id);

CREATE TABLE IF NOT EXISTS route_search_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    start_place_id BIGINT REFERENCES places(id) ON DELETE SET NULL,
    end_place_id BIGINT REFERENCES places(id) ON DELETE SET NULL,
    start_name TEXT NOT NULL,
    end_name TEXT NOT NULL,
    route_mode TEXT NOT NULL DEFAULT 'fastest',
    distance_m DOUBLE PRECISION,
    sheltered_ratio INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT route_search_events_mode_check
        CHECK (route_mode IN ('fastest', 'sheltered'))
);

CREATE INDEX IF NOT EXISTS route_search_events_created_at_idx
ON route_search_events (created_at);

CREATE INDEX IF NOT EXISTS route_search_events_end_place_idx
ON route_search_events (end_place_id);
