const mongoose = require("mongoose");

const openingSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    skills: [{ type: String, trim: true }],
    deadline: { type: Date, required: true },
    isOpen: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opening", openingSchema);
