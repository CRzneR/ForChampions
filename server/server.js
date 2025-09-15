const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ✅ Models
const { User } = require("./models/User");
const { Tournament } = require("./models/Tournament");
const { Team } = require("./models/Team");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-render-app-url.onrender.com"]
        : ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Statische Dateien ausliefern
app.use(
  express.static(path.join(__dirname, "../client"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- DB Verbindung ---
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/forcham";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB verbunden"))
  .catch((err) => console.error("❌ MongoDB Fehler:", err.message));

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Zugriff verweigert. Token erforderlich." });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "cham_app_secret"
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Ungültiges Token." });
  }
};

// --- ROUTES ---

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Registrierung
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

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

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-Mail und Passwort sind erforderlich" });
    }

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

// --- Tournament Endpoints ---

// Turnier erstellen
app.post("/api/tournaments", authenticateToken, async (req, res) => {
  try {
    const { name, description, teams, groupCount } = req.body;

    // 1. Teams in DB speichern
    const createdTeams = await Team.insertMany(
      teams.map((t) => ({ name: t.name }))
    );

    // 2. Turnier mit Team-IDs anlegen
    const tournament = new Tournament({
      name,
      description,
      createdBy: req.user.userId,
      teams: createdTeams.map((t) => t._id),
      groups: Array.from({ length: groupCount || 4 }, (_, i) => ({
        name: `Gruppe ${String.fromCharCode(65 + i)}`,
        teams: [],
        matches: [],
      })),
    });

    await tournament.save();

    // 3. Mit Teams zurückgeben
    const populated = await Tournament.findById(tournament._id).populate(
      "teams"
    );

    res.status(201).json(populated);
  } catch (error) {
    console.error("Turnier Erstellungsfehler:", error);
    res.status(500).json({ message: "Fehler beim Erstellen des Turniers" });
  }
});

// Alle Turniere eines Users
app.get("/api/tournaments", authenticateToken, async (req, res) => {
  try {
    const tournaments = await Tournament.find({ createdBy: req.user.userId })
      .populate("teams")
      .sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    console.error("Turnier Abfragefehler:", error);
    res.status(500).json({ message: "Fehler beim Abrufen der Turniere" });
  }
});

// Bestimmtes Turnier
app.get("/api/tournaments/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      "teams"
    );
    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }
    res.json(tournament);
  } catch (error) {
    console.error("Turnier Abfragefehler:", error);
    res.status(500).json({ message: "Fehler beim Abrufen des Turniers" });
  }
});

// Statische Dateien zuerst
app.use(
  express.static(path.join(__dirname, "../client"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// SPA Fallback nur für HTML-Routen
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next(); // API-Routen nicht überschreiben
  }
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Test-Route für Frontend
app.get("/api/test", (req, res) => {
  res.json({ message: "API läuft ✅" });
});

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
});
