export class Tournament {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.teamCount = data.teamCount || 0;
    this.groupCount = data.groupCount || 0;
    this.playoffSpots = data.playoffSpots || 0;
    this.groups = data.groups || [];
    this.matches = data.matches || [];
    this.teamNames = data.teamNames || [];
    this.createdBy = data.createdBy || null;
    this.createdAt = data.createdAt || new Date();
  }

  updateTeamStats(groupIndex, team1Index, team2Index, homeGoals, awayGoals) {
    if (!this.groups[groupIndex]) return;

    const group = this.groups[groupIndex];
    const team1 = group.teams[team1Index];
    const team2 = group.teams[team2Index];

    if (!team1 || !team2) return;

    // Vorherige Statistiken entfernen (falls vorhanden)
    this.removePreviousMatchStats(groupIndex, team1Index, team2Index);

    // Update match counts
    team1.matchesPlayed++;
    team2.matchesPlayed++;

    // Update goals
    team1.goalsFor += homeGoals;
    team1.goalsAgainst += awayGoals;
    team2.goalsFor += awayGoals;
    team2.goalsAgainst += homeGoals;

    // Update results
    if (homeGoals > awayGoals) {
      team1.wins++;
      team2.losses++;
      team1.points += 3;
      this.updateTeamForm(team1, "W");
      this.updateTeamForm(team2, "L");
    } else if (homeGoals < awayGoals) {
      team1.losses++;
      team2.wins++;
      team2.points += 3;
      this.updateTeamForm(team1, "L");
      this.updateTeamForm(team2, "W");
    } else {
      team1.draws++;
      team2.draws++;
      team1.points += 1;
      team2.points += 1;
      this.updateTeamForm(team1, "D");
      this.updateTeamForm(team2, "D");
    }

    // Recalculate derived stats
    team1.games = team1.wins + team1.losses + team1.draws;
    team2.games = team2.wins + team2.losses + team2.draws;
    team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
    team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
  }

  removePreviousMatchStats(groupIndex, team1Index, team2Index) {
    // Find existing match between these teams
    const matchId = this.findMatchId(groupIndex, team1Index, team2Index);
    if (!matchId) return;

    const existingMatch = this.matches.find((m) => m.id === matchId);
    if (!existingMatch) return;

    const group = this.groups[groupIndex];
    const team1 = group.teams[team1Index];
    const team2 = group.teams[team2Index];

    // Remove previous stats
    team1.matchesPlayed--;
    team2.matchesPlayed--;
    team1.goalsFor -= existingMatch.homeGoals;
    team1.goalsAgainst -= existingMatch.awayGoals;
    team2.goalsFor -= existingMatch.awayGoals;
    team2.goalsAgainst -= existingMatch.homeGoals;

    // Remove previous results
    if (existingMatch.homeGoals > existingMatch.awayGoals) {
      team1.wins--;
      team2.losses--;
      team1.points -= 3;
      this.removeTeamForm(team1);
      this.removeTeamForm(team2);
    } else if (existingMatch.homeGoals < existingMatch.awayGoals) {
      team1.losses--;
      team2.wins--;
      team2.points -= 3;
      this.removeTeamForm(team1);
      this.removeTeamForm(team2);
    } else {
      team1.draws--;
      team2.draws--;
      team1.points -= 1;
      team2.points -= 1;
      this.removeTeamForm(team1);
      this.removeTeamForm(team2);
    }
  }

  findMatchId(groupIndex, team1Index, team2Index) {
    return this.matches.find(
      (m) =>
        m.groupIndex === groupIndex &&
        ((m.team1Index === team1Index && m.team2Index === team2Index) ||
          (m.team1Index === team2Index && m.team2Index === team1Index))
    )?.id;
  }

  updateTeamForm(team, result) {
    if (!team.form) team.form = [];
    team.form.push(result);
    if (team.form.length > 5) {
      team.form.shift();
    }
  }

  removeTeamForm(team) {
    if (team.form && team.form.length > 0) {
      team.form.pop();
    }
  }

  initializeGroups() {
    this.groups = [];
    const teamsPerGroup = Math.floor(this.teamCount / this.groupCount);
    const remainingTeams = this.teamCount % this.groupCount;

    let nameIndex = 0;
    for (let i = 0; i < this.groupCount; i++) {
      const groupTeams = i < remainingTeams ? teamsPerGroup + 1 : teamsPerGroup;
      const group = {
        name: `Gruppe ${String.fromCharCode(65 + i)}`,
        teams: [],
      };

      for (let j = 0; j < groupTeams; j++) {
        group.teams.push({
          id: `team-${i}-${j}`,
          name: this.teamNames[nameIndex] || `Team ${nameIndex + 1}`,
          games: 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          goalDifference: 0,
          form: [],
        });
        nameIndex++;
      }
      this.groups.push(group);
    }
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      teamCount: this.teamCount,
      groupCount: this.groupCount,
      playoffSpots: this.playoffSpots,
      groups: this.groups,
      matches: this.matches,
      teamNames: this.teamNames,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    };
  }

  static fromJSON(json) {
    return new Tournament(json);
  }
}
