// routes/matches.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const { Tournament } = require("../models/tournament");

// POST /api/tournaments/:id/matches
router.post("/", async (req, res) => {
  try {
    const { id } = req.params;
    const { groupIndex, matchIndex, score1, score2 } = req.body;

    if (
      groupIndex === undefined ||
      matchIndex === undefined ||
      score1 === undefined ||
      score2 === undefined
    ) {
      return res.status(400).json({ error: "Ungültige Daten" });
    }

    const tournament = await Tournament.findById(id)
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2");

    if (!tournament) {
      return res.status(404).json({ error: "Turnier nicht gefunden" });
    }

    const group = tournament.groups[groupIndex];
    if (!group) {
      return res.status(400).json({ error: "Gruppe nicht gefunden" });
    }

    const match = group.matches[matchIndex];
    if (!match) {
      return res.status(400).json({ error: "Match nicht gefunden" });
    }

    // Ergebnis setzen
    match.score1 = score1;
    match.score2 = score2;
    match.played = true;

    if (score1 > score2) {
      match.winner = match.team1;
    } else if (score2 > score1) {
      match.winner = match.team2;
    } else {
      match.winner = null;
    }

    await tournament.save();

    // Mit Populates zurückgeben
    const updated = await Tournament.findById(id)
      .populate("teams")
      .populate("groups.teams")
      .populate("groups.matches.team1")
      .populate("groups.matches.team2");

    res.json(updated);
  } catch (err) {
    console.error("❌ Fehler beim Speichern des Matches:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

module.exports = router;
