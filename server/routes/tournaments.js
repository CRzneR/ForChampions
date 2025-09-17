const express = require("express");
const { Tournament } = require("../models/Tournament");
const { Team } = require("../models/Team");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ... deine bestehenden Routen (POST /, GET /, GET /:id, PUT /:id)

// --- Match-Ergebnis speichern ---
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

    // Match-Ergebnis setzen
    match.score1 = score1;
    match.score2 = score2;
    match.played = true;

    // --- Teams updaten ---
    const team1 = await Team.findById(match.team1);
    const team2 = await Team.findById(match.team2);

    if (!team1 || !team2) {
      return res.status(400).json({ message: "Teams nicht gefunden" });
    }

    // Falls schon Ergebnis vorhanden → alte Stats zurücknehmen
    if (match.oldApplied) {
      console.log(
        "⚠️ Ergebnis wurde schon angewendet → Statistiken nicht doppelt zählen"
      );
    } else {
      // Tore
      team1.goalsFor += score1;
      team1.goalsAgainst += score2;
      team2.goalsFor += score2;
      team2.goalsAgainst += score1;

      if (score1 > score2) {
        // Team1 Sieg
        team1.wins += 1;
        team1.points += 3;
        team2.losses += 1;
        match.winner = team1._id;

        team1.form.unshift("W");
        team2.form.unshift("L");
      } else if (score2 > score1) {
        // Team2 Sieg
        team2.wins += 1;
        team2.points += 3;
        team1.losses += 1;
        match.winner = team2._id;

        team2.form.unshift("W");
        team1.form.unshift("L");
      } else {
        // Unentschieden
        team1.draws += 1;
        team2.draws += 1;
        team1.points += 1;
        team2.points += 1;

        match.winner = null;

        team1.form.unshift("D");
        team2.form.unshift("D");
      }

      // Nur die letzten 5 Spiele im Form-Array behalten
      team1.form = team1.form.slice(0, 5);
      team2.form = team2.form.slice(0, 5);

      // Flag setzen → Ergebnis angewendet
      match.oldApplied = true;

      await team1.save();
      await team2.save();
    }

    await tournament.save();
    await tournament.populate("groups.teams");
    await tournament.populate("groups.matches.team1");
    await tournament.populate("groups.matches.team2");

    res.json(tournament);
  } catch (error) {
    console.error("❌ Fehler beim Speichern des Matches:", error);
    res.status(500).json({ message: "Fehler beim Speichern des Matches" });
  }
});

module.exports = router;
