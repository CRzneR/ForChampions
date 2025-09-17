const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

// --- Express App ---
const app = express();

// --- DB Verbindung ---
connectDB();

// --- Middleware ---
app.use(cors()); // ✅ einfach halten, da gleiche Domain
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Logging ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// --- Routen ---
const authRoutes = require("./routes/auth");
const tournamentRoutes = require("./routes/tournaments");
const matchRoutes = require("./routes/matches");

app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/tournaments", matchRoutes);

// --- Health Check ---
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// --- Statische Dateien (Frontend) ---
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

// --- SPA Fallback ---
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next(); // API-Routen nicht überschreiben
  }
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});

// --- Index-Migration für Teams ---
const mongoose = require("mongoose");
const { Team } = require("./models/Team");

mongoose.connection.once("open", async () => {
  try {
    const collection = mongoose.connection.db.collection("teams");

    const indexes = await collection.indexes();
    if (indexes.find((i) => i.name === "name_1")) {
      console.log("⚠️ Alter Index 'name_1' gefunden – wird gelöscht...");
      await collection.dropIndex("name_1");
      console.log("✅ Alter Index 'name_1' gelöscht.");
    } else {
      console.log("ℹ️ Kein alter Index 'name_1' vorhanden.");
    }

    await Team.init(); // sorgt dafür, dass der Compound-Index (tournamentId + name) angelegt wird
    console.log("✅ Neuer Compound-Index (tournamentId + name) aktiv.");
  } catch (err) {
    console.error("❌ Fehler beim Index-Migration:", err);
  }
});
