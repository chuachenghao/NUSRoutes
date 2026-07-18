const express = require("express");
const router = express.Router();

const {
  getAllReports,
  createReport,
  castVote,
  deleteReport,
} = require("../services/reports.service");

const VALID_TYPES = ["obstruction", "closure", "crowded", "hazard", "other"];
const VALID_VOTE_TYPES = ["upvote", "irrelevant"];

router.get("/", async (req, res) => {
  try {
    const voterId = req.query.voterId ? String(req.query.voterId) : null;
    const reports = await getAllReports(voterId);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const type = data.type ?? "obstruction";
    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid report type" });
    }

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        error: "Valid latitude and longitude are required",
      });
    }

    const newReport = await createReport({
      ...data,
      type,
      latitude,
      longitude,
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create report" });
  }
});

router.post("/:id/vote", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { voterId, voteType } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid report ID is required" });
    }

    if (!voterId) {
      return res.status(400).json({ error: "voterId is required" });
    }

    if (!VALID_VOTE_TYPES.includes(voteType)) {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    const report = await castVote(id, String(voterId), voteType);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to vote on report" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const requesterId = req.body?.requesterId ?? req.query.requesterId;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid report ID is required" });
    }

    if (!requesterId) {
      return res.status(400).json({ error: "requesterId is required" });
    }

    const deleted = await deleteReport(id, String(requesterId));

    if (!deleted) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(deleted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

module.exports = router;
