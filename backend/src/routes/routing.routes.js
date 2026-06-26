const express = require("express");
const router = express.Router();

const routingService = require("../services/routing.service");

router.get("/", async (req, res) => {
  const { start, end, mode } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "start and end query parameters are required" });
  }

  try {
    const routeMode = mode === "sheltered" ? "sheltered" : "fastest";
    const result = await routingService.getRouteBetweenPlaces(start, end, routeMode);
    res.json(result);
  } catch (err) {
    // log error and return a controlled response
    console.error("Routing error:", err);
    const notFound = err.message && (
      err.message === "Start place not found" ||
      err.message === "End place not found"
    );
    const status = notFound ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
