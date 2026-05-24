const pool = require("./pool");
const fetch = globalThis.fetch || require("node-fetch");

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
        category,
        building_code,
        room_name,
        floor,
        latitude,
        longitude,
        google_maps_url,
        description,
        keywords,
        source
      )
      VALUES ($1, $2, 'venue', 'nusmods_venue', $3, $4, $5, $6, $7, $8, $9, $10, 'nusmods')
      ON CONFLICT (venue_code)
      DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        building_code = EXCLUDED.building_code,
        room_name = EXCLUDED.room_name,
        floor = EXCLUDED.floor,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        google_maps_url = EXCLUDED.google_maps_url,
        description = EXCLUDED.description,
        keywords = EXCLUDED.keywords,
        source = EXCLUDED.source
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
        [venueCode, roomName, buildingCode].filter(Boolean)
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