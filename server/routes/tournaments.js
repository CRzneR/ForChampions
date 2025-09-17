const express = require("express");
const { Tournament } = require("../models/Tournament");
const { Team } = require("../models/Team");
const authenticateToken = require("../middleware/auth");

const router = express.Router(); // <-- das hat gefehlt!

//
// --- Neues Turnier erstellen ---
//
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, groupCount, playoffSpots, teams } = req.body;

    console.log("➡️ Turnier erstellen Request:", req.body);
    console.log("➡️ Authentifizierter User:", req.user);

    if (!name || !groupCount || !teams || teams.length === 0) {
      return res.status(400).json({ message: "Ungültige Turnierdaten" });
    }

    // Neues Turnier anlegen
    const tournament = new Tournament({
      name,
      createdBy: req.user.userId,
      teams: [],
      groups: [],
      playoffs: { rounds: [] },
      playoffSpots,
      status: "In Vorbereitung",
    });
    await tournament.save();

    // Teams anlegen
    const createdTeams = await Team.insertMany(
      teams.map((t) => ({
        name: t.name,
        tournamentId: tournament._id, // ✅ Bindung zum Turnier
      }))
    );

    // Gruppen erzeugen
    const groups = [];
    const teamsPerGroup = Math.ceil(createdTeams.length / groupCount);

    for (let g = 0; g < groupCount; g++) {
      const groupTeams = createdTeams.slice(
        g * teamsPerGroup,
        (g + 1) * teamsPerGroup
      );

      const matches = [];
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matches.push({
            team1: groupTeams[i]._id,
            team2: groupTeams[j]._id,
          });
        }
      }

      groups.push({
        name: `Gruppe ${String.fromCharCode(65 + g)}`,
        teams: groupTeams.map((t) => t._id),
        matches,
      });
    }

    // Turnier updaten
    tournament.teams = createdTeams.map((t) => t._id);
    tournament.groups = groups;

    await tournament.save();
    await tournament.populate(
      "teams groups.teams groups.matches.team1 groups.matches.team2"
    );

    console.log("✅ Turnier erfolgreich erstellt:", tournament._id);
    res.status(201).json(tournament);
  } catch (err) {
    console.error("❌ Fehler beim Erstellen des Turniers:", err);
    res.status(500).json({ message: "Fehler beim Erstellen des Turniers" });
  }
});

//
// --- Weitere Routen (get, put, matches) hier unverändert ---
//

module.exports = router;
