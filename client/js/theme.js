// ------------------ THEME SYSTEM ------------------

export function applyTheme(theme) {
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");

  body.classList.remove("light", "dark");
  body.classList.add(theme);

  // Navbar
  const nav = document.querySelector("nav");
  if (nav) {
    nav.classList.remove("navbar-light", "navbar-dark");
    nav.classList.add(theme === "light" ? "navbar-light" : "navbar-dark");
  }

  // Sidebar
  const sidebar = document.querySelector(".w-80");
  if (sidebar) {
    sidebar.classList.remove("sidebar-light", "sidebar-dark");
    sidebar.classList.add(theme === "light" ? "sidebar-light" : "sidebar-dark");
  }

  // Cards
  document.querySelectorAll(".rounded-lg, .rounded-xl, .rounded-2xl").forEach((card) => {
    card.classList.remove("card-light", "card-dark");
    card.classList.add(theme === "light" ? "card-light" : "card-dark");
  });

  // Icon
  if (themeIcon) {
    themeIcon.setAttribute("data-lucide", theme === "light" ? "sun" : "moon");
    lucide.createIcons();
  }

  // Save preference
  localStorage.setItem("theme", theme);
}

// Load saved theme on page load
export function initThemeToggle() {
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  const toggleBtn = document.getElementById("themeToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("light") ? "dark" : "light";
      applyTheme(newTheme);
    });
  }
}
