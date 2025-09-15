const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  played: { type: Boolean, default: false },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
});

const groupSchema = new mongoose.Schema({
  name: String,
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  matches: [matchSchema],
});

const playoffSchema = new mongoose.Schema({
  rounds: [
    {
      name: String,
      matches: [matchSchema],
    },
  ],
});

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    groups: [groupSchema],
    playoffs: playoffSchema,
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = { Tournament };
