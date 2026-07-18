const express = require("express");
const router = express.Router();

const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  deleteAnnouncement,
  deactivateAnnouncement,
} = require("../services/announcements.service");

router.get("/", async (req, res) => {
  try {
    const announcements = await getAllAnnouncements();
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid announcement ID is required" });
    }

    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!data.title || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        error: "title, valid latitude, and valid longitude are required",
      });
    }

    const newAnnouncement = await createAnnouncement({
      ...data,
      latitude,
      longitude,
    });

    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid announcement ID is required" });
    }

    const deletedAnnouncement = await deleteAnnouncement(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(deletedAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

router.patch("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Valid announcement ID is required" });
    }

    const announcement = await deactivateAnnouncement(id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to deactivate announcement" });
  }
});

module.exports = router;
