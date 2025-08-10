require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Datenbankverbindung
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Mit Datenbank verbunden"))
  .catch((err) => console.error("Datenbankverbindungsfehler:", err));

// Routen
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
