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
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-render-app-url.onrender.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

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

app.use("/api", authRoutes);
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
// Hier nehmen wir den client-Ordner, in dem deine index.html liegt
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
// Jede Anfrage, die nicht mit /api beginnt → index.html zurückgeben
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
