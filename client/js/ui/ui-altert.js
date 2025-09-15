export function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  }`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => alertDiv.remove(), 3000);
}
