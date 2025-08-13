// schedule.js - Spielplan-Verwaltung für Turnier Manager (nur Hinrunde)

function initScheduleModule() {
  const scheduleContent = document.getElementById("schedule-content");
  scheduleContent.innerHTML = `
      <div class="bg-primary rounded-lg shadow-lg border border-gray-800">
          <div class="px-6 py-4 border-b border-gray-800">
              <h2 class="text-2xl font-bold text-white">Spielplan</h2>
              <p id="schedule-info" class="text-sm text-gray-400 mt-1">
                  ${tournamentData.name ? tournamentData.name + " - " : ""}
                  Erstellen Sie ein Turnier, um den Spielplan anzuzeigen
              </p>
          </div>
          <div id="schedule-container" class="p-4"></div>
      </div>
  `;
}

function generateSchedule() {
  const scheduleContainer = document.getElementById("schedule-container");
  const infoElement = document.getElementById("schedule-info");

  if (!tournamentData.name) {
    scheduleContainer.innerHTML = `
          <p class="text-gray-400 text-center py-8">
              Bitte erstellen Sie zuerst ein Turnier
          </p>
      `;
    return;
  }

  infoElement.textContent = `${tournamentData.name} - Spielplan`;
  scheduleContainer.innerHTML = "";

  tournamentData.groups.forEach((group, groupIndex) => {
    const groupDiv = document.createElement("div");
    groupDiv.className =
      "mb-8 bg-primary-light rounded-lg overflow-hidden border border-gray-800";

    const matchdays = generateMatchdays(group.teams);

    groupDiv.innerHTML = `
      <div class="px-6 py-3 bg-primary border-b border-gray-800">
          <h3 class="text-lg font-bold text-white">${group.name}</h3>
      </div>
    `;

    matchdays.forEach((matchday, dayIndex) => {
      const matchdayDiv = document.createElement("div");
      matchdayDiv.className = "mb-6";
      matchdayDiv.innerHTML = `
        <div class="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <h4 class="font-medium text-white">Spieltag ${dayIndex + 1}</h4>
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
            <tbody class="bg-primary-light divide-y divide-gray-800" id="group-${groupIndex}-matchday-${dayIndex}"></tbody>
          </table>
        </div>
      `;

      const tbody = matchdayDiv.querySelector(
        `#group-${groupIndex}-matchday-${dayIndex}`
      );

      matchday.forEach((match, matchIndex) => {
        const team1Index = group.teams.findIndex((t) => t.id === match.home.id);
        const team2Index = group.teams.findIndex((t) => t.id === match.away.id);

        const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
        const existingMatch = tournamentData.matches.find(
          (m) => m.id === matchId
        );
        const isSaved = !!existingMatch;

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
                <input type="number" id="${matchId}-home"
                  class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 ${
                    isSaved ? "bg-gray-700 text-gray-400" : "text-white"
                  }"
                  min="0" value="${
                    existingMatch ? existingMatch.homeGoals : ""
                  }" ${isSaved ? "readonly" : ""}>
                <span class="text-gray-300">:</span>
                <input type="number" id="${matchId}-away"
                  class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 ${
                    isSaved ? "bg-gray-700 text-gray-400" : "text-white"
                  }"
                  min="0" value="${
                    existingMatch ? existingMatch.awayGoals : ""
                  }" ${isSaved ? "readonly" : ""}>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center space-x-2">
                <button
                  onclick="saveMatchResult('${groupIndex}', ${team1Index}, ${team2Index}, ${dayIndex}, ${matchIndex})"
                  class="px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded-md ${
                    isSaved ? "opacity-50 cursor-not-allowed" : ""
                  }"
                  ${isSaved ? "disabled" : ""}>
                  Speichern
                </button>
                ${
                  isSaved
                    ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                         <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                       </svg>`
                    : ""
                }
              </div>
            </td>
          </tr>
        `;
      });

      groupDiv.appendChild(matchdayDiv);
    });

    scheduleContainer.appendChild(groupDiv);
  });
}

function generateMatchdays(teams) {
  const matchdays = [];
  const teamList = [...teams];
  const hasBye = teamList.length % 2 !== 0;

  if (hasBye) {
    teamList.push({ id: "bye", name: "SPIELFREI" });
  }

  const n = teamList.length;
  const rounds = n - 1;
  const half = n / 2;

  // Fixes Team ist das erste Team
  const fixedTeam = teamList[0];
  // Rotierende Teams (alle außer dem ersten)
  const rotatingTeams = teamList.slice(1);

  for (let round = 0; round < rounds; round++) {
    const currentMatchday = [];

    // Paarung mit fixem Team (immer erste Paarung)
    const opponent = rotatingTeams[round % rotatingTeams.length];
    if (fixedTeam.id !== "bye" && opponent.id !== "bye") {
      // Abwechselnd Heim- und Auswärtsspiel
      if (round % 2 === 0) {
        currentMatchday.push({ home: fixedTeam, away: opponent });
      } else {
        currentMatchday.push({ home: opponent, away: fixedTeam });
      }
    }

    // Restliche Paarungen
    for (let i = 1; i < half; i++) {
      const homeIndex = (round + i) % rotatingTeams.length;
      const awayIndex =
        (round + rotatingTeams.length - i) % rotatingTeams.length;

      const homeTeam = rotatingTeams[homeIndex];
      const awayTeam = rotatingTeams[awayIndex];

      if (homeTeam.id !== "bye" && awayTeam.id !== "bye") {
        // Abwechselnd Heim- und Auswärtsspiele
        if (i % 2 === 0) {
          currentMatchday.push({ home: homeTeam, away: awayTeam });
        } else {
          currentMatchday.push({ home: awayTeam, away: homeTeam });
        }
      }
    }

    matchdays.push(currentMatchday);
  }

  return matchdays;
}

