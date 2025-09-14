const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Environment Variables prüfen
console.log("Environment Variables Check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI vorhanden:", !!process.env.MONGODB_URI);
console.log("JWT_SECRET vorhanden:", !!process.env.JWT_SECRET);

// Kritische Environment Variables validieren
if (!process.env.MONGODB_URI) {
  console.error(
    "❌ FEHLER: MONGODB_URI Environment Variable ist nicht gesetzt!"
  );
  console.error(
    "Bitte setzen Sie MONGODB_URI in Render.com Environment Variables"
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  WARNUNG: JWT_SECRET ist nicht gesetzt. Verwende Standardwert."
  );
  process.env.JWT_SECRET = "fallback_secret_key_change_in_production";
}

// CORS Konfiguration
const allowedOrigins = [
  "https://forchampions.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Erlaube requests ohne origin (z.B. von Postman oder same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        console.log("Blocked origin:", origin);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("."));

// MongoDB Verbindung
const connectDB = async () => {
  try {
    console.log("Verbinde mit MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB erfolgreich verbunden");
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error.message);
    process.exit(1);
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

// Test-Route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server ist erreichbar!",
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server ist online",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Registrierungs-Endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Prüfen ob Benutzer existiert
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Benutzer existiert bereits" });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Neuen Benutzer erstellen
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // JWT Token erstellen
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

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

    // Benutzer finden
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Ungültige Anmeldedaten" });
    }

    // Passwort vergleichen
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Ungültige Anmeldedaten" });
    }

    // JWT Token erstellen
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

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

// Static files serving
app.use(express.static("."));

// Fallback für Frontend-Routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  console.log(`🏠 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
});
