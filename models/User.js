const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },

    // student profile
    usn: { type: String, trim: true, uppercase: true },
    branch: { type: String, trim: true },
    year: { type: Number, min: 1, max: 4 },
    skills: [{ type: String, trim: true }],

    // admins belong to one club
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
