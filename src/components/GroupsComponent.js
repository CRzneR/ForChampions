// /src/models/Tournament.js

export class Tournament {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.teamCount = data.teamCount || 0;
    this.groupCount = data.groupCount || 0;
    this.playoffSpots = data.playoffSpots || 0;
    this.teamNames = data.teamNames || [];
    this.createdBy = data.createdBy || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.status = data.status || "draft";

    this.groups = this.initializeGroups(data.groups || [], this.teamNames);
    this.matches = data.matches || [];
  }

  // --- GETTER ----------------------------------------------------

  get isDraft() {
    return this.status === "draft";
  }

  get totalMatches() {
    if (!this.groups) return 0;
    return this.groups.reduce((sum, group) => {
      const teams = group.teams?.length || 0;
      return sum + (teams * (teams - 1)) / 2;
    }, 0);
  }

  get playedMatches() {
    return this.matches?.length || 0;
  }

  // --- INITIALIZATION --------------------------------------------

  initializeGroups(groupsData = [], teamNames = []) {
    if (groupsData.length > 0) {
      return groupsData.map((group) => ({
        ...group,
        teams: (group.teams || []).map((team) => this.normalizeTeam(team)),
      }));
    }

    return this.createEmptyGroups(teamNames);
  }

  createEmptyGroups(teamNames) {
    const groups = [];
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
        group.teams.push(
          this.normalizeTeam({
            id: `team-${i}-${j}`,
            name: teamNames[nameIndex] || `Team ${nameIndex + 1}`,
          })
        );
        nameIndex++;
      }
      groups.push(group);
    }
    return groups;
  }

  normalizeTeam(team) {
    return {
      id: team.id || null,
      name: team.name || "Unbenannt",
      games: team.games || 0,
      matchesPlayed: team.matchesPlayed || 0,
      wins: team.wins || 0,
      losses: team.losses || 0,
      draws: team.draws || 0,
      goalsFor: team.goalsFor || 0,
      goalsAgainst: team.goalsAgainst || 0,
      points: team.points || 0,
      goalDifference: team.goalDifference || 0,
      form: team.form || [],
    };
  }

  // --- MATCH / TEAM UPDATES --------------------------------------

  updateTeamStats(groupIndex, team1Index, team2Index, homeGoals, awayGoals) {
    if (!this.groups[groupIndex]) return;

    const group = this.groups[groupIndex];
    const team1 = group.teams[team1Index];
    const team2 = group.teams[team2Index];
    if (!team1 || !team2) return;

    homeGoals = Number(homeGoals) || 0;
    awayGoals = Number(awayGoals) || 0;

    team1.matchesPlayed++;
    team2.matchesPlayed++;

    team1.goalsFor += homeGoals;
    team1.goalsAgainst += awayGoals;
    team2.goalsFor += awayGoals;
    team2.goalsAgainst += homeGoals;

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

    team1.games = team1.wins + team1.losses + team1.draws;
    team2.games = team2.wins + team2.losses + team2.draws;

    team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
    team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
  }

  updateTeamForm(team, result) {
    if (!team.form) team.form = [];
    team.form.unshift(result);
    if (team.form.length > 5) team.form.length = 5;
  }

  // --- SERIALIZATION ---------------------------------------------

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
      status: this.status,
    };
  }

  static fromJSON(json) {
    return new Tournament(json);
  }
}
