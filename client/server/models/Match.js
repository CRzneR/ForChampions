const mongoose = require("mongoose");

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

const Match = mongoose.model("Match", matchSchema);
module.exports = { Match };
