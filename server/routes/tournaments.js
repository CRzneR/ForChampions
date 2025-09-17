const express = require("express");
const { Tournament } = require("../models/Tournament");
const { Team } = require("../models/Team");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

/**
 * Hilfsfunktion: Alle Paarungen einer Gruppe erzeugen (Round-Robin)
 */
function generateGroupMatches(teamIds) {
  const matches = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      matches.push({
        team1: teamIds[i],
        team2: teamIds[j],
        score1: 0,
        score2: 0,
        played: false,
      });
    }
  }
  return matches;
}

// --- Turnier erstellen ---
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, teams, groupCount } = req.body;

    // Teams speichern (oder vorhandene wiederverwenden)
    const teamDocs = [];
    for (const t of teams) {
      let team = await Team.findOne({ name: t.name });
      if (!team) {
        team = new Team({ name: t.name });
        await team.save();
      }
      teamDocs.push(team);
    }

    // Gruppen vorbereiten
    const groups = Array.from({ length: groupCount || 4 }, (_, i) => ({
      name: `Gruppe ${String.fromCharCode(65 + i)}`,
      teams: [],
      matches: [],
    }));

    // Teams gleichmäßig auf Gruppen verteilen
    teamDocs.forEach((team, idx) => {
      const groupIndex = idx % groups.length;
      groups[groupIndex].teams.push(team._id);
    });

    // Für jede Gruppe Matches generieren
    groups.forEach((group) => {
      group.matches = generateGroupMatches(group.teams);
    });

    // Turnier anlegen
    const tournament = new Tournament({
      name,
      description,
      createdBy: req.user.userId,
      teams: teamDocs.map((t) => t._id),
      groups,
    });

    await tournament.save();

    // Populieren: Teams + Gruppen-Teams + Matches
    await tournament.populate("teams");
    await tournament.populate("groups.teams");
    await tournament.populate("groups.matches.team1");
    await tournament.populate("groups.matches.team2");

    res.status(201).json(tournament);
  } catch (error) {
    console.error("Turnier Erstellungsfehler:", error);
    res.status(500).json({ message: "Fehler beim Erstellen des Turniers" });
  }
});

// --- Alle Turniere eines Users ---
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tournaments = await Tournament.find({ createdBy: req.user.userId })
      .populate("teams")
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2")
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (error) {
    console.error("Turnier Abfragefehler:", error);
    res.status(500).json({ message: "Fehler beim Abrufen der Turniere" });
  }
});

// --- Bestimmtes Turnier laden ---
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("teams")
      .populate("groups.teams")
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

// --- Turnier aktualisieren ---
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("teams")
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2");

    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Turnier Aktualisierungsfehler:", error);
    res.status(500).json({ message: "Fehler beim Aktualisieren des Turniers" });
  }
});

module.exports = router;
