export function setupTabNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) =>
        t.classList.replace("bg-accent", "hover:bg-primary-light")
      );
      this.classList.add("bg-accent", "text-white");
      this.classList.remove("hover:bg-primary-light", "text-gray-300");

      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.add("hidden"));
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId + "-content").classList.remove("hidden");
    });
  });
}
