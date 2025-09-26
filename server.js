const express = require('express');
const app = express();
const cors = require('cors')
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const User = require("./models/User");
const Log = require("./models/Log"); 
const jwt = require("jsonwebtoken");
const bcrypt  = require("bcrypt");
require("dotenv").config();
const authMiddleware = require('./middleware/authMiddleware');




app.use(express.json());

app.use(cors({
    origin: "https://dev-daily-dairy-logs-git-46aa8a-phani-kumars-projects-8369ff60.vercel.app"
}))

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)


    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT} Port`);
    });

  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
};

connectDB();

app.post("/api/users", async (request, response) => {
  try {
    const { username, email, password } = request.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    response.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

app.post("/api/login", async (request, response) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username });
    if (!user) {
      return response.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return response.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

    response.json({ message: "Login successful", user, token });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post("/logs", authMiddleware, async (request, response) => {
  try {
    const { userId, date, yesterday, today, blockers } = request.body;
    if (!userId || !date || !yesterday || !today || !blockers) {
      return response.status(400).json({ message: "UserId, Date, Yesterday and Today are required" });
    }

    const existingLog = await Log.findOne({ userId, date });
    if (existingLog) {
      return response.status(400).json({ message: "Log for this date already exists" });
    }

    const newLog = new Log({
      userId,
      date,
      yesterday,
      today,
      blockers,
    });

    await newLog.save();

    response.status(201).json({ message: "Log created successfully", log: newLog });
  } catch (error) {
    console.error("Error saving log:", error);
    response.status(500).json({ message: "Server error" });
  }
});

app.get("/logs/:userId", authMiddleware, async (request, response) => {
  try {
    const { userId } = request.params;
    
    const logs = await Log.find({ userId }).sort({ date: -1 });

    if (!logs || logs.length === 0) {
      return response.status(404).json({ message: "No logs found" });
    }

    response.json({logs});
  } catch (error) {
    console.error("Error fetching logs:", error);
    response.status(500).json({ message: "Server error" });
  }
});

app.put("/logs/:id", authMiddleware, async (request, response) => {
  try {
    const { date, yesterday, today, blockers } = request.body;

    const log = await Log.findByIdAndUpdate(
      request.params.id,
      { date, yesterday, today, blockers },
      { new: true }
    );

    if (!log) return response.status(404).json({ message: "Log not found" });

    response.json(log);
  } catch (error) {
    console.error("message", error);
    response.status(500).json({ message: "Server error while updating log" });
  }
});

app.get("/logs/edit/:id", authMiddleware, async (request, response) => {
  try {
    const {id} = request.params;
    const log = await Log.find({_id: id});
    
    if (!log) {
      return response.status(404).json({message: 'Log not found'});
    }

    response.json(log);
  } catch (error) {
     console.error("Error message", error);
     response.status(500).json({message: "Server Error"});
  }
});

app.delete("/logs/delete/:id", authMiddleware, async (request, response) => {
  try {
      const {id} = request.params;
      const deletedLog = await Log.deleteOne({_id: id});

      if(!deletedLog) {
        return response.status(404).json({message: "Log not found"});
      }
      response.json({message: "log deleted Successfully."});
  } catch (error) {
      console.error("Error", error)
      response.status(500).json({message: "server Error"});
  }
})





