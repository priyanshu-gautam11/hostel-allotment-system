import mongoose from "mongoose";

const waitlistEntrySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    pool: {
      type: String,
      enum: ["single", "triple"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "offered", "promoted", "removed"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

waitlistEntrySchema.index(
  { studentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["waiting", "offered", "promoted"] },
    },
  }
);

const WaitlistEntry = mongoose.model(
  "WaitlistEntry",
  waitlistEntrySchema
);

export default WaitlistEntry;