// Ergebnisse speichern (und Tabelle sauber neu berechnen)
window.saveMatchResult = function (
  groupIndex,
  team1Index,
  team2Index,
  matchdayIndex,
  matchIndex
) {
  const matchId = `group-${groupIndex}-matchday-${matchdayIndex}-match-${matchIndex}`;
  const homeGoalsInput = document.getElementById(`${matchId}-home`);
  const awayGoalsInput = document.getElementById(`${matchId}-away`);

  const homeGoals = parseInt(homeGoalsInput.value);
  const awayGoals = parseInt(awayGoalsInput.value);

  if (isNaN(homeGoals) || isNaN(awayGoals)) {
    alert("Bitte gültige Ergebnisse eingeben!");
    return;
  }

  if (homeGoals < 0 || awayGoals < 0) {
    alert("Torzahlen dürfen nicht negativ sein!");
    return;
  }

  const existingMatchIndex = tournamentData.matches.findIndex(
    (m) => m.id === matchId
  );
  const matchData = {
    id: matchId,
    groupIndex,
    team1Index, // home
    team2Index, // away
    matchdayIndex,
    homeGoals,
    awayGoals,
    date: new Date().toISOString(),
  };

  if (existingMatchIndex >= 0) {
    const prev = tournamentData.matches[existingMatchIndex];
    // Wenn unverändert, nichts tun
    if (prev.homeGoals === homeGoals && prev.awayGoals === awayGoals) {
      showAlert("Ergebnis ist unverändert.", "info");
      return;
    }
    tournamentData.matches[existingMatchIndex] = matchData;
  } else {
    tournamentData.matches.push(matchData);
  }

  // Tabelle aus ALLEN Spielen der Gruppe neu berechnen (verhindert Doppelzählungen)
  recomputeGroupTable(groupIndex);

  // UI Sperren für diese Zeile
  homeGoalsInput.readOnly = true;
  awayGoalsInput.readOnly = true;
  homeGoalsInput.classList.add("bg-gray-700", "text-gray-400");
  awayGoalsInput.classList.add("bg-gray-700", "text-gray-400");
  const buttonCell = homeGoalsInput
    .closest("tr")
    .querySelector("td:last-child");
  buttonCell.innerHTML = `
    <div class="flex items-center space-x-2">
      <button class="px-3 py-1 bg-gray-500 text-gray-300 rounded-md cursor-not-allowed" disabled>Speichern</button>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    </div>
  `;

  // Gruppenansicht neu rendern
  generateGroups();
  showAlert("Ergebnis erfolgreich gespeichert!", "success");
};

// Alle Team-Stats der Gruppe aus den gespeicherten Matches neu berechnen
function recomputeGroupTable(groupIndex) {
  const group = tournamentData.groups[groupIndex];
  if (!group) return;

  // Reset aller Statistiken
  group.teams.forEach((team) => {
    team.wins = 0;
    team.losses = 0;
    team.draws = 0;
    team.points = 0;
    team.goalsFor = 0;
    team.goalsAgainst = 0;
    team.goalDifference = 0;
    team.matchesPlayed = 0;
    team.games = 0;
    team.form = [];
  });

  // Alle Spiele der Gruppe chronologisch sortieren
  const groupMatches = tournamentData.matches
    .filter((match) => match.groupIndex === groupIndex)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Statistik für jedes Spiel berechnen
  groupMatches.forEach((match) => {
    const homeTeam = group.teams[match.team1Index];
    const awayTeam = group.teams[match.team2Index];

    if (!homeTeam || !awayTeam) return;

    // Grundstatistiken aktualisieren
    homeTeam.matchesPlayed++;
    awayTeam.matchesPlayed++;
    homeTeam.games++;
    awayTeam.games++;

    // Tore aktualisieren
    homeTeam.goalsFor += match.homeGoals;
    homeTeam.goalsAgainst += match.awayGoals;
    awayTeam.goalsFor += match.awayGoals;
    awayTeam.goalsAgainst += match.homeGoals;

    // Spielausgang verarbeiten
    if (match.homeGoals > match.awayGoals) {
      homeTeam.wins++;
      awayTeam.losses++;
      homeTeam.points += 3;
      homeTeam.form.push("W");
      awayTeam.form.push("L");
    } else if (match.homeGoals < match.awayGoals) {
      homeTeam.losses++;
      awayTeam.wins++;
      awayTeam.points += 3;
      homeTeam.form.push("L");
      awayTeam.form.push("W");
    } else {
      homeTeam.draws++;
      awayTeam.draws++;
      homeTeam.points += 1;
      awayTeam.points += 1;
      homeTeam.form.push("D");
      awayTeam.form.push("D");
    }
  });

  // Finale Berechnungen für jedes Team
  group.teams.forEach((team) => {
    // Tordifferenz berechnen
    team.goalDifference = team.goalsFor - team.goalsAgainst;

    // Nur die letzten 3 Spiele behalten (neueste zuerst)
    team.form = team.form.slice(-3).reverse();

    // Sicherstellen, dass alle Werte definiert sind
    team.wins = team.wins || 0;
    team.losses = team.losses || 0;
    team.draws = team.draws || 0;
    team.points = team.points || 0;
    team.goalsFor = team.goalsFor || 0;
    team.goalsAgainst = team.goalsAgainst || 0;
  });
}

// Initialisierung
window.generateSchedule = generateSchedule;
