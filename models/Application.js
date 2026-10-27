const mongoose = require("mongoose");

// The order an application moves through. "Rejected" can happen from any non-final step.
const STATUSES = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

const applicationSchema = new mongoose.Schema(
  {
    opening: { type: mongoose.Schema.Types.ObjectId, ref: "Opening", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, minlength: 20, maxlength: 500 },
    status: { type: String, enum: STATUSES, default: "Applied" },
    // every status change is recorded, so the student sees a timeline
    history: [
      {
        status: { type: String, enum: STATUSES },
        note: { type: String, trim: true, maxlength: 200 },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// a student can apply to an opening only once
applicationSchema.index({ opening: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
module.exports.STATUSES = STATUSES;
