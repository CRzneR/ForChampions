// ✅ OVERRIDE: Korrigiere alle API Aufrufe zu relativen Pfaden
(function () {
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    // Ersetze alle localhost:3001 Aufrufe
    if (typeof args[0] === "string") {
      if (args[0].includes("localhost:3001")) {
        args[0] = args[0].replace("http://localhost:3001", "");
        console.log("Fixed API call:", args[0]);
      }
      // Auch andere Localhost Varianten abfangen
      else if (args[0].includes("127.0.0.1:3001")) {
        args[0] = args[0].replace("http://127.0.0.1:3001", "");
        console.log("Fixed API call:", args[0]);
      }
    }
    return originalFetch.apply(this, args);
  };
})();

// Tournament Data Management
const tournamentData = {
  name: "",
  teamCount: 0,
  groupCount: 0,
  playoffSpots: 0,
  groups: [],
  matches: [],
};

// DOM-Elemente
const loginContainer = document.getElementById("loginContainer");
const mainApp = document.getElementById("mainApp");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginFormElement = document.getElementById("loginFormElement");
const registerFormElement = document.getElementById("registerFormElement");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const loginErrorText = document.getElementById("loginErrorText");
const registerErrorText = document.getElementById("registerErrorText");
const serverStatus = document.getElementById("serverStatus");
const serverStatusText = document.getElementById("serverStatusText");
const logoutButton = document.getElementById("logoutButton");
const usernameDisplay = document.getElementById("usernameDisplay");

// Prüfen ob bereits eingeloggt
function checkLoginStatus() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    showMainApp(user);
    return true;
  }
  return false;
}

// Haupt-App anzeigen
function showMainApp(user) {
  if (loginContainer) loginContainer.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");
  if (usernameDisplay) {
    usernameDisplay.textContent = user.username;
  }

  // Tournament-UI initialisieren
  initializeTournamentUI();
}

// Logout-Funktion
function logout() {
  auth.logout();
  if (mainApp) mainApp.classList.add("hidden");
  if (loginContainer) loginContainer.classList.remove("hidden");
  resetForms();
}

// Formulare zurücksetzen
function resetForms() {
  if (loginFormElement) loginFormElement.reset();
  if (registerFormElement) registerFormElement.reset();
  resetErrors();
}

// Fehler zurücksetzen
function resetErrors() {
  if (loginError) loginError.classList.add("hidden");
  if (registerError) registerError.classList.add("hidden");
}

// Serververbindung testen
async function testServerConnection() {
  try {
    if (serverStatus) {
      serverStatus.classList.remove("hidden");
      serverStatus.classList.remove("bg-green-900", "bg-red-900");
      serverStatus.classList.add("bg-yellow-900");
      serverStatusText.innerHTML =
        '<i class="fas fa-sync-alt fa-spin mr-2"></i> Verbindung zum Server wird hergestellt...';
    }

    const response = await fetch("/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      if (serverStatus) {
        serverStatus.classList.remove("bg-yellow-900");
        serverStatus.classList.add("bg-green-900");
        serverStatusText.innerHTML =
          '<i class="fas fa-check-circle mr-2"></i> Verbindung zum Server erfolgreich';

        setTimeout(() => {
          serverStatus.classList.add("hidden");
        }, 3000);
      }
    } else {
      throw new Error("Server responded with error");
    }
  } catch (error) {
    if (serverStatus) {
      serverStatus.classList.remove("bg-yellow-900");
      serverStatus.classList.add("bg-red-900");
      serverStatusText.innerHTML =
        '<i class="fas fa-exclamation-triangle mr-2"></i> Keine Verbindung zum Server. Stelle sicher, dass der Server läuft.';
    }
  }
}

// Login-Formular
if (loginFormElement) {
  loginFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Loading-State anzeigen
    const submitBtn = loginFormElement.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Wird angemeldet...";
    submitBtn.disabled = true;

    const result = await auth.login(email, password);

    if (result.success) {
      showMainApp(auth.user);
    } else {
      loginErrorText.textContent = result.message;
      loginError.classList.remove("hidden");
    }

    // Loading-State zurücksetzen
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

// Registrierungs-Formular
if (registerFormElement) {
  registerFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;

    // Loading-State anzeigen
    const submitBtn = registerFormElement.querySelector(
      'button[type="submit"]'
    );
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Wird registriert...";
    submitBtn.disabled = true;

    const result = await auth.register(
      username,
      email,
      password,
      confirmPassword
    );

    if (result.success) {
      showMainApp(auth.user);
    } else {
      registerErrorText.textContent = result.message;
      registerError.classList.remove("hidden");
    }

    // Loading-State zurücksetzen
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

// Logout-Button
if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

// Tab-Wechsel
if (loginTab && registerTab) {
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("text-[#CA5818]", "border-[#CA5818]");
    loginTab.classList.remove("text-gray-500");
    registerTab.classList.add("text-gray-500");
    registerTab.classList.remove("text-[#CA5818]", "border-[#CA5818]");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    resetErrors();
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("text-[#CA5818]", "border-[#CA5818]");
    registerTab.classList.remove("text-gray-500");
    loginTab.classList.add("text-gray-500");
    loginTab.classList.remove("text-[#CA5818]", "border-[#CA5818]");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    resetErrors();
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = checkLoginStatus();

  if (!isLoggedIn) {
    testServerConnection();
  } else {
    setupTabNavigation();
    initializeModules();
    document.querySelector('[data-tab="dashboard"]').click();
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

function setupTabNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active state from all tabs
      tabs.forEach((t) => {
        t.classList.remove("bg-[#99491C]", "text-white");
        t.classList.add("hover:bg-[#99491C]", "text-gray-300");
      });

      // Add active state to clicked tab
      this.classList.add("bg-[#99491C]", "text-white");
      this.classList.remove("hover:bg-[#99491C]", "text-gray-300");

      // Hide all tab contents
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.add("hidden");
      });

      // Show selected tab content
      const tabId = this.getAttribute("data-tab");
      const contentElement = document.getElementById(tabId + "-content");
      if (contentElement) {
        contentElement.classList.remove("hidden");
      }
    });
  });
}

function initializeModules() {
  if (typeof initCreateModule === "function") initCreateModule();
  if (typeof initGroupsModule === "function") initGroupsModule();
  if (typeof initScheduleModule === "function") initScheduleModule();
  if (typeof initPlayoffsModule === "function") initPlayoffsModule();
  if (typeof initDashboardModule === "function") initDashboardModule();
}

function initializeTournamentUI() {
  setupTabNavigation();
  initializeModules();

  // Automatically show dashboard after login
  const dashboardTab = document.querySelector('[data-tab="dashboard"]');
  if (dashboardTab) {
    dashboardTab.click();
  }
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
