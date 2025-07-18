// schedule.js - Spielplan-Verwaltung für Turnier Manager mit Spieltag-Einteilung

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

    // Matchdays für diese Gruppe generieren
    const matchdays = generateMatchdays(group.teams);

    // Gruppenkopf
    groupDiv.innerHTML = `
      <div class="px-6 py-3 bg-primary border-b border-gray-800">
          <h3 class="text-lg font-bold text-white">${group.name}</h3>
      </div>
    `;

    // Für jeden Spieltag eine Tabelle erstellen
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
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Heim</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gast</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ergebnis</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aktion</th>
              </tr>
            </thead>
            <tbody class="bg-primary-light divide-y divide-gray-800" id="group-${groupIndex}-matchday-${dayIndex}">
            </tbody>
          </table>
        </div>
      `;

      const tbody = matchdayDiv.querySelector(
        `#group-${groupIndex}-matchday-${dayIndex}`
      );

      // Spiele für diesen Spieltag hinzufügen
      matchday.forEach((match, matchIndex) => {
        const team1Index = group.teams.findIndex((t) => t.id === match.home.id);
        const team2Index = group.teams.findIndex((t) => t.id === match.away.id);

        const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
        const existingMatch = tournamentData.matches.find(
          (m) => m.id === matchId
        );
        const isSaved = existingMatch ? true : false;

        tbody.innerHTML += `
          <tr class="hover:bg-primary transition-colors">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
              ${match.home.name}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
              ${match.away.name}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <input type="number" id="${matchId}-home" 
                  class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-accent focus:border-transparent ${
                    isSaved ? "bg-gray-700 text-gray-400" : "text-white"
                  }" 
                  min="0" 
                  value="${existingMatch ? existingMatch.homeGoals : ""}" 
                  ${isSaved ? "readonly" : ""}>
                <span class="text-gray-300">:</span>
                <input type="number" id="${matchId}-away" 
                  class="w-16 text-center bg-gray-800 border border-gray-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-accent focus:border-transparent ${
                    isSaved ? "bg-gray-700 text-gray-400" : "text-white"
                  }" 
                  min="0" 
                  value="${existingMatch ? existingMatch.awayGoals : ""}" 
                  ${isSaved ? "readonly" : ""}>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <button onclick="saveMatchResult('${groupIndex}', ${team1Index}, ${team2Index}, ${dayIndex}, ${matchIndex})" 
                  class="px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors ${
                    isSaved ? "opacity-50 cursor-not-allowed" : ""
                  }">
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
  const teamCount = teams.length;

  if (teamCount < 2) return matchdays;

  // Erstelle eine Kopie des Teams-Arrays
  const teamList = [...teams];

  // Wenn ungerade Anzahl Teams, füge ein "Bye"-Team hinzu
  const hasBye = teamCount % 2 !== 0;
  if (hasBye) {
    teamList.push({ id: "bye", name: "BYE" });
  }

  const numberOfTeams = teamList.length;
  const numberOfMatchdays = numberOfTeams - 1;
  const matchesPerMatchday = numberOfTeams / 2;

  // Fixiertes Team (erster Eintrag)
  const fixedTeam = teamList[0];
  const rotatingTeams = teamList.slice(1);

  for (let matchday = 0; matchday < numberOfMatchdays; matchday++) {
    const currentMatchday = [];

    // Erstes Spiel: Fixiertes Team gegen aktuelles rotierendes Team
    const firstMatch = {
      home: fixedTeam,
      away: rotatingTeams[matchday % rotatingTeams.length],
    };
    if (firstMatch.home.id !== "bye" && firstMatch.away.id !== "bye") {
      currentMatchday.push(firstMatch);
    }

    // Restliche Paarungen
    for (let i = 1; i < matchesPerMatchday; i++) {
      const homeIndex = (matchday + i) % rotatingTeams.length;
      const awayIndex =
        (matchday + rotatingTeams.length - i) % rotatingTeams.length;

      const home = rotatingTeams[homeIndex];
      const away = rotatingTeams[awayIndex];

      if (home.id !== "bye" && away.id !== "bye") {
        // Wechsel zwischen Heim und Auswärts für Rückrunde
        const isSecondLeg = matchday >= numberOfMatchdays / 2;
        currentMatchday.push({
          home: isSecondLeg ? away : home,
          away: isSecondLeg ? home : away,
        });
      }
    }

    matchdays.push(currentMatchday);
  }

  // Bei ungerader Teamanzahl das BYE-Team entfernen
  if (hasBye) {
    // Sicherstellen, dass kein Team zu viele Spiele hat
    const gamesPerTeam = new Map();
    teams.forEach((team) => gamesPerTeam.set(team.id, 0));

    matchdays.forEach((matchday) => {
      matchday.forEach((match) => {
        gamesPerTeam.set(match.home.id, gamesPerTeam.get(match.home.id) + 1);
        gamesPerTeam.set(match.away.id, gamesPerTeam.get(match.away.id) + 1);
      });
    });

    // Überprüfen, ob alle Teams die gleiche Anzahl an Spielen haben
    const gameCounts = Array.from(gamesPerTeam.values());
    const allEqual = gameCounts.every((val) => val === gameCounts[0]);

    if (!allEqual) {
      console.warn("Teams haben unterschiedliche Spielanzahlen!", gamesPerTeam);
    }
  }

  return matchdays;
}
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
    alert("Tore können nicht negativ sein!");
    return;
  }

  // Match in tournamentData speichern oder aktualisieren
  const existingMatchIndex = tournamentData.matches.findIndex(
    (m) => m.id === matchId
  );
  const matchData = {
    id: matchId,
    groupIndex,
    team1Index,
    team2Index,
    matchdayIndex,
    homeGoals,
    awayGoals,
    date: new Date().toISOString(),
  };

  if (existingMatchIndex >= 0) {
    removeMatchResults(groupIndex, team1Index, team2Index);
    tournamentData.matches[existingMatchIndex] = matchData;
  } else {
    tournamentData.matches.push(matchData);
  }

  // Teamstatistiken aktualisieren
  updateTeamStats(groupIndex, team1Index, team2Index, homeGoals, awayGoals);

  // UI aktualisieren
  homeGoalsInput.readOnly = true;
  awayGoalsInput.readOnly = true;
  homeGoalsInput.classList.add("bg-gray-700", "text-gray-400");
  homeGoalsInput.classList.remove("text-white");
  awayGoalsInput.classList.add("bg-gray-700", "text-gray-400");
  awayGoalsInput.classList.remove("text-white");

  const buttonCell = homeGoalsInput
    .closest("tr")
    .querySelector("td:last-child");
  buttonCell.innerHTML = `
    <div class="flex items-center space-x-2">
      <button class="px-3 py-1 bg-gray-500 text-gray-300 rounded-md cursor-not-allowed" disabled>
        Speichern
      </button>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    </div>
  `;

  // Gruppen und Tabelle neu generieren
  generateGroups();

  // Erfolgsmeldung
  showAlert("Ergebnis erfolgreich gespeichert!", "success");
};

function removeMatchResults(groupIndex, team1Index, team2Index) {
  const group = tournamentData.groups[groupIndex];
  const team1 = group.teams[team1Index];
  const team2 = group.teams[team2Index];

  // matchesPlayed korrekt aktualisieren
  team1.matchesPlayed--;
  team2.matchesPlayed--;

  // Vorherige Ergebnisse abziehen
  team1.games--;
  team2.games--;

  team1.goalsFor -= match.homeGoals;
  team1.goalsAgainst -= match.awayGoals;
  team2.goalsFor -= match.awayGoals;
  team2.goalsAgainst -= match.homeGoals;

  // Form-Array sicher aktualisieren
  if (team1.form.length > 0) {
    team1.form = team1.form.slice(1);
  }
  if (team2.form.length > 0) {
    team2.form = team2.form.slice(1);
  }

  // Punkte und Statistiken zurücksetzen
  if (match.homeGoals > match.awayGoals) {
    team1.wins--;
    team2.losses--;
    team1.points -= 3;
  } else if (match.homeGoals < match.awayGoals) {
    team1.losses--;
    team2.wins--;
    team2.points -= 3;
  } else {
    team1.draws--;
    team2.draws--;
    team1.points -= 1;
    team2.points -= 1;
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

  // Spiele aktualisieren
  team1.games++;
  team2.games++;
  team1.matchesPlayed++;
  team2.matchesPlayed++;

  // Tore aktualisieren
  team1.goalsFor += homeGoals;
  team1.goalsAgainst += awayGoals;
  team2.goalsFor += awayGoals;
  team2.goalsAgainst += homeGoals;
  team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
  team2.goalDifference = team2.goalsFor - team2.goalsAgainst;

  // Punkte und Statistiken aktualisieren
  if (homeGoals > awayGoals) {
    team1.wins++;
    team2.losses++;
    team1.points += 3;
    team1.form.unshift("W");
    team2.form.unshift("L");
  } else if (homeGoals < awayGoals) {
    team1.losses++;
    team2.wins++;
    team2.points += 3;
    team1.form.unshift("L");
    team2.form.unshift("W");
  } else {
    team1.draws++;
    team2.draws++;
    team1.points += 1;
    team2.points += 1;
    team1.form.unshift("D");
    team2.form.unshift("D");
  }

  // Nur die letzten 3 Ergebnisse behalten
  team1.form = team1.form.slice(0, 3);
  team2.form = team2.form.slice(0, 3);
}

// Initialisierung
window.generateSchedule = generateSchedule;
