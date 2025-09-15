// client/js/ui-alert.js
export function showAlert(message, type = "info") {
  const containerId = "alert-container";
  let container = document.getElementById(containerId);

  // Container erzeugen, falls er fehlt
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = "fixed top-4 right-4 space-y-2 z-50";
    document.body.appendChild(container);
  }

  // Alert-Element
  const alert = document.createElement("div");
  alert.className = `px-4 py-2 rounded shadow ${
    type === "error"
      ? "bg-red-600 text-white"
      : type === "success"
      ? "bg-green-600 text-white"
      : "bg-gray-700 text-white"
  }`;
  alert.innerHTML = message;

  container.appendChild(alert);

  // Nach 4 Sekunden automatisch entfernen
  setTimeout(() => {
    alert.remove();
  }, 4000);
}
