// app.js - Main Application Logic for Tournament Manager

const tournamentData = {
  name: "",
  teamCount: 0,
  groupCount: 0,
  playoffSpots: 0,
  groups: [],
  matches: [],
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  setupTabNavigation();
  initializeModules();
  document.querySelector('[data-tab="create"]').click();
});

function setupTabNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active state from all tabs
      tabs.forEach((t) =>
        t.classList.replace("bg-accent", "hover:bg-primary-light")
      );

      // Add active state to clicked tab
      this.classList.add("bg-accent", "text-white");
      this.classList.remove("hover:bg-primary-light", "text-gray-300");

      // Hide all tab contents
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.add("hidden");
      });

      // Show selected tab content
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId + "-content").classList.remove("hidden");
    });
  });
}

function initializeModules() {
  initCreateModule();
  initGroupsModule();
  initScheduleModule();
  initPlayoffsModule();
  initDashboardModule();
}

function initializeTournamentData() {
  tournamentData.groups = [];
  tournamentData.matches = [];

  const teamsPerGroup = Math.floor(
    tournamentData.teamCount / tournamentData.groupCount
  );
  const remainingTeams = tournamentData.teamCount % tournamentData.groupCount;

  let nameIndex = 0; // Laufender Index für die Teamnamen

  for (let i = 0; i < tournamentData.groupCount; i++) {
    const groupTeams = i < remainingTeams ? teamsPerGroup + 1 : teamsPerGroup;
    const group = {
      name: `Gruppe ${String.fromCharCode(65 + i)}`,
      teams: [],
    };

    for (let j = 0; j < groupTeams; j++) {
      group.teams.push({
        id: `team-${i}-${j}`,
        name:
          tournamentData.teamNames &&
          tournamentData.teamNames.length > nameIndex
            ? tournamentData.teamNames[nameIndex]
            : `Team ${nameIndex + 1}`,
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
    tournamentData.groups.push(group);
  }
}

function updateTeamStats(
  groupIndex,
  team1Index,
  team2Index,
  homeGoals,
  awayGoals
) {
  const group = tournamentData.groups[groupIndex];
  const team1 = group.teams[team1Index];
  const team2 = group.teams[team2Index];

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
    team1.points += 1;
    team2.points += 1;
    updateTeamForm(team1, "D");
    updateTeamForm(team2, "D");
  }

  // Recalculate derived stats
  team1.games = team1.wins + team1.losses + team1.draws;
  team2.games = team2.wins + team2.losses + team2.draws;
  team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
  team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
}

function removeMatchResults(groupIndex, team1Index, team2Index) {
  const group = tournamentData.groups[groupIndex];
  const team1 = group.teams[team1Index];
  const team2 = group.teams[team2Index];

  // Find the match in tournamentData.matches
  const match = tournamentData.matches.find(
    (m) =>
      m.groupIndex === groupIndex &&
      m.team1Index === team1Index &&
      m.team2Index === team2Index
  );

  if (!match) return;

  // Decrement match counts
  team1.matchesPlayed--;
  team2.matchesPlayed--;

  // Remove goals
  team1.goalsFor -= match.homeGoals;
  team1.goalsAgainst -= match.awayGoals;
  team2.goalsFor -= match.awayGoals;
  team2.goalsAgainst -= match.homeGoals;

  // Remove results
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
    team1.points -= 1;
    team2.points -= 1;
    removeTeamForm(team1);
    removeTeamForm(team2);
  }

  // Recalculate derived stats
  team1.games = team1.wins + team1.losses + team1.draws;
  team2.games = team2.wins + team2.losses + team2.draws;
  team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
  team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
}

function updateTeamForm(team, result) {
  team.form.unshift(result);
  if (team.form.length > 3) {
    team.form.pop();
  }
}

function removeTeamForm(team) {
  if (team.form.length > 0) {
    team.form.shift();
  }
}

function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  }`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Make functions available globally
window.tournamentData = tournamentData;
window.initializeTournamentData = initializeTournamentData;
window.updateTeamStats = updateTeamStats;
window.removeMatchResults = removeMatchResults;
window.showAlert = showAlert;
