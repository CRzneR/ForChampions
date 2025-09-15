const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    form: [{ type: String }], // ["W", "D", "L"]
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = { Team };
