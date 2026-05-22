const express = require("express");
const router = express.Router();

const routingService = require("../services/routing.service");

router.get("/", async (req, res) => {
  const { start, end } = req.query;

  const result = await routingService.getShortestRoute(start, end);

  res.json(result);
});

module.exports = router;