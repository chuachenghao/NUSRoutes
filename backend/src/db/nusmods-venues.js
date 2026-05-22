require('dotenv').config();
const pg = require("pg");
const { Pool } = pg;
const fetch = globalThis.fetch || require("node-fetch");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const VENUES_URL =
  "https://raw.githubusercontent.com/nusmodifications/nusmods/refs/heads/master/website/api/optimiser/_constants/venues.json";

function getBuildingCode(venueCode) {
  return venueCode.split("-")[0];
}

function buildGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

async function importNusmodsVenues() {
  const response = await fetch(VENUES_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch NUSMods venues: ${response.status}`);
  }

  const venues = await response.json();

  let insertedOrUpdated = 0;
  let skipped = 0;

  for (const [venueCode, venueData] of Object.entries(venues)) {
    const longitude = venueData?.location?.x;
    const latitude = venueData?.location?.y;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      skipped++;
      continue;
    }

    const roomName = venueData.roomName ?? venueCode;
    const floor = Number.isInteger(venueData.floor) ? venueData.floor : null;
    const buildingCode = getBuildingCode(venueCode);
    const googleMapsUrl = buildGoogleMapsUrl(latitude, longitude);

    const name = `${venueCode} - ${roomName}`;

    await pool.query(
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
      VALUES ($1, $2, 'venue', $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (venue_code)
      DO UPDATE SET
        name = EXCLUDED.name,
        building_code = EXCLUDED.building_code,
        room_name = EXCLUDED.room_name,
        floor = EXCLUDED.floor,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        google_maps_url = EXCLUDED.google_maps_url,
        description = EXCLUDED.description
      `,
      [
        venueCode,
        name,
        buildingCode,
        roomName,
        floor,
        latitude,
        longitude,
        googleMapsUrl,
        `NUSMods venue: ${roomName}`,
      ]
    );

    insertedOrUpdated++;
  }

  console.log(`Imported or updated ${insertedOrUpdated} venues.`);
  console.log(`Skipped ${skipped} venues without usable coordinate data.`);

  await pool.end();
}

importNusmodsVenues().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});