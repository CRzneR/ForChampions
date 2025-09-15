const express = require("express");
const { Tournament } = require("../models/Tournament");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// --- Match-Ergebnis speichern (Gruppenphase) ---
router.post("/:id/matches", authenticateToken, async (req, res) => {
  try {
    const { groupIndex, matchIndex, score1, score2 } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    const match = tournament.groups[groupIndex].matches[matchIndex];
    match.score1 = score1;
    match.score2 = score2;
    match.played = true;

    if (score1 > score2) match.winner = match.team1;
    else if (score2 > score1) match.winner = match.team2;
    else match.winner = null;

    await tournament.save();

    await tournament.populate(
      "groups.matches.team1 groups.matches.team2 groups.matches.winner"
    );

    res.json(tournament);
  } catch (error) {
    console.error("Match Speicherfehler:", error);
    res.status(500).json({ message: "Fehler beim Speichern des Matches" });
  }
});

// --- Playoff-Match-Ergebnis speichern ---
router.post("/:id/playoffs", authenticateToken, async (req, res) => {
  try {
    const { roundIndex, matchIndex, score1, score2, winnerId } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    const match = tournament.playoffs.rounds[roundIndex].matches[matchIndex];
    match.score1 = score1;
    match.score2 = score2;
    match.played = true;
    match.winner = winnerId;

    await tournament.save();

    await tournament.populate(
      "playoffs.rounds.matches.team1 playoffs.rounds.matches.team2 playoffs.rounds.matches.winner"
    );

    res.json(tournament);
  } catch (error) {
    console.error("Playoff Speicherfehler:", error);
    res
      .status(500)
      .json({ message: "Fehler beim Speichern des Playoff-Matches" });
  }
});

module.exports = router;
