export function initBestlist(tournament) {
  const container = document.getElementById("bestlist-content");
  if (!container) return;

  // Alle Teams aus allen Gruppen sammeln
  const allTeams = [];
  tournament.groups.forEach((group) => {
    group.teams.forEach((team) => {
      if (!allTeams.find((t) => t._id === team._id)) {
        allTeams.push(team);
      }
    });
  });

  // Sortieren: Punkte → Tordifferenz → Tore
  allTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });

  container.innerHTML = `
    <div class="card-clean soft-shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <i data-lucide="trophy" class="w-5 h-5 text-yellow-400"></i>
        <h2 class="text-xl font-semibold">Bestenliste</h2>
        <span class="text-sm text-gray-400 ml-1">${tournament.name}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-white/10">
              <th class="px-6 py-3 text-left w-8">#</th>
              <th class="px-4 py-3 text-left">Team</th>
              <th class="px-4 py-3 text-center">Sp</th>
              <th class="px-4 py-3 text-center">S</th>
              <th class="px-4 py-3 text-center">U</th>
              <th class="px-4 py-3 text-center">N</th>
              <th class="px-4 py-3 text-center">Tore</th>
              <th class="px-4 py-3 text-center">Diff</th>
              <th class="px-4 py-3 text-center font-bold text-white">Pkt</th>
            </tr>
          </thead>
          <tbody>
            ${allTeams
              .map((team, index) => {
                const played = team.wins + team.draws + team.losses;
                const diff = team.goalsFor - team.goalsAgainst;
                const isTop = index < tournament.playoffSpots;
                const rowBg = index % 2 === 0 ? "bg-white/[0.02]" : "";
                const medal =
                  index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1;

                return `
                <tr class="${rowBg} border-b border-white/5 hover:bg-white/5 transition">
                  <td class="px-6 py-3 text-center">
                    ${
                      isTop
                        ? `<span class="text-xs font-bold text-green-400">${medal}</span>`
                        : `<span class="text-gray-500">${medal}</span>`
                    }
                  </td>
                  <td class="px-4 py-3 font-medium text-gray-200">${team.name}</td>
                  <td class="px-4 py-3 text-center text-gray-400">${played}</td>
                  <td class="px-4 py-3 text-center text-green-400">${team.wins}</td>
                  <td class="px-4 py-3 text-center text-yellow-400">${team.draws}</td>
                  <td class="px-4 py-3 text-center text-red-400">${team.losses}</td>
                  <td class="px-4 py-3 text-center text-gray-300">${team.goalsFor}:${team.goalsAgainst}</td>
                  <td class="px-4 py-3 text-center ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-400"}">
                    ${diff > 0 ? "+" : ""}${diff}
                  </td>
                  <td class="px-4 py-3 text-center font-bold text-white">${team.points}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="px-6 py-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
        <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
        Playoff-Qualifikation (Top ${tournament.playoffSpots})
      </div>
    </div>
  `;

  lucide.createIcons();
}
