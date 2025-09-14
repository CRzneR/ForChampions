import CreateTournamentComponent from "./components/CreateTournamentComponent.js";
import GroupsComponent from "./components/GroupsComponent.js";
import PlayoffsComponent from "./components/PlayoffsComponent.js";
import ScheduleComponent from "./components/SheduleComponent.js"; // ggf. Datei umbenennen!
import LoginComponent from "./components/LoginComponent.js";

// Lucide initialisieren
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

// Login-Container rendern
document.getElementById("loginContainer").innerHTML = LoginComponent();

// Tabs
document.querySelectorAll(".tab-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");

    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.add("hidden"));
    document.getElementById(`${tab}-content`).classList.remove("hidden");

    if (tab === "create") {
      document.getElementById("create-content").innerHTML =
        CreateTournamentComponent();
    } else if (tab === "groups") {
      document.getElementById("groups-content").innerHTML = GroupsComponent();
    } else if (tab === "schedule") {
      document.getElementById("schedule-content").innerHTML =
        ScheduleComponent();
    } else if (tab === "playoffs") {
      document.getElementById("playoffs-content").innerHTML =
        PlayoffsComponent();
    }
  });
});

// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginContainer").classList.remove("hidden");
});
