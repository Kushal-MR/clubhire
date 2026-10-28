const mongoose = require("mongoose");

// optional text fields default to "" so the frontend never has to deal with undefined
const text = max => ({ type: String, trim: true, maxlength: max, default: "" });

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ["Technical", "Social", "Cultural", "Sports"], default: "Technical" },
  description: text(300),

  // recruitment schedule shown in the club directory (editable by the club's admin)
  recruitmentDates: text(60),   // e.g. "27, 30 Oct 2026"
  venue: text(100),             // e.g. "ETE Seminar Hall"
  rounds: text(40),             // e.g. "Rounds 1–2"

  // links (must be http/https, checked in routes/clubs.js)
  website: text(300),
  instagram: text(300),
  formLink: text(300)           // the club's Google Form for registration
});

module.exports = mongoose.model("Club", clubSchema);
