const express = require("express");
const Club = require("../models/Club");
const VENUES = require("../config/venues");
const { findClashes } = require("../utils/clashes");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Text fields a club admin may change, with their max lengths
const TEXT_FIELDS = { description: 300, rounds: 40, website: 300, instagram: 300, formLink: 300 };
const LINK_FIELDS = ["website", "instagram", "formLink"];
// Only real web links. This also blocks things like "javascript:..." being saved as a link.
const LINK_RE = /^https?:\/\/[^\s]+$/i;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 10;

const isRealDay = d => DAY_RE.test(d) && !isNaN(new Date(d + "T00:00:00"));

// my club + the clashes it has with every other club
async function clubWithClashes(clubId) {
  const all = await Club.find();
  const club = all.find(c => String(c._id) === String(clubId));
  if (!club) return null;
  return { ...club.toObject(), clashes: findClashes(club, all) };
}

// GET /api/clubs  (public: club directory + filter dropdown)
router.get("/", async (req, res) => {
  const clubs = await Club.find().sort("name");
  res.json(clubs);
});

// GET /api/clubs/venues  (the fixed venue list, used by the admin form)
router.get("/venues", (req, res) => res.json(VENUES));

// GET /api/clubs/mine  (admin: my club's details + schedule clashes)
router.get("/mine", requireRole("admin"), async (req, res) => {
  const club = await clubWithClashes(req.session.user.club);
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json(club);
});

// PUT /api/clubs/mine  (admin: update schedule, venues and links of my own club)
router.put("/mine", requireRole("admin"), async (req, res) => {
  try {
    const club = await Club.findById(req.session.user.club);
    if (!club) return res.status(404).json({ error: "Club not found" });
    const errors = [];

    Object.keys(TEXT_FIELDS).forEach(field => {
      if (req.body[field] === undefined) return;               // not sent: leave it as it is
      const value = String(req.body[field]).trim();
      if (value.length > TEXT_FIELDS[field]) errors.push(`${field} is too long (max ${TEXT_FIELDS[field]} characters)`);
      if (LINK_FIELDS.includes(field) && value && !LINK_RE.test(value)) errors.push(`${field} must be a link starting with http:// or https://`);
      club[field] = value;
    });

    if (req.body.recruitmentDays !== undefined) {
      const days = [...new Set([].concat(req.body.recruitmentDays).map(String))].sort();   // no duplicates, in date order
      if (days.some(d => !isRealDay(d))) errors.push("Recruitment days must be valid dates");
      if (days.length > MAX_DAYS) errors.push(`At most ${MAX_DAYS} recruitment days`);
      club.recruitmentDays = days;
    }

    if (req.body.venues !== undefined) {
      const venues = [...new Set([].concat(req.body.venues).map(String))];
      const unknown = venues.filter(v => !VENUES.includes(v));
      if (unknown.length) errors.push("Unknown venue: " + unknown.join(", "));
      club.venues = venues;
    }

    if (errors.length) return res.status(400).json({ error: errors.join(". ") });
    await club.save();
    res.json(await clubWithClashes(club._id));    // send back the new clash list so the page can update
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update club details" });
  }
});

module.exports = router;
