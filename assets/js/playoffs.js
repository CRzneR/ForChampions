// Modul für "Playoffs"
function initPlayoffsModule() {
  const playoffsContent = document.getElementById("playoffs-content");
  playoffsContent.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold mb-6">Playoffs</h2>
            <p class="text-gray-500">
                Die Playoffs werden angezeigt, sobald die Gruppenphase abgeschlossen ist.
            </p>
        </div>
    `;
}
