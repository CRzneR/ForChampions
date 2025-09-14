// src/main.js
import { AuthService } from "./services/AuthService.js";
import { TournamentService } from "./services/TournamentService.js";
import { LoginComponent } from "./components/LoginComponent.js";
import { initCreateModule } from "./components/CreateTournamentComponent.js";
import { initDashboardModule } from "./components/DashboardComponent.js";
import { initScheduleModule } from "./components/ScheduleComponent.js";
import { showAlert } from "./utils/helpers.js";

// Initialize services
const authService = new AuthService();
const tournamentService = new TournamentService();

// Check authentication state
function checkAuthState() {
  if (authService.isLoggedIn()) {
    showMainApp();
  } else {
    showLogin();
  }
}

function showMainApp() {
  document.getElementById("loginContainer").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  // Initialize modules
  initDashboardModule(tournamentService);
  initCreateModule(tournamentService);
  initScheduleModule(tournamentService);

  // Set up tab navigation
  setupTabNavigation();
  updateTournamentTitle();
}

function showLogin() {
  document.getElementById("loginContainer").classList.remove("hidden");
  document.getElementById("mainApp").classList.add("hidden");

  // Initialize login component
  new LoginComponent(authService, showMainApp);
}

function setupTabNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;

      // Hide all tab contents
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });

      // Show selected tab content
      const targetContent = document.getElementById(`${tabName}-content`);
      if (targetContent) {
        targetContent.classList.remove("hidden");
      }

      // Update active tab state
      tabs.forEach((t) => t.classList.remove("bg-[#2D303D]", "text-white"));
      tab.classList.add("bg-[#2D303D]", "text-white");
    });
  });
}

function updateTournamentTitle() {
  const titleElement = document.getElementById("tournament-title");
  if (tournamentService.currentTournament?.name && titleElement) {
    titleElement.textContent = tournamentService.currentTournament.name;
    titleElement.classList.remove("hidden");
  }
}

// Logout functionality
document.getElementById("logoutButton")?.addEventListener("click", () => {
  authService.logout();
  showLogin();
  showAlert("Erfolgreich abgemeldet", "success");
});

// Initial auth check
document.addEventListener("DOMContentLoaded", () => {
  checkAuthState();
});

// Make services available globally for debugging
window.authService = authService;
window.tournamentService = tournamentService;
