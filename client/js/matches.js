import { tournamentData } from "./data.js";

function updateTeamForm(team, result) {
  team.form.unshift(result);
  if (team.form.length > 3) team.form.pop();
}

function removeTeamForm(team) {
  if (team.form.length > 0) team.form.shift();
}

export function updateTeamStats(
  groupIndex,
  team1Index,
  team2Index,
  homeGoals,
  awayGoals
) {
  const group = tournamentData.groups[groupIndex];
  const team1 = group.teams[team1Index];
  const team2 = group.teams[team2Index];

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
    updateTeamForm(team1, "W");
    updateTeamForm(team2, "L");
  } else if (homeGoals < awayGoals) {
    team1.losses++;
    team2.wins++;
    team2.points += 3;
    updateTeamForm(team1, "L");
    updateTeamForm(team2, "W");
  } else {
    team1.draws++;
    team2.draws++;
    team1.points++;
    team2.points++;
    updateTeamForm(team1, "D");
    updateTeamForm(team2, "D");
  }

  team1.games = team1.wins + team1.losses + team1.draws;
  team2.games = team2.wins + team2.losses + team2.draws;
  team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
  team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
}

export function removeMatchResults(groupIndex, team1Index, team2Index) {
  const group = tournamentData.groups[groupIndex];
  const team1 = group.teams[team1Index];
  const team2 = group.teams[team2Index];

  const match = tournamentData.matches.find(
    (m) =>
      m.groupIndex === groupIndex &&
      m.team1Index === team1Index &&
      m.team2Index === team2Index
  );

  if (!match) return;

  team1.matchesPlayed--;
  team2.matchesPlayed--;
  team1.goalsFor -= match.homeGoals;
  team1.goalsAgainst -= match.awayGoals;
  team2.goalsFor -= match.awayGoals;
  team2.goalsAgainst -= match.homeGoals;

  if (match.homeGoals > match.awayGoals) {
    team1.wins--;
    team2.losses--;
    team1.points -= 3;
    removeTeamForm(team1);
    removeTeamForm(team2);
  } else if (match.homeGoals < match.awayGoals) {
    team1.losses--;
    team2.wins--;
    team2.points -= 3;
    removeTeamForm(team1);
    removeTeamForm(team2);
  } else {
    team1.draws--;
    team2.draws--;
    team1.points--;
    team2.points--;
    removeTeamForm(team1);
    removeTeamForm(team2);
  }

  team1.games = team1.wins + team1.losses + team1.draws;
  team2.games = team2.wins + team2.losses + team2.draws;
  team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
  team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
}
