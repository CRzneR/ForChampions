// Utility-Funktionen

export function showAlert(message, type = "success") {
  // Bestehende Alerts entfernen
  const existingAlerts = document.querySelectorAll(".custom-alert");
  existingAlerts.forEach((alert) => alert.remove());

  const alertDiv = document.createElement("div");
  alertDiv.className = `custom-alert fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg text-white z-50 ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  }`;
  alertDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 4000);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function getRandomColor() {
  const colors = [
    "#CA5818",
    "#EF1475",
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
