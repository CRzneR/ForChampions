// client/js/groups.js – Gruppenansicht mit DB-Daten

import { loadTournament } from "./api.js";

let activeTournament = null;

// --- Gruppen aus DB laden und rendern ---
export async function generateGroups() {
  const root = document.getElementById("groups-content");
  if (!root) return;

  try {
    const tournamentId = localStorage.getItem("currentTournamentId");
    if (!tournamentId) {
      root.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          Kein aktives Turnier ausgewählt
        </div>
      `;
      return;
    }

    // 🔹 Turnier aus DB laden
    activeTournament = await loadTournament(tournamentId);

    if (
      !activeTournament ||
      !activeTournament.groups ||
      activeTournament.groups.length === 0
    ) {
      root.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          Kein aktives Turnier oder keine Gruppen vorhanden
        </div>
      `;
      return;
    }

    root.innerHTML = "";

    activeTournament.groups.forEach((group) => {
      const sorted = [...(group.teams || [])].sort((a, b) => {
        if ((b.points || 0) !== (a.points || 0))
          return (b.points || 0) - (a.points || 0);
        const diffA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
        const diffB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
        return diffB - diffA;
      });

      const el = document.createElement("div");
      el.className =
        "mb-8 bg-primary-light rounded-lg overflow-hidden border border-gray-800";
      el.innerHTML = `
        <div class="px-6 py-3 bg-primary border-b border-gray-800">
          <h3 class="text-lg font-bold text-white">${group.name}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-800">
            <thead class="bg-primary">
              <tr>
                <th class="px-4 py-2 text-left text-xs text-gray-300">Team</th>
                <th class="px-4 py-2 text-center text-xs text-gray-300">S</th>
                <th class="px-4 py-2 text-center text-xs text-gray-300">U</th>
                <th class="px-4 py-2 text-center text-xs text-gray-300">N</th>
                <th class="px-4 py-2 text-center text-xs text-gray-300">Tore</th>
                <th class="px-4 py-2 text-center text-xs text-gray-300">Pkt.</th>
                <th class="px-4 py-2 text-center text-xs text-gray-300">Form</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              ${sorted
                .map(
                  (t) => `
                <tr class="hover:bg-primary transition-colors">
                  <td class="px-4 py-2 text-sm font-medium text-white">${
                    t.name
                  }</td>
                  <td class="px-4 py-2 text-sm text-center text-green-400">${
                    t.wins || 0
                  }</td>
                  <td class="px-4 py-2 text-sm text-center text-yellow-400">${
                    t.draws || 0
                  }</td>
                  <td class="px-4 py-2 text-sm text-center text-red-400">${
                    t.losses || 0
                  }</td>
                  <td class="px-4 py-2 text-sm text-center text-gray-300">${
                    t.goalsFor || 0
                  }:${t.goalsAgainst || 0}</td>
                  <td class="px-4 py-2 text-sm font-bold text-center text-white">${
                    t.points || 0
                  }</td>
                  <td class="px-4 py-2 text-sm text-center">
                    <div class="flex space-x-1 justify-center">
                      ${(t.form || [])
                        .map((res) => {
                          const colors = {
                            W: "bg-green-600 text-white",
                            D: "bg-yellow-500 text-gray-900",
                            L: "bg-red-600 text-white",
                          };
                          return `<span class="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                            colors[res] || "bg-gray-600"
                          }">${res}</span>`;
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
      root.appendChild(el);
    });
  } catch (err) {
    console.error("Fehler beim Laden der Gruppen:", err);
    root.innerHTML = `
      <div class="text-center py-8 text-red-400">
        Fehler beim Laden der Gruppen
      </div>
    `;
  }
}

// optional global
window.generateGroups = generateGroups;
