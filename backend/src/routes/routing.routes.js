const express = require("express");
const router = express.Router();

const routingService = require("../services/routing.service");

router.get("/", async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "start and end query parameters are required" });
  }

  try {
    const result = await routingService.getRouteBetweenPlaces(start, end);
    res.json(result);
  } catch (err) {
    // log error and return a controlled response
    console.error("Routing error:", err);
    const status = (err.message && (err.message.includes("not found") || err.message.includes("required"))) ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;