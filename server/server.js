require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // oder deine Client-URL
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "geheimes-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Auf true setzen wenn HTTPS verwendet wird
      maxAge: 24 * 60 * 60 * 1000, // 24 Stunden
    },
  })
);

// "Datenbank" - In einer echten App würdest du eine echte DB verwenden
const usersFile = path.join(__dirname, "users.json");

function readUsers() {
  if (!fs.existsSync(usersFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Authentifizierungs-Routen
app.post("/api/register", async (req, res) => {
  const { email, password, username } = req.body;

  // Validierung
  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ success: false, message: "Bitte fülle alle Felder aus" });
  }

  const users = readUsers();

  // Prüfen ob Benutzer bereits existiert
  if (users.find((user) => user.email === email)) {
    return res
      .status(400)
      .json({ success: false, message: "Benutzer existiert bereits" });
  }

  try {
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    res.json({ success: true, message: "Registrierung erfolgreich" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Fehler" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Bitte fülle alle Felder aus" });
  }

  const users = readUsers();
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Ungültige Anmeldedaten" });
  }

  try {
    // Passwort vergleichen
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Session erstellen
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      res.json({
        success: true,
        message: "Login erfolgreich",
        user: req.session.user,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Ungültige Anmeldedaten" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Fehler" });
  }
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: "Nicht angemeldet" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Logout fehlgeschlagen" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logout erfolgreich" });
  });
});

// Statische Dateien für den Client bereitstellen
app.use(express.static(path.join(__dirname, "../client")));

// Alle nicht-API-Routen an den Client weiterleiten
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
