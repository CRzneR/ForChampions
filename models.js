// models.js - Erweiterte Datenmodelle
const mongoose = require("mongoose");

// Turnier Schema
const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date },
  endDate: { type: Date },
  teams: [
    {
      name: { type: String, required: true },
      players: [String],
      points: { type: Number, default: 0 },
    },
  ],
  groups: [
    {
      name: { type: String, required: true },
      teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
      matches: [
        {
          team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
          team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
          score1: { type: Number, default: 0 },
          score2: { type: Number, default: 0 },
          played: { type: Boolean, default: false },
          date: { type: Date },
        },
      ],
    },
  ],
  playoffs: {
    rounds: [
      {
        name: { type: String },
        matches: [
          {
            team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
            team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
            score1: { type: Number, default: 0 },
            score2: { type: Number, default: 0 },
            winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
            played: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
});

// Benutzer Schema (bereits vorhanden, aber erweitert)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }],
});

const User = mongoose.model("User", userSchema);
const Tournament = mongoose.model("Tournament", tournamentSchema);

module.exports = { User, Tournament };
