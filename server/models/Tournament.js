// server/models/Tournament.js
const mongoose = require("mongoose");

// --- Match Schema (Teams als ObjectId-Refs) ---
const matchSchema = new mongoose.Schema(
  {
    team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    played: { type: Boolean, default: false },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  },
  { timestamps: true }
);

// --- Group-Team Schema (Team + Stats nur für dieses Turnier) ---
const groupTeamSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  form: [{ type: String }], // ["W", "D", "L"]
});

// --- Group Schema ---
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teams: [groupTeamSchema],
  matches: [matchSchema],
});

// --- Playoff Schema ---
const playoffSchema = new mongoose.Schema({
  rounds: [
    {
      matches: [matchSchema],
    },
  ],
});

// --- Tournament Schema ---
const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }], // alle Teilnehmer
    groups: [groupSchema],
    playoffs: playoffSchema,
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = { Tournament };
