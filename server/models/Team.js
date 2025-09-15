const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: String }],
    // optional: Verknüpfung zum Turnier
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

module.exports = { Team };
