const express = require("express");
const router = express.Router();

const adminService = require("../services/admin.service");

router.get("/analytics", async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.json(analytics);
  } catch {
    res.json(adminService.emptyAnalytics);
  }
});

module.exports = router;
