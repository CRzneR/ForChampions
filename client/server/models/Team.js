const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: String }],
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = { Team };
