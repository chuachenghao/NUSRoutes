INSERT INTO places (
    name,
    type,
    latitude,
    longitude,
    description,
    keywords
)
VALUES
(
    'COM1',
    'building',
    1.2948,
    103.7738,
    'School of Computing building',
    ARRAY['computing', 'soc', 'computer science']
),
(
    'Central Library',
    'library',
    1.2966,
    103.7729,
    'Main NUS library',
    ARRAY['library', 'study', 'clb']
),
(
    'The Deck',
    'canteen',
    1.2943,
    103.7725,
    'Canteen near Faculty of Arts and Social Sciences',
    ARRAY['food', 'canteen', 'fass']
),
(
    'Kent Ridge MRT',
    'mrt',
    1.2935,
    103.7846,
    'Nearest MRT station to NUS',
    ARRAY['train', 'mrt', 'station']
);