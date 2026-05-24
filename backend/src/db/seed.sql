INSERT INTO places (
    venue_code,
    name,
    type,
    category,
    latitude,
    longitude,
    description,
    keywords,
    source
)
VALUES
(
    'MANUAL-COM1',
    'COM1',
    'building',
    'school',
    1.2948,
    103.7738,
    'School of Computing building',
    ARRAY['computing', 'soc', 'computer science'],
    'manual'
),
(
    'MANUAL-CENTRAL-LIBRARY',
    'Central Library',
    'library',
    'study',
    1.2966,
    103.7729,
    'Main NUS library',
    ARRAY['library', 'study', 'clb'],
    'manual'
),
(
    'MANUAL-THE-DECK',
    'The Deck',
    'canteen',
    'food',
    1.2943,
    103.7725,
    'Canteen near Faculty of Arts and Social Sciences',
    ARRAY['food', 'canteen', 'fass'],
    'manual'
),
(
    'MANUAL-KENT-RIDGE-MRT',
    'Kent Ridge MRT',
    'mrt',
    'transport',
    1.2935,
    103.7846,
    'Nearest MRT station to NUS',
    ARRAY['train', 'mrt', 'station'],
    'manual'
)
ON CONFLICT (venue_code)
DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    category = EXCLUDED.category,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    keywords = EXCLUDED.keywords,
    source = EXCLUDED.source;