// client/js/dashboard.js – Dashboard-Logik mit DB-Anbindung

import { loadTournament } from "./api.js";

// Lokale Referenz auf das aktuelle Turnier
let activeTournament = null;

// Initialisiert das Dashboard
async function initDashboard() {
  await updateDashboard();
}

// 🔹 Turnierinfo aktualisieren
function updateTournamentInfo() {
  const infoContent = document.getElementById("tournament-info-content");

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
      <p><span class="font-medium text-white">Name:</span> ${
        activeTournament.name
      }</p>
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
  `;
}

// 🔹 Nächste Spiele anzeigen (direkt aus DB)
function generateCurrentMatches() {
  const container = document.getElementById("current-matches-content");

  if (!activeTournament || !activeTournament.groups?.length) {
    container.innerHTML = `<p class="text-gray-400 text-center py-4">Keine anstehenden Spiele</p>`;
    return;
  }

  const upcomingMatches = [];

  activeTournament.groups.forEach((group, gIdx) => {
    group.matches.forEach((match, mIdx) => {
      if (!match.played) {
        upcomingMatches.push({
          groupIndex: gIdx,
          matchIndex: mIdx,
          groupName: group.name,
          home: match.team1,
          away: match.team2,
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
              onclick="navigateToMatch('${match.groupIndex}', ${
            match.matchIndex
          })"
              class="text-xs text-accent hover:underline"
            >
              Zum Spiel
            </button>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium text-white">${
              match.home?.name || "?"
            }</span>
            <span class="mx-2 text-gray-300">vs</span>
            <span class="font-medium text-white">${
              match.away?.name || "?"
            }</span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    ${
      upcomingMatches.length > 5
        ? `<div class="mt-3 text-center">
            <button data-tab="schedule" class="text-sm text-accent hover:underline">
              + ${upcomingMatches.length - 5} weitere anzeigen
            </button>
          </div>`
        : ""
    }
  `;
}

// 🔹 Top Teams aus allen Gruppen
function generateTopTeams() {
  const container = document.getElementById("top-teams-content");

  if (!activeTournament || !activeTournament.groups?.length) {
    container.innerHTML = `<p class="text-gray-400 text-center py-4">Kein aktives Turnier</p>`;
    return;
  }

  let allTeams = [];
  activeTournament.groups.forEach((group) => {
    const sortedTeams = [...group.teams].sort((a, b) => {
      if ((b.points || 0) !== (a.points || 0))
        return (b.points || 0) - (a.points || 0);
      return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
    });

    const playoffTeams = sortedTeams.slice(
      0,
      activeTournament.playoffSpots || 0
    );
    allTeams = [...allTeams, ...playoffTeams];
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
            <th class="px-3 py-2 text-center text-xs text-gray-300">N</th>
            <th class="px-3 py-2 text-center text-xs text-gray-300">U</th>
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
              <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">${
                team.name
              }</td>
              <td class="px-3 py-2 text-center text-green-400">${
                team.wins || 0
              }</td>
              <td class="px-3 py-2 text-center text-red-400">${
                team.losses || 0
              }</td>
              <td class="px-3 py-2 text-center text-yellow-400">${
                team.draws || 0
              }</td>
              <td class="px-3 py-2 text-gray-300">${team.goalsFor || 0}:${
                team.goalsAgainst || 0
              }</td>
              <td class="px-3 py-2 font-bold text-center text-white">${
                team.points || 0
              }</td>
              <td class="px-3 py-2">
                <div class="flex space-x-1">
                  ${(team.form || [])
                    .map((result) => {
                      const colors = {
                        W: "bg-green-600 text-white",
                        L: "bg-red-600 text-white",
                        D: "bg-yellow-500 text-gray-900",
                      };
                      return `<span class="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                        colors[result] || "bg-gray-600"
                      }">${result}</span>`;
                    })
                    .join("")}
                </div>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// 🔹 Gruppenübersicht fürs Dashboard
function generateDashboardGroups() {
  const container = document.getElementById("dashboard-groups-container");
  const infoElement = document.getElementById("dashboard-groups-info");

  if (!activeTournament || !activeTournament.groups?.length) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-400">
        Kein aktives Turnier oder keine Gruppen vorhanden
      </div>
    `;
    infoElement.textContent = "Kein aktives Turnier";
    return;
  }

  infoElement.textContent = `${activeTournament.name} - Aktuelle Gruppenstände`;
  container.innerHTML = "";

  activeTournament.groups.forEach((group) => {
    const sortedTeams = [...group.teams].sort((a, b) => {
      if ((b.points || 0) !== (a.points || 0))
        return (b.points || 0) - (a.points || 0);
      return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
    });

    const groupElement = document.createElement("div");
    groupElement.className =
      "bg-primary-light rounded-lg border border-gray-800 overflow-hidden";
    groupElement.innerHTML = `
      <div class="px-4 py-2 bg-primary border-b border-gray-800">
        <h3 class="font-bold text-white">${group.name}</h3>
      </div>
      <div class="divide-y divide-gray-800">
        ${sortedTeams
          .map(
            (team, index) => `
          <div class="px-3 py-2 flex items-center justify-between ${
            index < (activeTournament.playoffSpots || 0)
              ? "bg-green-900 bg-opacity-20"
              : ""
          }">
            <span class="text-sm font-medium ${
              index < (activeTournament.playoffSpots || 0)
                ? "text-green-400"
                : "text-white"
            }">${team.name}</span>
            <span class="text-xs font-bold ${
              index < (activeTournament.playoffSpots || 0)
                ? "text-green-400"
                : "text-gray-300"
            }">${team.points || 0}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
    container.appendChild(groupElement);
  });
}

// 🔹 Navigation zu einem Spiel (öffnet Tab Spielplan)
window.navigateToMatch = function (groupIndex, matchIndex) {
  document.querySelector('[data-tab="schedule"]').click();

  setTimeout(() => {
    const matchElement = document.getElementById(
      `${groupIndex}-m${matchIndex}-home`
    );
    if (matchElement) {
      matchElement.scrollIntoView({ behavior: "smooth", block: "center" });
      matchElement.closest("tr").classList.add("bg-accent", "bg-opacity-20");
      setTimeout(() => {
        matchElement
          .closest("tr")
          .classList.remove("bg-accent", "bg-opacity-20");
      }, 2000);
    }
  }, 500);
};

// 🔹 Dashboard aktualisieren (immer frische Daten laden)
export async function updateDashboard() {
  try {
    const tournamentId = localStorage.getItem("currentTournamentId");
    if (!tournamentId) return;

    activeTournament = await loadTournament(tournamentId);

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
  const dashboardTab = document.querySelector('[data-tab="dashboard"]');
  if (dashboardTab) {
    dashboardTab.addEventListener("click", initDashboard);
  }
});
