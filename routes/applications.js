const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Which status can come next. This is a small "state machine":
// an admin can't jump from Applied straight to Selected.
const NEXT = {
  Applied: ["Shortlisted", "Rejected"],
  Shortlisted: ["Interview", "Rejected"],
  Interview: ["Selected", "Rejected"],
  Selected: [],
  Rejected: []
};

// GET /api/applications/mine   (student)
router.get("/mine", requireRole("student"), async (req, res) => {
  const apps = await Application.find({ student: req.session.user.id })
    .populate({ path: "opening", select: "title deadline isOpen club", populate: { path: "club", select: "name" } })
    .sort({ updatedAt: -1 });
  res.json(apps);
});

// DELETE /api/applications/:id   (student withdraws, only before shortlisting)
router.delete("/:id", requireRole("student"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid application id" });
  const app = await Application.findById(req.params.id);
  if (!app || app.student.toString() !== req.session.user.id) return res.status(404).json({ error: "Application not found" });
  if (app.status !== "Applied") return res.status(400).json({ error: "You can only withdraw before you are shortlisted" });
  await app.deleteOne();
  res.json({ message: "Application withdrawn" });
});

// PATCH /api/applications/:id/status   (admin of the opening's club)
router.patch("/:id/status", requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid application id" });
    const app = await Application.findById(req.params.id).populate("opening", "club");
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (app.opening.club.toString() !== req.session.user.club) return res.status(403).json({ error: "This application belongs to another club" });

    const { status, note } = req.body;
    if (!NEXT[app.status].includes(status)) {
      return res.status(400).json({ error: `Can't move from ${app.status} to ${status}` });
    }
    app.status = status;
    app.history.push({ status: status, note: (note || "").trim() || `Moved to ${status}` });
    await app.save();
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update status" });
  }
});

module.exports = router;
module.exports.NEXT = NEXT;
