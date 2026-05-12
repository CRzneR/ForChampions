// server/routes/matches.js
const express = require("express");
const { Tournament } = require("../models/Tournament");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

/**
 * Hilfsfunktion: Teamstatistiken einer Gruppe neu berechnen
 */
function recalcGroupStats(group) {
  // Reset
  group.teams.forEach((t) => {
    t.wins = 0;
    t.draws = 0;
    t.losses = 0;
    t.goalsFor = 0;
    t.goalsAgainst = 0;
    t.points = 0;
    t.goalDifference = 0;
    t.form = [];
  });

  // Matches durchgehen
  group.matches.forEach((match) => {
    if (!match.played) return;

    const t1 = group.teams.find((t) => t.team.toString() === match.team1.toString());
    const t2 = group.teams.find((t) => t.team.toString() === match.team2.toString());

    if (!t1 || !t2) return;

    // ✅ Sicherstellen dass Scores Zahlen sind
    const s1 = Number(match.score1);
    const s2 = Number(match.score2);

    // Tore
    t1.goalsFor += s1;
    t1.goalsAgainst += s2;
    t2.goalsFor += s2;
    t2.goalsAgainst += s1;

    // Ergebnis auswerten
    if (s1 > s2) {
      t1.wins += 1;
      t1.points += 3;
      t1.form.push("W");

      t2.losses += 1;
      t2.form.push("L");
    } else if (s2 > s1) {
      t2.wins += 1;
      t2.points += 3;
      t2.form.push("W");

      t1.losses += 1;
      t1.form.push("L");
    } else {
      t1.draws += 1;
      t2.draws += 1;
      t1.points += 1;
      t2.points += 1;
      t1.form.push("D");
      t2.form.push("D");
    }

    // Tordifferenz
    t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
    t2.goalDifference = t2.goalsFor - t2.goalsAgainst;
  });
}

// --- Match-Ergebnis speichern (Gruppenphase) ---
router.post("/:id/matches", authenticateToken, async (req, res) => {
  try {
    const { groupIndex, matchIndex } = req.body;

    // ✅ FIX: score1/score2 explizit als Zahlen einlesen (verhindert String-Vergleich)
    const score1 = Number(req.body.score1);
    const score2 = Number(req.body.score2);

    if (isNaN(score1) || isNaN(score2)) {
      return res.status(400).json({ message: "Ungültige Tore – bitte Zahlen eingeben" });
    }

    const tournament = await Tournament.findById(req.params.id);
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

    // Ergebnis speichern
    match.score1 = score1;
    match.score2 = score2;
    match.played = true;

    if (score1 > score2) match.winner = match.team1;
    else if (score2 > score1) match.winner = match.team2;
    else match.winner = null;

    // Gruppendaten neu berechnen
    recalcGroupStats(group);

    await tournament.save();

    await tournament.populate(
      "groups.teams.team groups.matches.team1 groups.matches.team2 groups.matches.winner",
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
    const { roundIndex, matchIndex, winnerId } = req.body;

    // ✅ FIX: score1/score2 explizit als Zahlen einlesen
    const score1 = Number(req.body.score1);
    const score2 = Number(req.body.score2);

    if (isNaN(score1) || isNaN(score2)) {
      return res.status(400).json({ message: "Ungültige Tore – bitte Zahlen eingeben" });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "Turnier nicht gefunden" });
    }

    const round = tournament.playoffs.rounds[roundIndex];
    if (!round) {
      return res.status(400).json({ message: "Ungültige Runde" });
    }

    const match = round.matches[matchIndex];
    if (!match) {
      return res.status(400).json({ message: "Ungültiges Playoff-Match" });
    }

    match.score1 = score1;
    match.score2 = score2;
    match.played = true;
    match.winner = winnerId;

    await tournament.save();

    await tournament.populate(
      "playoffs.rounds.matches.team1 playoffs.rounds.matches.team2 playoffs.rounds.matches.winner",
    );

    res.json(tournament);
  } catch (error) {
    console.error("Playoff Speicherfehler:", error);
    res.status(500).json({ message: "Fehler beim Speichern des Playoff-Matches" });
  }
});

module.exports = router;
