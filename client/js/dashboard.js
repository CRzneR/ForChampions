import { refreshTournament, getCurrentTournament, deleteTournament } from "./api.js";
import { initAuth } from "./auth.js";
import { showAlert } from "./ui-alert.js";

let activeTournament = null;

// Initialisiert das Dashboard
async function initDashboard() {
  await updateDashboard();
}

// Aktualisiert die Turnierinfo
function updateTournamentInfo() {
  const infoContent = document.getElementById("tournament-info-content");
  if (!infoContent) return;

  if (!activeTournament) {
    infoContent.innerHTML = `
      <p class="text-gray-400">Kein aktives Turnier</p>
      <button 
        data-tab="create"
        class="mt-4 px-4 py-2 bg-gradient-to-r from-[#CA5818] to-[#EF1475] text-white rounded-md hover:opacity-90 transition"
      >
        Turnier erstellen
      </button>
    `;
    return;
  }

  infoContent.innerHTML = `
    <div class="space-y-2">
      <p><span class="font-medium text-white">Name:</span> ${activeTournament.name}</p>
      <p><span class="font-medium text-white">Teams:</span> ${
        activeTournament.teams?.length || 0
      }</p>
      <p><span class="font-medium text-white">Gruppen:</span> ${
        activeTournament.groups?.length || 0
      }</p>
      <p><span class="font-medium text-white">Playoff-Plätze:</span> ${
        activeTournament.playoffSpots || 0
      }</p>
      <p><span class="font-medium text-white">Status:</span> ${
        activeTournament.status || "In Vorbereitung"
      }</p>
    </div>

    <!-- ✅ Turnier löschen Button -->
    <div class="mt-5 pt-4 border-t border-white/10">
      <button
        id="deleteTournamentBtn"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 border border-red-600/30 transition"
      >
        <i data-lucide="trash-2" class="w-4 h-4"></i>
        Turnier löschen
      </button>
    </div>

    <!-- ✅ Bestätigungs-Dialog (versteckt) -->
    <div id="deleteConfirmBox" class="hidden mt-3 p-3 rounded-lg bg-red-900/30 border border-red-600/40">
      <p class="text-sm text-red-300 mb-3">Turnier wirklich löschen? Dies kann nicht rückgängig gemacht werden.</p>
      <div class="flex gap-2">
        <button
          id="confirmDeleteBtn"
          class="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
        >
          Ja, löschen
        </button>
        <button
          id="cancelDeleteBtn"
          class="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-lg transition"
        >
          Abbrechen
        </button>
      </div>
    </div>
  `;

  // Lucide Icons neu rendern
  if (window.lucide) lucide.createIcons();

  // Event Listeners
  document.getElementById("deleteTournamentBtn").addEventListener("click", () => {
    document.getElementById("deleteConfirmBox").classList.toggle("hidden");
  });

  document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
    document.getElementById("deleteConfirmBox").classList.add("hidden");
  });

  document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
    try {
      await deleteTournament(activeTournament._id);
      activeTournament = null;

      // UI zurücksetzen
      updateTournamentInfo();
      generateDashboardGroups();
      generateCurrentMatches();
      generateTopTeams();

      showAlert("Turnier erfolgreich gelöscht!", "success");
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      showAlert("Fehler beim Löschen des Turniers", "error");
    }
  });
}

