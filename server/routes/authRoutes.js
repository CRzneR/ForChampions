const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Registrierung
router.post("/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;

    // Überprüfen, ob Benutzer existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Benutzername bereits vergeben" });
    }

    // Neuen Benutzer erstellen
    const user = new User({ username, password, name });
    await user.save();

    // Token generieren
    const token = generateToken(user);

    res.status(201).json({ token, userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Fehler bei der Registrierung" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Benutzer finden
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Passwort überprüfen
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Token generieren
    const token = generateToken(user);

    res.json({ token, userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Login" });
  }
});

// Token-Generator
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

module.exports = router;
