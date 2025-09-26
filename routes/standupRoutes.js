const express = require("express");
const Standup = require("../models/Standup");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected: Add standup
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newStandup = new Standup({
      user: req.user,   // comes from JWT
      date: req.body.date,
      yesterday: req.body.yesterday,
      today: req.body.today,
      blockers: req.body.blockers
    });

    await newStandup.save();
    res.status(201).json(newStandup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