// Zeigt die nächsten Spiele
function generateCurrentMatches() {
  const container = document.getElementById("current-matches-content");
  if (!container) return;

  if (!activeTournament || !Array.isArray(activeTournament.groups)) {
    container.innerHTML = `<p class="text-gray-400 text-center py-4">Keine anstehenden Spiele</p>`;
    return;
  }

  const upcomingMatches = [];

  activeTournament.groups.forEach((group, groupIndex) => {
    const matches = Array.isArray(group.matches) ? group.matches : [];

    matches.forEach((match, matchIndex) => {
      if (match.score1 == null && match.score2 == null) {
        upcomingMatches.push({
          groupIndex,
          matchIndex,
          groupName: group.name,
          team1: match.team1?.name || "?",
          team2: match.team2?.name || "?",
        });
      }
    });
  });

  const nextMatches = upcomingMatches.slice(0, 5);

  if (nextMatches.length === 0) {
    container.innerHTML = `<p class="text-gray-400 text-center py-4">Keine anstehenden Spiele</p>`;
    return;
  }

  container.innerHTML = `
    <div class="space-y-3">
      ${nextMatches
        .map(
          (match) => `
        <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-accent transition-colors">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-400">${match.groupName}</span>
            <button 
              onclick="navigateToMatch(${match.groupIndex}, ${match.matchIndex})"
              class="text-xs text-accent hover:underline"
            >
              Zum Spiel
            </button>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium text-white">${match.team1}</span>
            <span class="mx-2 text-gray-300">vs</span>
            <span class="font-medium text-white">${match.team2}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    ${
      upcomingMatches.length > 5
        ? `<div class="mt-3 text-center"><button data-tab="schedule" class="text-sm text-accent hover:underline">+ ${
            upcomingMatches.length - 5
          } weitere anzeigen</button></div>`
        : ""
    }
  `;
}

// Zeigt die Top Teams
function generateTopTeams() {
  const container = document.getElementById("top-teams-content");
  if (!container) return;

  if (
    !activeTournament ||
    !Array.isArray(activeTournament.groups) ||
    (activeTournament.playoffSpots || 0) <= 0
  ) {
    container.innerHTML = `<p class="text-gray-400 text-center py-4">${
      activeTournament?.playoffSpots <= 0
        ? "Keine Playoff-Plätze definiert"
        : "Kein aktives Turnier"
    }</p>`;
    return;
  }

  let allTeams = [];
  const spotsPerGroup = activeTournament.playoffSpots;

  activeTournament.groups.forEach((group) => {
    const teams = Array.isArray(group.teams) ? group.teams : [];
    if (!teams.length) return;

    const sortedTeams = [...teams].sort((a, b) => {
      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
      const diffA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
      const diffB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
      return diffB - diffA;
    });

    const playoffTeams = sortedTeams.slice(0, spotsPerGroup);
    allTeams = [...allTeams, ...playoffTeams];
  });

  allTeams.sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
    const diffA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
    const diffB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
    return diffB - diffA;
  });

  if (allTeams.length === 0) {
    container.innerHTML = `<p class="text-gray-400 text-center py-4">Keine Teams auf Playoff-Plätzen</p>`;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-800">
        <thead class="bg-primary">
          <tr>
            <th class="px-3 py-2 text-left text-xs text-gray-300">Team</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">S</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">U</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">N</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">Tore</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">Pkt.</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">Form</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          ${allTeams
            .map(
              (team) => `
            <tr class="hover:bg-primary transition-colors">
              <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">${team.name}</td>
              <td class="px-3 py-2 text-center text-green-400">${team.wins || 0}</td>
              <td class="px-3 py-2 text-center text-yellow-400">${team.draws || 0}</td>
              <td class="px-3 py-2 text-center text-red-400">${team.losses || 0}</td>
              <td class="px-3 py-2 text-gray-300">${team.goalsFor || 0}:${team.goalsAgainst || 0}</td>
              <td class="px-3 py-2 font-bold text-center text-white">${team.points || 0}</td>
              <td class="px-3 py-2">
                <div class="flex space-x-1">
                  ${(team.form || [])
                    .map((result) => {
                      const colors = {
                        W: "bg-green-600 text-white",
                        D: "bg-yellow-500 text-gray-900",
                        L: "bg-red-600 text-white",
                      };
                      return `<span class="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                        colors[result] || "bg-gray-600"
                      }">${result}</span>`;
                    })
                    .join("")}
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// Generiert die Gruppenansicht (kompakte Version fürs Dashboard)
function generateDashboardGroups() {
  const container = document.getElementById("dashboard-groups-container");
  const infoElement = document.getElementById("dashboard-groups-info");
  if (!container) return;

  if (!activeTournament || !Array.isArray(activeTournament.groups)) {
    container.innerHTML = `<div class="col-span-full text-center py-8 text-gray-400">Kein aktives Turnier oder keine Gruppen vorhanden</div>`;
    if (infoElement) infoElement.textContent = "Kein aktives Turnier";
    return;
  }

  if (infoElement) infoElement.textContent = `${activeTournament.name} - Aktuelle Gruppenstände`;
  container.innerHTML = "";

  const spotsPerGroup = activeTournament.playoffSpots || 0;

  activeTournament.groups.forEach((group) => {
    const teams = Array.isArray(group.teams) ? [...group.teams] : [];
    teams.sort((a, b) => (b.points || 0) - (a.points || 0));

    const groupElement = document.createElement("div");
    groupElement.className = "bg-primary-light rounded-lg border border-gray-800 overflow-hidden";
    groupElement.innerHTML = `
      <div class="px-4 py-2 bg-primary border-b border-gray-800">
        <h3 class="font-bold text-white">${group.name}</h3>
      </div>
      <div class="divide-y divide-gray-800">
        ${
          teams.length === 0
            ? `<div class="px-3 py-2 text-sm text-gray-400">Keine Teams in dieser Gruppe</div>`
            : teams
                .map(
                  (team, index) => `
          <div class="px-3 py-2 flex items-center justify-between ${
            index < spotsPerGroup ? "bg-green-900 bg-opacity-20" : ""
          }">
            <span class="text-sm font-medium ${
              index < spotsPerGroup ? "text-green-400" : "text-white"
            }">${team.name}</span>
            <span class="text-xs font-bold ${
              index < spotsPerGroup ? "text-green-400" : "text-gray-300"
            }">${team.points || 0}</span>
          </div>
        `,
                )
                .join("")
        }
      </div>
    `;
    container.appendChild(groupElement);
  });
}

// Navigation zu einem Spiel
window.navigateToMatch = function (groupIndex, matchIndex) {
  const gIdx = Number(groupIndex);
  const mIdx = Number(matchIndex);
  if (Number.isNaN(gIdx) || Number.isNaN(mIdx)) return;

  document.querySelector('[data-tab="schedule"]')?.click();

  setTimeout(() => {
    const matchElement = document.getElementById(`${gIdx}-m${mIdx}-home`);
    if (matchElement) {
      matchElement.scrollIntoView({ behavior: "smooth", block: "center" });
      const row = matchElement.closest("tr");
      if (row) {
        row.classList.add("bg-accent", "bg-opacity-20");
        setTimeout(() => row.classList.remove("bg-accent", "bg-opacity-20"), 2000);
      }
    }
  }, 500);
};

// Dashboard updaten
export async function updateDashboard() {
  try {
    await refreshTournament();
    activeTournament = getCurrentTournament();

    updateTournamentInfo();
    generateDashboardGroups();
    generateCurrentMatches();
    generateTopTeams();
  } catch (err) {
    console.error("Fehler beim Dashboard-Update:", err);
  }
}

// Tab-Listener
document.addEventListener("DOMContentLoaded", () => {
  initAuth({ requireLogin: true });
  const dashboardTab = document.querySelector('[data-tab="dashboard"]');
  if (dashboardTab) {
    dashboardTab.addEventListener("click", initDashboard);
  }
});
