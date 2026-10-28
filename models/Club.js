const mongoose = require("mongoose");
const VENUES = require("../config/venues");

// optional text fields default to "" so the frontend never has to deal with undefined
const text = max => ({ type: String, trim: true, maxlength: max, default: "" });
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;   // "2026-10-28"

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ["Technical", "Social", "Cultural", "Sports"], default: "Technical" },
  description: text(300),

  // recruitment schedule (editable by the club's admin)
  recruitmentDays: {
    type: [{ type: String, match: DAY_RE }],
    default: []
  },
  venues: {
    type: [{ type: String, enum: VENUES }],
    default: []
  },
  rounds: text(40),   // e.g. "Rounds 1–2"

  // links (must be http/https, checked in routes/clubs.js)
  website: text(300),
  instagram: text(300),
  formLink: text(300)   // the club's Google Form for registration
});

module.exports = mongoose.model("Club", clubSchema);
