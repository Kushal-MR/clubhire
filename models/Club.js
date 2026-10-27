const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ["Technical", "Social", "Cultural", "Sports"], default: "Technical" },
  description: { type: String, trim: true, maxlength: 300 }
});

module.exports = mongoose.model("Club", clubSchema);
