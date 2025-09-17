// client/js/ui-tabs.js
// Einfache Tab-Navigation: blendet alle .tab-content aus und zeigt das Ziel an

export function setupTabNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");
  const contents = document.querySelectorAll(".tab-content");

  function showTab(tabName) {
    // Alle Inhalte ausblenden
    contents.forEach((el) => el.classList.add("hidden"));

    // Ziel einblenden
    const target = document.getElementById(`${tabName}-content`);
    if (target) target.classList.remove("hidden");

    // Aktive Tab-Styles setzen
    tabs.forEach((btn) => btn.classList.remove("bg-[#99491C]", "text-white"));
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add("bg-[#99491C]", "text-white");
  }

  // Klick-Events auf alle Tabs
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      showTab(btn.dataset.tab);
    });
  });

  // Fallback: Dashboard als Standard
  if (![...contents].some((c) => !c.classList.contains("hidden"))) {
    const defaultBtn = document.querySelector('[data-tab="dashboard"]');
    if (defaultBtn) defaultBtn.click();
  }
}
