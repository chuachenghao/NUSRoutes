const express = require("express");
const router = express.Router();

const {
  getAllPlaces,
  getPlaceById,
  getPlacesByVenueCode,
  searchPlaces,
  getPlacesByBuilding,
  getNearbyPlaces,
  createPlace,
  deletePlace,
} = require("../services/places.service");

router.get("/", async (req, res) => {
  try {
    const places = await getAllPlaces();
    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const places = await searchPlaces(q);
    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search places" });
  }
});

router.get("/venue/:venueCode", async (req, res) => {
  try {
    const { venueCode } = req.params;

    const place = await getPlacesByVenueCode(venueCode);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.json(place);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch venue" });
  }
});

router.get("/building/:buildingCode", async (req, res) => {
  try {
    const { buildingCode } = req.params;

    const places = await getPlacesByBuilding(buildingCode);

    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch building places" });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ error: "Valid lat and lng are required" });
    }

    const places = await getNearbyPlaces(latitude, longitude);
    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch nearby places" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid place ID is required" });
    }

    const place = await getPlaceById(id);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.json(place);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch place" });
  }
});

router.post("/", async (req, res) => {
  try {
    const placeData = req.body;

    if (!placeData.venue_code || !placeData.name || !placeData.latitude || !placeData.longitude) {
      return res.status(400).json({ error: "Missing required place fields" });
    }

    const newPlace = await createPlace(placeData);

    res.status(201).json(newPlace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create place" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid place ID is required" });
    }

    const deletedPlace = await deletePlace(id);

    if (!deletedPlace) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.json(deletedPlace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete place" });
  }
});

module.exports = router;