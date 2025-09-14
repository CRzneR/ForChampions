import { Tournament } from "../models/Tournament.js";

export class TournamentService {
  constructor(authService) {
    this.authService = authService;
    this.apiBaseUrl = "/api";
    this.currentTournament = null;
  }

  async createTournament(tournamentData) {
    try {
      // Zuerst Gruppen initialisieren
      const tournament = new Tournament(tournamentData);
      tournament.initializeGroups();

      const response = await this.authService.authFetch(
        `${this.apiBaseUrl}/tournaments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tournament.toJSON()),
        }
      );

      const data = await response.json();

      if (data.success) {
        this.currentTournament = new Tournament(data.tournament);
        this.saveToLocalStorage();
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error("Turnier erstellen Fehler:", error);
      throw error;
    }
  }
  async loadTournament(tournamentId) {
    try {
      const response = await this.authService.authFetch(
        `${this.apiBaseUrl}/tournaments/${tournamentId}`
      );
      const data = await response.json();

      if (data.success) {
        this.currentTournament = new Tournament(data.tournament);
        this.saveToLocalStorage();
        return this.currentTournament;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error("Turnier laden Fehler:", error);
      throw error;
    }
  }

  async updateTournament(updateData) {
    try {
      const response = await this.authService.authFetch(
        `${this.apiBaseUrl}/tournaments/${this.currentTournament.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (data.success) {
        this.currentTournament = new Tournament(data.tournament);
        this.saveToLocalStorage();
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error("Turnier aktualisieren Fehler:", error);
      throw error;
    }
  }

  saveToLocalStorage() {
    if (this.currentTournament) {
      localStorage.setItem(
        "currentTournament",
        JSON.stringify(this.currentTournament.toJSON())
      );
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("currentTournament");
      if (data) {
        this.currentTournament = Tournament.fromJSON(JSON.parse(data));
        return this.currentTournament;
      }
    } catch (error) {
      console.error("LocalStorage laden Fehler:", error);
    }
    return null;
  }

  updateTeamStats(groupIndex, team1Index, team2Index, homeGoals, awayGoals) {
    if (!this.currentTournament) return;

    const group = this.currentTournament.groups[groupIndex];
    const team1 = group.teams[team1Index];
    const team2 = group.teams[team2Index];

    // Statistik-Logik hier...
    // [Ihre bestehende updateTeamStats Logik]
  }
}
