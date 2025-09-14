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
const requiredEnvVars = ["MONGODB_URI"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(
      `❌ FEHLER: ${envVar} Environment Variable ist nicht gesetzt!`
    );
    process.exit(1);
  }
});

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
  "http://127.0.0.1:3000",
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

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Korrigiert: __dirname verwenden

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// MongoDB Event Handler
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Verbindungsfehler:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("ℹ️  MongoDB Verbindung getrennt");
});

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// JWT Auth Middleware
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Zugriff verweigert. Kein Token vorhanden." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Ungültiges Token." });
  }
};

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

// Geschützte Route Beispiel
app.get("/api/protected", auth, (req, res) => {
  res.json({
    message: "Geschützter Bereich",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Benutzerprofil abrufen
app.get("/api/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profilfehler:", error);
    res.status(500).json({ message: "Serverfehler beim Abrufen des Profils" });
  }
});

// Registrierungs-Endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validierung
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Passwort muss mindestens 6 Zeichen lang sein" });
    }

    // Prüfen ob Benutzer existiert
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "E-Mail wird bereits verwendet"
            : "Benutzername wird bereits verwendet",
      });
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

    // Validierung
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-Mail und Passwort sind erforderlich" });
    }

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

// Fallback für Frontend-Routes (SPA Support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  console.log(`🏠 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Test Login: http://localhost:${PORT}/api/test`);
});
