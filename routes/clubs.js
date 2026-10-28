const express = require("express");
const Club = require("../models/Club");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Fields a club admin is allowed to change, with their max lengths
const EDITABLE = { description: 300, recruitmentDates: 60, venue: 100, rounds: 40, website: 300, instagram: 300, formLink: 300 };
const LINK_FIELDS = ["website", "instagram", "formLink"];
// Only real web links. This also blocks things like "javascript:..." being saved as a link.
const LINK_RE = /^https?:\/\/[^\s]+$/i;

// GET /api/clubs  (public: club directory + filter dropdown)
router.get("/", async (req, res) => {
  const clubs = await Club.find().sort("name");
  res.json(clubs);
});

// GET /api/clubs/mine  (admin: my club's details for the edit form)
router.get("/mine", requireRole("admin"), async (req, res) => {
  const club = await Club.findById(req.session.user.club);
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json(club);
});

// PUT /api/clubs/mine  (admin: update schedule, venue and links of my own club)
router.put("/mine", requireRole("admin"), async (req, res) => {
  try {
    const club = await Club.findById(req.session.user.club);
    if (!club) return res.status(404).json({ error: "Club not found" });

    const errors = [];
    Object.keys(EDITABLE).forEach(field => {
      if (req.body[field] === undefined) return;               // field not sent: leave it as it is
      const value = String(req.body[field]).trim();
      if (value.length > EDITABLE[field]) errors.push(`${field} is too long (max ${EDITABLE[field]} characters)`);
      if (LINK_FIELDS.includes(field) && value && !LINK_RE.test(value)) errors.push(`${field} must be a link starting with http:// or https://`);
      club[field] = value;
    });
    if (errors.length) return res.status(400).json({ error: errors.join(". ") });

    await club.save();
    res.json(club);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update club details" });
  }
});

module.exports = router;
