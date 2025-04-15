"use strict";

neuesTunier.anzeigen();

document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");
  const openBtns = document.querySelectorAll(".openOverlayBtn");
  const closeBtn = document.getElementById("closeOverlayBtn");
  const form = document.getElementById("vsErgebnisse");

  // Overlay öffnen
  openBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      overlay.style.display = "block";
    });
  });

  // Overlay schließen
  closeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    overlay.style.display = "none";
  });

  // Formular absenden und Werte in Konsole loggen
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const team1Tore = document.getElementById("ergebnisTeam1").value;
    const team2Tore = document.getElementById("ergebnisTeam2").value;

    console.log("Team 1 Tore:", team1Tore);
    console.log("Team 2 Tore:", team2Tore);

    // Overlay nach Eintrag optional schließen
    overlay.style.display = "none";

    // Optional: Felder leeren
    form.reset();
  });
});

// neues Tunier 
// ===================================

// Formular 

let form1 = document.getElementById("form1");
let form2 = document.getElementById("form2");

let next1NT = document.getElementById("next1NT");
let next2NT = document.getElementById("next2NT");
let backNT = document.getElementById("backNT");

let progress = document.getElementById("progress");

next1NT.onclick = function () {
  form1.style.left = "-450px";
  form2.style.left = "40px";
  progress.style.width = "50%";
}

backNT.onclick = function () {
  form1.style.left = "40px";
  form2.style.left = "450px";
  progress.style.width = "100%";
}

