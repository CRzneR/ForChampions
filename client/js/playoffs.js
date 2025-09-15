// Sehr einfache Placeholder-Ansicht, damit der Tab etwas zeigt
export function generatePlayoffs() {
  const root = document.getElementById("playoffs-content");
  if (!root) return;

  if (!window.tournamentData.name || !window.tournamentData.groups?.length) {
    root.innerHTML = `
        <div class="bg-primary rounded-lg shadow-lg border border-gray-800 p-6">
          <h2 class="text-2xl font-bold text-white mb-2">Playoffs</h2>
          <p class="text-gray-400">Erstelle zuerst ein Turnier, um Playoffs zu sehen.</p>
        </div>
      `;
    return;
  }

  root.innerHTML = `
      <div class="bg-primary rounded-lg shadow-lg border border-gray-800 p-6">
        <h2 class="text-2xl font-bold text-white mb-2">Playoffs</h2>
        <p class="text-gray-400">Playoff-Bracket wird hier angezeigt (Platzhalter).</p>
      </div>
    `;
}

window.generatePlayoffs = generatePlayoffs;
