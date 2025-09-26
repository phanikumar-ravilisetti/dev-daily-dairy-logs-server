const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  yesterday: { type: String, required: true },
  today: { type: String, required: true },
  blockers: { type: String },
});

module.exports = mongoose.model("Log", logSchema);
