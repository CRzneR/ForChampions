const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// CORS für alle Ursprünge erlauben (Entwicklung)
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Einfaches Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Verbindung mit verbesserter Fehlerbehandlung
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB verbunden");
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error.message);
    console.log(
      "⚠️  Server läuft ohne Datenbank. Es werden Mock-Daten verwendet."
    );
  }
};
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Test-Route - immer verfügbar
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server ist erreichbar!",
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Mock-Benutzer für Testzwecke (falls DB nicht verfügbar)
const mockUsers = [];

// Registrierungs-Endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Prüfen ob MongoDB verfügbar
    if (mongoose.connection.readyState !== 1) {
      // Mock-Registrierung ohne DB
      if (mockUsers.find((u) => u.email === email || u.username === username)) {
        return res.status(400).json({ message: "Benutzer existiert bereits" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: Date.now(),
        username,
        email,
        password: hashedPassword,
      };
      mockUsers.push(newUser);

      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET || "cham_app_secret",
        { expiresIn: "24h" }
      );

      return res.status(201).json({
        message: "Benutzer erfolgreich registriert (Mock)",
        token,
        user: { id: newUser.id, username, email },
      });
    }

    // Normale Registrierung mit MongoDB
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Benutzer existiert bereits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "cham_app_secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Benutzer erfolgreich registriert",
      token,
      user: { id: newUser._id, username, email },
    });
  } catch (error) {
    console.error("Registrierungsfehler:", error);
    res.status(500).json({ message: "Serverfehler bei der Registrierung" });
  }
});

// Login-Endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Prüfen ob MongoDB verfügbar
    if (mongoose.connection.readyState !== 1) {
      // Mock-Login ohne DB
      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        return res.status(400).json({ message: "Ungültige Anmeldedaten" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Ungültige Anmeldedaten" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "cham_app_secret",
        { expiresIn: "24h" }
      );

      return res.json({
        message: "Login erfolgreich (Mock)",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    }

    // Normales Login mit MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Ungültige Anmeldedaten" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Ungültige Anmeldedaten" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "cham_app_secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login erfolgreich",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).json({ message: "Serverfehler beim Login" });
  }
});

// Hauptseite
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Dashboard-Seite
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Port aus Environment Variable oder Default
const PORT = process.env.PORT || 3001;

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
  console.log(`📋 Test-Route: http://localhost:${PORT}/api/test`);
  console.log(`🏠 Hauptseite: http://localhost:${PORT}`);
});
