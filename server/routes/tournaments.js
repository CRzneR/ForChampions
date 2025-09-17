const express = require("express");
const { Tournament } = require("../models/Tournament");
const { Team } = require("../models/Team");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

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

    // Neues Turnier anlegen (zuerst ohne Teams/Groups)
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

    // ✅ Teams mit tournamentId anlegen
    const createdTeams = await Team.insertMany(
      teams.map((t) => ({
        name: t.name.trim(),
        tournamentId: tournament._id,
      }))
    );

    // Gruppen + Round-Robin Matches erzeugen
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
        name: `Gruppe ${String.fromCharCode(65 + g)}`, // Gruppe A, B, C ...
        teams: groupTeams.map((t) => t._id),
        matches,
      });
    }

    // Turnier mit Teams + Groups aktualisieren
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
// --- Alle Turniere des eingeloggten Users ---
//
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("➡️ Lade Turniere für User:", req.user);

    const tournaments = await Tournament.find({ createdBy: req.user.userId })
      .populate("teams")
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2");

    res.json(tournaments);
  } catch (err) {
    console.error("❌ Fehler beim Laden der Turniere:", err);
    res.status(500).json({ message: "Fehler beim Laden der Turniere" });
  }
});

//
// --- Einzelnes Turnier laden ---
//
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("teams")
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2");

    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    res.json(tournament);
  } catch (err) {
    console.error("❌ Fehler beim Laden des Turniers:", err);
    res.status(500).json({ message: "Fehler beim Laden des Turniers" });
  }
});

//
// --- Turnier bearbeiten ---
//
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    res.json(tournament);
  } catch (err) {
    console.error("❌ Fehler beim Bearbeiten des Turniers:", err);
    res.status(500).json({ message: "Fehler beim Bearbeiten des Turniers" });
  }
});

//
// --- Match-Ergebnis speichern ---
//
router.post("/:id/matches", authenticateToken, async (req, res) => {
  try {
    const { groupIndex, matchIndex, score1, score2 } = req.body;
    const tournament = await Tournament.findById(req.params.id)
      .populate("teams")
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2");

    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    const group = tournament.groups[groupIndex];
    if (!group) {
      return res.status(400).json({ message: "Ungültige Gruppe" });
    }

    const match = group.matches[matchIndex];
    if (!match) {
      return res.status(400).json({ message: "Ungültiges Match" });
    }

    // Ergebnis setzen
    match.score1 = score1;
    match.score2 = score2;
    match.played = true;

    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    if (!team1 || !team2) {
      return res.status(400).json({ message: "Teams nicht gefunden" });
    }

    if (!match.oldApplied) {
      team1.goalsFor += score1;
      team1.goalsAgainst += score2;
      team2.goalsFor += score2;
      team2.goalsAgainst += score1;

      if (score1 > score2) {
        team1.wins += 1;
        team1.points += 3;
        team2.losses += 1;
        match.winner = team1._id;
        team1.form.unshift("W");
        team2.form.unshift("L");
      } else if (score2 > score1) {
        team2.wins += 1;
        team2.points += 3;
        team1.losses += 1;
        match.winner = team2._id;
        team2.form.unshift("W");
        team1.form.unshift("L");
      } else {
        team1.draws += 1;
        team2.draws += 1;
        team1.points += 1;
        team2.points += 1;
        match.winner = null;
        team1.form.unshift("D");
        team2.form.unshift("D");
      }

      team1.form = team1.form.slice(0, 5);
      team2.form = team2.form.slice(0, 5);
      match.oldApplied = true;

      await team1.save();
      await team2.save();
    }

    await tournament.save();
    await tournament.populate(
      "groups.teams groups.matches.team1 groups.matches.team2"
    );

    res.json(tournament);
  } catch (error) {
    console.error("❌ Fehler beim Speichern des Matches:", error);
    res.status(500).json({ message: "Fehler beim Speichern des Matches" });
  }
});

module.exports = router;
