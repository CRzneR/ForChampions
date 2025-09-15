// --- Globale Daten absichern ---
if (!window.tournamentData) {
  window.tournamentData = {
    name: "",
    teams: [],
    groups: [],
    matches: [],
    playoffSpots: 0,
    teamNames: [],
  };
} else {
  window.tournamentData.groups ||= [];
  window.tournamentData.matches ||= [];
  window.tournamentData.teams ||= [];
}

// --- Initialisierung der Turnierdaten ---
export function initializeTournamentData() {
  // Reset
  window.tournamentData.groups = [];
  window.tournamentData.matches = [];
  window.tournamentData.teams = [];

  const { teamNames = [], groupCount: rawGroupCount } = window.tournamentData;
  const groupCount = Math.max(1, rawGroupCount || 1);

  // Teams mischen
  const shuffled = [...teamNames].sort(() => Math.random() - 0.5);

  // Teams mit IDs bauen
  window.tournamentData.teams = shuffled.map((name, idx) => ({
    id: `team-${idx}`,
    name,
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    form: [],
    matchesPlayed: 0,
    games: 0,
  }));

  // Gruppen anlegen
  for (let i = 0; i < groupCount; i++) {
    window.tournamentData.groups.push({
      name: `Gruppe ${String.fromCharCode(65 + i)}`,
      teams: [],
      matches: [],
    });
  }

  // Teams gleichmäßig verteilen
  window.tournamentData.teams.forEach((team, idx) => {
    const g = idx % groupCount;
    window.tournamentData.groups[g].teams.push(team);
  });
}

// --- Gruppen rendern ---
export function generateGroups() {
  const root = document.getElementById("groups-content");
  if (!root) return;

  if (
    !window.tournamentData.name ||
    window.tournamentData.groups.length === 0
  ) {
    root.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        Kein aktives Turnier oder keine Gruppen vorhanden
      </div>
    `;
    return;
  }

  root.innerHTML = "";
  window.tournamentData.groups.forEach((group) => {
    const sorted = [...group.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
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
                  t.wins
                }</td>
                <td class="px-4 py-2 text-sm text-center text-yellow-400">${
                  t.draws
                }</td>
                <td class="px-4 py-2 text-sm text-center text-red-400">${
                  t.losses
                }</td>
                <td class="px-4 py-2 text-sm text-center text-gray-300">${
                  t.goalsFor
                }:${t.goalsAgainst}</td>
                <td class="px-4 py-2 text-sm font-bold text-center text-white">${
                  t.points
                }</td>
                <td class="px-4 py-2 text-sm text-center">
                  <div class="flex space-x-1 justify-center">
                    ${t.form
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
}

// optional global
window.generateGroups = generateGroups;
