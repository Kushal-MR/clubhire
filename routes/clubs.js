const express = require("express");
const Club = require("../models/Club");

const router = express.Router();

// GET /api/clubs  (public)
router.get("/", async (req, res) => {
  const clubs = await Club.find().sort("name");
  res.json(clubs);
});

module.exports = router;
