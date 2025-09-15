const mongoose = require("mongoose");

// Schema für Matches
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

// Schema für Gruppen
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  matches: [matchSchema],
});

// Schema für Playoffs
const playoffSchema = new mongoose.Schema({
  rounds: [
    {
      matches: [matchSchema],
    },
  ],
});

// Turnier-Schema
const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }], // IDs aus Team-Collection
    groups: [groupSchema],
    playoffs: playoffSchema,
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);

module.exports = { Tournament };
