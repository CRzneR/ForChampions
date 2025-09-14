const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Environment Variables mit Fallbacks
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/turnierdb";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

console.log("Server Configuration:");
console.log("Port:", PORT);
console.log("MongoDB URI:", MONGODB_URI ? "✅ Gesetzt" : "❌ Nicht gesetzt");
console.log("JWT Secret:", JWT_SECRET ? "✅ Gesetzt" : "❌ Nicht gesetzt");

// Einfache CORS Konfiguration für Render.com
app.use(
  cors({
    origin: [
      "https://forchampions.onrender.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Verbindung mit verbessertem Error Handling
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB verbunden"))
  .catch((err) => {
    console.error("❌ MongoDB Verbindungsfehler:", err.message);
    console.log("ℹ️  Server läuft im Offline-Modus ohne Datenbank");
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Einfache Test-Route
app.get("/api/test", (req, res) => {
  res.json({
    message: "✅ Server ist online",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "✅ Verbunden" : "❌ Getrennt",
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    server: "Online",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Registrierungs-Endpoint mit verbessertem Error Handling
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validierung
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Alle Felder sind erforderlich",
      });
    }

    // Prüfen ob MongoDB verbunden ist
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Datenbank nicht verbunden. Bitte später versuchen.",
      });
    }

    // Prüfen ob Benutzer existiert
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "E-Mail wird bereits verwendet"
            : "Benutzername wird bereits verwendet",
      });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Neuen Benutzer erstellen
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // JWT Token erstellen
    const token = jwt.sign(
      {
        userId: newUser._id,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(201).json({
      success: true,
      message: "Benutzer erfolgreich registriert",
      token,
      user: {
        id: newUser._id,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("Registrierungsfehler:", error);
    res.status(500).json({
      success: false,
      message: "Serverfehler bei der Registrierung",
    });
  }
});

// Login-Endpoint mit verbessertem Error Handling
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validierung
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "E-Mail und Passwort sind erforderlich",
      });
    }

    // Prüfen ob MongoDB verbunden ist
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Datenbank nicht verbunden. Bitte später versuchen.",
      });
    }

    // Benutzer finden
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Ungültige Anmeldedaten",
      });
    }

    // Passwort vergleichen
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Ungültige Anmeldedaten",
      });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.json({
      success: true,
      message: "Login erfolgreich",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).json({
      success: false,
      message: "Serverfehler beim Login",
    });
  }
});

// Fallback für Frontend-Routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  console.error("Unbehandelter Fehler:", error);
  res.status(500).json({
    success: false,
    message: "Interner Serverfehler",
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Test Route: http://localhost:${PORT}/api/test`);
});
