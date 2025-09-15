// Einfache Tab-Navigation: blendet alle .tab-content aus und zeigt das Ziel an
export function setupTabNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");
  const contents = document.querySelectorAll(".tab-content");

  function showTab(tabName) {
    contents.forEach((el) => el.classList.add("hidden"));
    const target = document.getElementById(`${tabName}-content`);
    if (target) target.classList.remove("hidden");
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      showTab(btn.dataset.tab);
    });
  });

  // Fallback: wenn nichts aktiv ist, Dashboard zeigen
  if (![...contents].some((c) => !c.classList.contains("hidden"))) {
    const defaultBtn = document.querySelector('[data-tab="dashboard"]');
    if (defaultBtn) defaultBtn.click();
  }
}
