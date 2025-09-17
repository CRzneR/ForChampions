// schedule.js – Spielplan-Logik mit Speicherung in DB

import { generateGroups } from "./groups.js";
import { updateDashboard } from "./dashboard.js";
import { showAlert } from "./ui-alert.js";
import { saveMatchResult, getCurrentTournament } from "./api.js"; // API-Call + Tournament-Getter

/**
 * Rendert die Spielplan-Ansicht mit Eingabefeldern für Ergebnisse.
 */
export function generateSchedule() {
  const wrap = document.getElementById("schedule-content");
  if (!wrap) return;

  const data = getCurrentTournament();

  wrap.innerHTML = `
    <div class="bg-primary rounded-lg shadow-lg border border-gray-800">
      <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-2xl font-bold text-white">Spielplan</h2>
        <p id="schedule-info" class="text-sm text-gray-400 mt-1">
          ${data?.name || "Kein Turnier"}
        </p>
      </div>
      <div id="schedule-container" class="p-4"></div>
    </div>
  `;

  const container = document.getElementById("schedule-container");

  if (!data?.groups?.length) {
    container.innerHTML = `
      <p class="text-gray-400 text-center py-8">
        Bitte zuerst ein Turnier erstellen
      </p>
    `;
    return;
  }

  container.innerHTML = "";

  data.groups.forEach((group, gIdx) => {
    if (!group.teams?.length) return;

    const groupDiv = document.createElement("div");
    groupDiv.className =
      "mb-8 bg-primary-light rounded-lg overflow-hidden border border-gray-800";

    groupDiv.innerHTML = `
      <div class="px-6 py-3 bg-primary border-b border-gray-800">
        <h3 class="text-lg font-bold text-white">${group.name}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-800">
          <thead class="bg-primary">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Heim</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Gast</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ergebnis</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Aktion</th>
            </tr>
          </thead>
          <tbody class="bg-primary-light divide-y divide-gray-800"></tbody>
        </table>
      </div>
    `;

    const tbody = groupDiv.querySelector("tbody");

    (group.matches || []).forEach((match, mIdx) => {
      const rowId = `${gIdx}-m${mIdx}`;
      const score1 = match.score1 ?? "";
      const score2 = match.score2 ?? "";

      tbody.innerHTML += `
        <tr class="hover:bg-primary transition-colors">
          <td class="px-4 py-3 text-sm font-medium text-white">${
            match.team1?.name || "?"
          }</td>
          <td class="px-4 py-3 text-sm font-medium text-white">${
            match.team2?.name || "?"
          }</td>
          <td class="px-4 py-3">
            <div class="flex items-center space-x-2">
              <input 
                type="number" 
                id="${rowId}-home"
                class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white"
                min="0" 
                value="${score1}">
              <span class="text-gray-300">:</span>
              <input 
                type="number" 
                id="${rowId}-away"
                class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white"
                min="0" 
                value="${score2}">
            </div>
          </td>
          <td class="px-4 py-3">
            <button
              onclick="saveMatchResultHandler('${data._id}', ${gIdx}, ${mIdx})"
              class="px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded-md"
            >
              Speichern
            </button>
          </td>
        </tr>
      `;
    });

    container.appendChild(groupDiv);
  });
}

/**
 * Ergebnis speichern über API
 */
window.saveMatchResultHandler = async function (
  tournamentId,
  groupIndex,
  matchIndex
) {
  const homeInput = document.getElementById(
    `${groupIndex}-m${matchIndex}-home`
  );
  const awayInput = document.getElementById(
    `${groupIndex}-m${matchIndex}-away`
  );

  const homeGoals = parseInt(homeInput?.value ?? "", 10);
  const awayGoals = parseInt(awayInput?.value ?? "", 10);

  if (isNaN(homeGoals) || isNaN(awayGoals)) {
    showAlert("Bitte gültige Zahlen eingeben!", "error");
    return;
  }

  try {
    // 🔹 Ergebnis in DB speichern
    const updatedTournament = await saveMatchResult(tournamentId, {
      groupIndex,
      matchIndex,
      score1: homeGoals,
      score2: awayGoals,
    });

    // Lokale Daten aktualisieren
    window.tournamentData = updatedTournament;

    // UI neu aufbauen
    generateGroups();
    updateDashboard();

    showAlert("Ergebnis gespeichert!", "success");
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
    showAlert("Fehler beim Speichern des Ergebnisses", "error");
  }
};
