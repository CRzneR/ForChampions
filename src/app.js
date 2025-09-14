import { AuthService } from "./services/AuthService.js";
import { TournamentService } from "./services/TournamentService.js";
import { LoginComponent } from "./components/LoginComponent.js";

export class TournamentApp {
  constructor() {
    this.authService = new AuthService();
    this.tournamentService = new TournamentService(this.authService);
    this.loginComponent = null;
    this.init();
  }

  init() {
    this.bindGlobalEvents();
    this.checkAuthStatus();
  }

  bindGlobalEvents() {
    // Logout-Button
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.authService.logout());
    }

    // Tab-Navigation
    this.setupTabNavigation();
  }

  checkAuthStatus() {
    if (this.authService.isLoggedIn()) {
      this.showMainApp(this.authService.user);
      this.initializeTournamentUI();
    } else {
      this.showLogin();
      this.initializeLoginComponent();
      this.testServerConnection();
    }
  }

  initializeLoginComponent() {
    this.loginComponent = new LoginComponent(this.authService, (user) =>
      this.onLoginSuccess(user)
    );
  }

  onLoginSuccess(user) {
    this.showMainApp(user);
    this.initializeTournamentUI();
  }

  showMainApp(user) {
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
    document.getElementById("usernameDisplay").textContent = user.username;
  }

  showLogin() {
    document.getElementById("loginContainer").classList.remove("hidden");
    document.getElementById("mainApp").classList.add("hidden");
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.handleTabClick(e));
    });
  }

  handleTabClick(event) {
    const tab = event.currentTarget;
    const tabId = tab.getAttribute("data-tab");

    // Tab-Stile aktualisieren
    document.querySelectorAll("[data-tab]").forEach((t) => {
      t.classList.remove("bg-[#99491C]", "text-white");
      t.classList.add("text-gray-300");
    });
    tab.classList.add("bg-[#99491C]", "text-white");

    // Tab-Inhalt anzeigen
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.add("hidden");
    });
    document.getElementById(`${tabId}-content`).classList.remove("hidden");
  }

  initializeTournamentUI() {
    this.setupTabNavigation();
    this.initializeModules();
    document.querySelector('[data-tab="dashboard"]').click();
  }

  initializeModules() {
    // Dynamisch Module initialisieren
    if (typeof initDashboardModule === "function")
      initDashboardModule(this.tournamentService);
    if (typeof initCreateModule === "function")
      initCreateModule(this.tournamentService);
    if (typeof initGroupsModule === "function")
      initGroupsModule(this.tournamentService);
    if (typeof initScheduleModule === "function")
      initScheduleModule(this.tournamentService);
    if (typeof initPlayoffsModule === "function")
      initPlayoffsModule(this.tournamentService);
  }

  async testServerConnection() {
    try {
      const response = await fetch("/api/test");
      if (response.ok) {
        console.log("✅ Server verbunden");
      }
    } catch (error) {
      console.warn("⚠️ Server nicht erreichbar");
    }
  }
}
