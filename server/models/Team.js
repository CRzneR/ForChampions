// models/Team.js
const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true, // jedes Team gehört zu einem Turnier
  },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  form: { type: [String], default: [] },
});

// ✅ Compound-Index: Name darf sich wiederholen, aber NICHT zweimal im gleichen Turnier
teamSchema.index({ tournamentId: 1, name: 1 }, { unique: true });

const Team = mongoose.model("Team", teamSchema);
module.exports = { Team };
