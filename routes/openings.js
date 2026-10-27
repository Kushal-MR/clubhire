const express = require("express");
const mongoose = require("mongoose");
const Opening = require("../models/Opening");
const Application = require("../models/Application");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// check the fields an admin sends when creating/editing an opening
function validateOpening(body, isUpdate) {
  const errors = [];
  if (!isUpdate || body.title !== undefined) {
    if (!body.title || body.title.trim().length < 3) errors.push("Title must be at least 3 characters");
  }
  if (!isUpdate || body.description !== undefined) {
    if (!body.description || body.description.trim().length < 20) errors.push("Description must be at least 20 characters");
  }
  if (!isUpdate || body.deadline !== undefined) {
    const d = new Date(body.deadline);
    if (isNaN(d)) errors.push("Deadline is not a valid date");
    else if (!isUpdate && d < new Date()) errors.push("Deadline must be in the future");
  }
  return errors;
}

const toSkills = s => (Array.isArray(s) ? s : String(s || "").split(",")).map(x => x.trim()).filter(Boolean);

// load an opening and make sure it belongs to the logged-in admin's club
async function findOwnOpening(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ error: "Invalid opening id" }); return null; }
  const opening = await Opening.findById(req.params.id);
  if (!opening) { res.status(404).json({ error: "Opening not found" }); return null; }
  if (opening.club.toString() !== req.session.user.club) { res.status(403).json({ error: "This opening belongs to another club" }); return null; }
  return opening;
}

// GET /api/openings?q=python&club=<id>&mine=1   (public list)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.mine === "1" && req.session.user && req.session.user.role === "admin") {
      filter.club = req.session.user.club;        // admin dashboard: all of my club's openings
    } else {
      filter.isOpen = true;                       // public: only open ones
      if (req.query.club && mongoose.isValidObjectId(req.query.club)) filter.club = req.query.club;
    }
    if (req.query.q) {
      // escape regex special characters so the search text is treated literally
      const q = req.query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: new RegExp(q, "i") }, { skills: new RegExp(q, "i") }];
    }
    const openings = await Opening.find(filter).populate("club", "name category").sort({ deadline: 1 });

    // how many applications each opening has (one grouped query, not one query per opening)
    const counts = await Application.aggregate([
      { $match: { opening: { $in: openings.map(o => o._id) } } },
      { $group: { _id: "$opening", n: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.n]));
    res.json(openings.map(o => ({ ...o.toObject(), applicants: countMap[o._id.toString()] || 0 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load openings" });
  }
});

// GET /api/openings/:id
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid opening id" });
  const opening = await Opening.findById(req.params.id).populate("club", "name category description");
  if (!opening) return res.status(404).json({ error: "Opening not found" });
  res.json(opening);
});

// POST /api/openings   (admin: creates an opening for their own club)
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const errors = validateOpening(req.body, false);
    if (errors.length) return res.status(400).json({ error: errors.join(". ") });
    const opening = await Opening.create({
      club: req.session.user.club,
      title: req.body.title,
      description: req.body.description,
      skills: toSkills(req.body.skills),
      deadline: req.body.deadline
    });
    res.status(201).json(opening);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create opening" });
  }
});

// PUT /api/openings/:id   (admin: edit, or open/close with isOpen)
router.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    const opening = await findOwnOpening(req, res);
    if (!opening) return;
    const errors = validateOpening(req.body, true);
    if (errors.length) return res.status(400).json({ error: errors.join(". ") });

    ["title", "description", "deadline"].forEach(f => { if (req.body[f] !== undefined) opening[f] = req.body[f]; });
    if (req.body.skills !== undefined) opening.skills = toSkills(req.body.skills);
    if (req.body.isOpen !== undefined) opening.isOpen = Boolean(req.body.isOpen);
    await opening.save();
    res.json(opening);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update opening" });
  }
});

// DELETE /api/openings/:id   (admin: also deletes its applications)
router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const opening = await findOwnOpening(req, res);
    if (!opening) return;
    await Application.deleteMany({ opening: opening._id });
    await opening.deleteOne();
    res.json({ message: "Opening deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete opening" });
  }
});

// POST /api/openings/:id/apply   (student)
router.post("/:id/apply", requireRole("student"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid opening id" });
    const opening = await Opening.findById(req.params.id);
    if (!opening) return res.status(404).json({ error: "Opening not found" });
    if (!opening.isOpen || opening.deadline < new Date()) return res.status(400).json({ error: "This opening is closed" });

    const message = (req.body.message || "").trim();
    if (message.length < 20) return res.status(400).json({ error: "Tell the club why you want to join (at least 20 characters)" });

    const application = await Application.create({
      opening: opening._id,
      student: req.session.user.id,
      message: message,
      history: [{ status: "Applied", note: "Application submitted" }]
    });
    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "You have already applied to this opening" });
    console.error(err);
    res.status(500).json({ error: "Could not submit application" });
  }
});

// GET /api/openings/:id/applications   (admin: applicants for one of my openings)
router.get("/:id/applications", requireRole("admin"), async (req, res) => {
  const opening = await findOwnOpening(req, res);
  if (!opening) return;
  const apps = await Application.find({ opening: opening._id })
    .populate("student", "name email usn branch year skills")
    .sort({ createdAt: 1 });
  res.json(apps);
});

module.exports = router;
