const pool = require("../db/pool");

async function getAllPlaces() {
  const result = await pool.query(`
    SELECT
      id,
      venue_code,
      name,
      type,
      building_code,
      room_name,
      floor,
      latitude,
      longitude,
      google_maps_url,
      description
    FROM places
    ORDER BY venue_code ASC
  `);

  return result.rows;
}

async function getPlaceById(id) {
    const result = await pool.query(
        `
        SELECT
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        FROM places
        WHERE id = $1
        `, 
        [id]
    );

    return result.rows[0];
}

async function getPlacesByVenueCode(venueCode) {
    const result = await pool.query(
        `
        SELECT
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        FROM places
        WHERE venue_code = $1
        `,
        [venueCode]
    );

    return result.rows;
}

async function searchPlaces(query) {
    const result = await pool.query(
        `
        SELECT
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        FROM places
        WHERE LOWER(venue_code) LIKE LOWER($1)
        OR LOWER(name) LIKE LOWER($1)
        OR LOWER(room_name) LIKE LOWER($1)
        OR LOWER(building_code) LIKE LOWER($1)
        `,
        [`%${query}%`]
    )

    return result.rows;
}

async function getPlacesByBuilding(buildingCode) {
    const result = await pool.query(
        `
        SELECT
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        FROM places
        WHERE building_code = $1
        `,
        [buildingCode]
    );

    return result.rows;
}


/*
6371 - Earth radius in km
distance_km - Approximate distance from the input coordinate to the place.
*/
async function getNearbyPlaces(latitude, longitude) {
    const result = await pool.query(
        `
        SELECT
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description,

        6371 * acos(
            LEAST(
                1,
                GREATEST(
                    -1,
                    cos(radians($1)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) *
                    sin(radians(latitude))
                    )
                )
            ) AS distance_km

        FROM places
        ORDER BY distance_km ASC
        LIMIT 10
        `,
        [latitude, longitude]
    );

    return result.rows;
}

async function createPlace(placeData) {
    const {
        venue_code,
        name,
        type = "venue",
        building_code = null,
        room_name = null,
        floor = null,
        latitude,
        longitude,
        google_maps_url = null,
        description = null,
    } = placeData;

    const result = await pool.query(
        `
        INSERT INTO places (
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        `,
        [
            venue_code,
            name,
            type,
            building_code,
            room_name,
            floor,
            latitude,
            longitude,
            google_maps_url,
            description,
        ]
    );

    return result.rows[0];
}

async function deletePlace(id) {
    const result = await pool.query(
        `
        DELETE FROM places
        WHERE id = $1
        RETURNING
        id,
        venue_code,
        name,
        type,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description
        `,
        [id]
    );

    return result.rows[0];
}

module.exports = {
  getAllPlaces,
  getPlaceById,
  getPlacesByVenueCode,
  searchPlaces,
  getPlacesByBuilding,
  getNearbyPlaces,
  createPlace,
  deletePlace,
};