// client/js/schedule.js

import { generateGroups } from "./groups.js";
import { updateDashboard } from "./dashboard.js";
import { showAlert } from "./ui-alert.js";

/**
 * Rendert die Spielplan-Ansicht mit Eingabefeldern für Ergebnisse.
 * Kann beliebig oft aufgerufen werden (z.B. nach Änderungen).
 */
export function generateSchedule() {
  const wrap = document.getElementById("schedule-content");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="bg-primary rounded-lg shadow-lg border border-gray-800">
      <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-2xl font-bold text-white">Spielplan</h2>
        <p id="schedule-info" class="text-sm text-gray-400 mt-1">
          ${window.tournamentData?.name || "Kein Turnier"}
        </p>
      </div>
      <div id="schedule-container" class="p-4"></div>
    </div>
  `;

  const container = document.getElementById("schedule-container");

  // Grundvalidierung
  if (
    !window.tournamentData ||
    !window.tournamentData.name ||
    !Array.isArray(window.tournamentData.groups) ||
    window.tournamentData.groups.length === 0
  ) {
    container.innerHTML = `
      <p class="text-gray-400 text-center py-8">
        Bitte zuerst ein Turnier erstellen
      </p>
    `;
    return;
  }

  container.innerHTML = "";

  window.tournamentData.groups.forEach((group, gIdx) => {
    // Abbruch, wenn keine Teams
    if (!Array.isArray(group.teams) || group.teams.length === 0) return;

    const groupDiv = document.createElement("div");
    groupDiv.className =
      "mb-8 bg-primary-light rounded-lg overflow-hidden border border-gray-800";

    groupDiv.innerHTML = `
      <div class="px-6 py-3 bg-primary border-b border-gray-800">
        <h3 class="text-lg font-bold text-white">${group.name}</h3>
      </div>
    `;

    // Matchdays erzeugen
    const matchdays = generateMatchdays(group.teams);

    matchdays.forEach((day, dIdx) => {
      const dayDiv = document.createElement("div");
      dayDiv.className = "mb-6";
      dayDiv.innerHTML = `
        <div class="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <h4 class="font-medium text-white">Spieltag ${dIdx + 1}</h4>
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

      const tbody = dayDiv.querySelector("tbody");

      day.forEach((match, mIdx) => {
        // Fallback-IDs erzeugen, falls Teamobjekte noch keine id besitzen
        const homeId = match.home.id || `${group.name}-home-${mIdx}`;
        const awayId = match.away.id || `${group.name}-away-${mIdx}`;

        const rowId = `g${gIdx}-d${dIdx}-m${mIdx}`;
        const existing = (window.tournamentData.matches || []).find(
          (m) => m.id === rowId
        );

        tbody.innerHTML += `
          <tr class="hover:bg-primary transition-colors">
            <td class="px-4 py-3 text-sm font-medium text-white">${
              match.home.name
            }</td>
            <td class="px-4 py-3 text-sm font-medium text-white">${
              match.away.name
            }</td>
            <td class="px-4 py-3">
              <div class="flex items-center space-x-2">
                <input 
                  type="number" 
                  id="${rowId}-home"
                  class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white"
                  min="0" 
                  value="${existing ? existing.homeGoals : ""}">
                <span class="text-gray-300">:</span>
                <input 
                  type="number" 
                  id="${rowId}-away"
                  class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white"
                  min="0" 
                  value="${existing ? existing.awayGoals : ""}">
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                  onclick="saveMatchResult('${rowId}', ${gIdx}, '${homeId}', '${awayId}')"
                  class="px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded-md"
                >
                  Speichern
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      groupDiv.appendChild(dayDiv);
    });

    container.appendChild(groupDiv);
  });
}

/**
 * Erstellt die Spieltage (Round-Robin, nur Hinrunde).
 * Erwartet eine Teamliste mit mindestens name (id optional).
 */
export function generateMatchdays(teams) {
  const list = (teams || []).map((t, idx) => ({
    id: t.id ?? `t-${idx}`,
    name: t.name ?? `Team ${idx + 1}`,
  }));

  if (list.length < 2) return [];

  // Bye, wenn ungerade Anzahl
  if (list.length % 2 !== 0) list.push({ id: "bye", name: "SPIELFREI" });

  const n = list.length;
  const rounds = n - 1;
  const half = n / 2;

  const fixed = list[0];
  const rotating = list.slice(1);

  const days = [];

  for (let r = 0; r < rounds; r++) {
    const matches = [];

    // Fixes Team vs. Gegner
    const opp = rotating[r % rotating.length];
    if (fixed.id !== "bye" && opp.id !== "bye") {
      matches.push(
        r % 2 === 0 ? { home: fixed, away: opp } : { home: opp, away: fixed }
      );
    }

    // Restliche Paarungen
    for (let i = 1; i < half; i++) {
      const hi = (r + i) % rotating.length;
      const ai = (r + rotating.length - i) % rotating.length;
      const H = rotating[hi];
      const A = rotating[ai];
      if (H.id !== "bye" && A.id !== "bye") {
        matches.push(i % 2 === 0 ? { home: H, away: A } : { home: A, away: H });
      }
    }

    days.push(matches);
  }

  return days;
}

/**
 * Speichert / überschreibt ein Ergebnis.
 * Eingabefelder bleiben bearbeitbar – Ergebnis ist jederzeit änderbar.
 */
window.saveMatchResult = function (rowId, groupIndex, homeId, awayId) {
  const homeInput = document.getElementById(`${rowId}-home`);
  const awayInput = document.getElementById(`${rowId}-away`);

  const homeGoals = parseInt(homeInput?.value ?? "", 10);
  const awayGoals = parseInt(awayInput?.value ?? "", 10);

  if (isNaN(homeGoals) || isNaN(awayGoals)) {
    showAlert?.("Bitte gültige Zahlen eingeben!", "error");
    return;
  }
  if (!window.tournamentData) return;

  if (!Array.isArray(window.tournamentData.matches)) {
    window.tournamentData.matches = [];
  }

  const idx = window.tournamentData.matches.findIndex((m) => m.id === rowId);
  const payload = {
    id: rowId,
    groupIndex,
    homeId,
    awayId,
    homeGoals,
    awayGoals,
    date: new Date().toISOString(),
  };

  if (idx >= 0) {
    window.tournamentData.matches[idx] = payload;
  } else {
    window.tournamentData.matches.push(payload);
  }

  // Gruppen neu berechnen + Dashboard aktualisieren (falls Module geladen)
  try {
    generateGroups?.();
    updateDashboard?.();
  } catch (_) {
    // stillschweigend ignorieren – UI wird wenigstens im Spielplan aktualisiert
  }

  showAlert?.("Ergebnis gespeichert!", "success");
};

window.saveMatchResult = function (rowId, groupIndex, homeId, awayId) {
  const homeInput = document.getElementById(`${rowId}-home`);
  const awayInput = document.getElementById(`${rowId}-away`);

  const homeGoals = parseInt(homeInput?.value ?? "", 10);
  const awayGoals = parseInt(awayInput?.value ?? "", 10);

  if (isNaN(homeGoals) || isNaN(awayGoals)) {
    showAlert?.("Bitte gültige Zahlen eingeben!", "error");
    return;
  }

  if (!window.tournamentData) return;
  if (!Array.isArray(window.tournamentData.matches)) {
    window.tournamentData.matches = [];
  }

  const idx = window.tournamentData.matches.findIndex((m) => m.id === rowId);
  const payload = {
    id: rowId,
    groupIndex,
    homeId,
    awayId,
    homeGoals,
    awayGoals,
    date: new Date().toISOString(),
  };

  if (idx >= 0) {
    window.tournamentData.matches[idx] = payload;
  } else {
    window.tournamentData.matches.push(payload);
  }

  // NEU: Gruppe neu berechnen
  recomputeGroupTable(groupIndex);

  // Gruppen + Dashboard aktualisieren
  try {
    generateGroups?.();
    updateDashboard?.();
  } catch (_) {}

  showAlert?.("Ergebnis gespeichert!", "success");
};

/**
 * Berechnet für eine Gruppe alle Team-Statistiken neu
 * anhand der gespeicherten Matches.
 */
function recomputeGroupTable(groupIndex) {
  const group = window.tournamentData.groups[groupIndex];
  if (!group) return;

  // Reset
  group.teams.forEach((team) => {
    team.wins = 0;
    team.losses = 0;
    team.draws = 0;
    team.points = 0;
    team.goalsFor = 0;
    team.goalsAgainst = 0;
    team.goalDifference = 0;
    team.matchesPlayed = 0;
    team.form = [];
  });

  // Alle Spiele dieser Gruppe durchgehen
  const matches = window.tournamentData.matches
    .filter((m) => m.groupIndex === groupIndex)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  matches.forEach((match) => {
    const homeTeam = group.teams.find((t) => t.id === match.homeId);
    const awayTeam = group.teams.find((t) => t.id === match.awayId);
    if (!homeTeam || !awayTeam) return;

    homeTeam.matchesPlayed++;
    awayTeam.matchesPlayed++;
    homeTeam.goalsFor += match.homeGoals;
    homeTeam.goalsAgainst += match.awayGoals;
    awayTeam.goalsFor += match.awayGoals;
    awayTeam.goalsAgainst += match.homeGoals;

    if (match.homeGoals > match.awayGoals) {
      homeTeam.wins++;
      awayTeam.losses++;
      homeTeam.points += 3;
      homeTeam.form.push("W");
      awayTeam.form.push("L");
    } else if (match.homeGoals < match.awayGoals) {
      awayTeam.wins++;
      homeTeam.losses++;
      awayTeam.points += 3;
      awayTeam.form.push("W");
      homeTeam.form.push("L");
    } else {
      homeTeam.draws++;
      awayTeam.draws++;
      homeTeam.points++;
      awayTeam.points++;
      homeTeam.form.push("D");
      awayTeam.form.push("D");
    }
  });

  // Finale Werte (Tordifferenz + nur letzte 3 Spiele in Form)
  group.teams.forEach((team) => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
    team.form = team.form.slice(-3).reverse();
  });
}
