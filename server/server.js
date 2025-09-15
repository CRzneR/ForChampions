const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ✅ Models aus dem Backend laden
const { User } = require("./models/User");
const { Tournament } = require("./models/Tournament");
const { Match } = require("./models/Match");

const app = express();

// CORS Konfiguration
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
  express.static(".", {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Verbindung
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/forcham";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB verbunden");
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error.message);
  }
};

connectDB();

// Middleware zur Authentifizierung
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

// Test-Route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server ist erreichbar!",
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development",
  });
});

// Health Check Route für Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Registrierungs-Endpoint
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

// Login-Endpoint
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

// Tournament Endpoints
// Turnier erstellen
app.post("/api/tournaments", authenticateToken, async (req, res) => {
  try {
    const { name, description, teams, groupCount } = req.body;

    const tournament = new Tournament({
      name,
      description,
      createdBy: req.user.userId,
      teams: teams || [],
      groups: Array.from({ length: groupCount || 4 }, (_, i) => ({
        name: `Gruppe ${String.fromCharCode(65 + i)}`,
        teams: [],
        matches: [],
      })),
    });

    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    console.error("Turnier Erstellungsfehler:", error);
    res.status(500).json({ message: "Fehler beim Erstellen des Turniers" });
  }
});

// Alle Turniere eines Users abrufen
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

// Bestimmtes Turnier abrufen
app.get("/api/tournaments/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2")
      .populate("playoffs.rounds.matches.team1")
      .populate("playoffs.rounds.matches.team2")
      .populate("playoffs.rounds.matches.winner");

    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Turnier Abfragefehler:", error);
    res.status(500).json({ message: "Fehler beim Abrufen des Turniers" });
  }
});

// Turnier aktualisieren
app.put("/api/tournaments/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("teams");

    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Turnier Aktualisierungsfehler:", error);
    res.status(500).json({ message: "Fehler beim Aktualisieren des Turniers" });
  }
});

// Match-Ergebnis speichern
app.post(
  "/api/tournaments/:id/matches",
  authenticateToken,
  async (req, res) => {
    try {
      const { groupIndex, matchIndex, score1, score2 } = req.body;

      const tournament = await Tournament.findById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Turnier nicht gefunden" });
      }

      tournament.groups[groupIndex].matches[matchIndex].score1 = score1;
      tournament.groups[groupIndex].matches[matchIndex].score2 = score2;
      tournament.groups[groupIndex].matches[matchIndex].played = true;

      await tournament.save();
      res.json(tournament);
    } catch (error) {
      console.error("Match Speicherfehler:", error);
      res.status(500).json({ message: "Fehler beim Speichern des Matches" });
    }
  }
);

// Playoff-Match-Ergebnis speichern
app.post(
  "/api/tournaments/:id/playoffs",
  authenticateToken,
  async (req, res) => {
    try {
      const { roundIndex, matchIndex, score1, score2, winnerId } = req.body;

      const tournament = await Tournament.findById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Turnier nicht gefunden" });
      }

      tournament.playoffs.rounds[roundIndex].matches[matchIndex].score1 =
        score1;
      tournament.playoffs.rounds[roundIndex].matches[matchIndex].score2 =
        score2;
      tournament.playoffs.rounds[roundIndex].matches[matchIndex].winner =
        winnerId;
      tournament.playoffs.rounds[roundIndex].matches[matchIndex].played = true;

      await tournament.save();
      res.json(tournament);
    } catch (error) {
      console.error("Playoff Match Speicherfehler:", error);
      res
        .status(500)
        .json({ message: "Fehler beim Speichern des Playoff-Matches" });
    }
  }
);

// Alle Routen zur index.html leiten (für Client-Side Routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Port aus Environment Variable oder Default
const PORT = process.env.PORT || 3000;

// Server starten
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
