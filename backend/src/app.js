const express = require("express");
const cors = require("cors");

const placesRoutes = require("./routes/places.routes");
const healthRoutes = require("./routes/health.routes");
const routingRoutes = require("./routes/routing.routes");
const announcementsRoutes = require("./routes/announcements.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/places", placesRoutes);
app.use("/health", healthRoutes);
app.use("/routing", routingRoutes);
app.use("/announcements", announcementsRoutes);

module.exports = app;