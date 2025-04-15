"use strict";

const neuesTunier = {

    formulardaten_holen(e) {

        return {
            tournamentName: e.target.elements.tournamentName.value,
            numberTeams: e.target.elements.numberTeams.value,
            numberGroups: e.target.elements.numberGroups.value,
            playoffplaces: e.target.elements.playoffplaces.value
        }
    },
    
    formulardaten_verarbeiten(formulardaten) {
        return {
            tournamentName: formulardaten.tournamentName.trim(),
            numberTeams: parseInt(formulardaten.numberTeams),
            numberGroups: parseInt(formulardaten.numberGroups),
            playoffplaces: parseInt(formulardaten.playoffplaces)
        }
    },

    absenden_event_hinzufuegen(neuesTunier) {
        neuesTunier.querySelector("#form1").addEventListener("submit", e => {
            e.preventDefault();
            console.log(e);
            let formulardaten = this.formulardaten_verarbeiten(this.formulardaten_holen(e));
            console.log(formulardaten);
            this.gruppen_tabelle_generieren(formulardaten);
                
        });
    },

    // Formular generieren
    html_generieren() {
        let neuesTunier = document.createElement("section");
        neuesTunier.setAttribute("id", "containerNeuesTunier");
        neuesTunier.innerHTML = `
         <div class="containerForm">
                <form id="form1" class="multiForm" action="#" method="get">
                    <div>
                        <label for="tournamentName">Titel des Tuniers</label>
                        <input id="tournamentName" type="text" name="tournamentName" placeholder="Name des Turniers" required>
                    </div>
                    <div>
                        <label for="numberTeams">Anzahl der Teams</label>
                        <input id="numberTeams" type="number" name="numberTeams" placeholder="Anzahl der Teams" required>
                    </div>
                    <div>
                        <label for="numberGroups">Anzahl der Gruppen</label>
                        <input id="numberGroups" type="number" name="numberGroups" placeholder="Anzahl der Gruppen" required>
                    <div>
                        <label for="playoffplaces">Anzahl der Playoffplätze</label>
                        <input id="playoffplaces" type="number" name="playoffplaces" placeholder="Playoff Plätze" required>
                    </div>
                    <div class="container-button">
                        <button type="submit">weiter</button>
                    </div>
                </form>
                <form id="form2" class="multiForm" action="#" method="get">
                    <div>
                        <label for="tournamentName">Titel des Tuniers</label>
                        <input id="tournamentName" type="text" name="tournamentName" placeholder="Name des Turniers" required>
                    </div>
                    <div>
                        <label for="numberTeams">Anzahl der Teams</label>
                        <input id="numberTeams" type="number" name="numberTeams" placeholder="Anzahl der Teams" required>
                    </div>
                    <div>
                        <label for="numberGroups">Anzahl der Gruppen</label>
                        <input id="numberGroups" type="number" name="numberGroups" placeholder="Anzahl der Gruppen" required>
                    <div>
                        <label for="playoffplaces">Anzahl der Playoffplätze</label>
                        <input id="playoffplaces" type="number" name="playoffplaces" placeholder="Playoff Plätze" required>
                    </div>
                    <div class="container-button">
                        <button type="reset">abbrechen</button>
                        <button type="submit">weiter</button>
                    </div>
                </form>
            </div>`;

            this.absenden_event_hinzufuegen(neuesTunier);
            

        return neuesTunier;
    },

    //Formular anzeigen
    anzeigen() {
        let dashboard = document.querySelector(".dashboard");
        dashboard.insertAdjacentElement("beforeend", this.html_generieren());
    },

    gruppen_tabelle_generieren({ tournamentName, numberTeams, numberGroups }) {
        const container = document.createElement("section");
        container.classList.add("gruppentabelle");
    
        const headline = document.createElement("h4");
        headline.textContent = `Gruppen für Turnier: ${tournamentName}`;
        container.appendChild(headline);
    
        const teamsProGruppe = Math.floor(numberTeams / numberGroups);
        let restTeams = numberTeams % numberGroups;
    
        for (let i = 0; i < numberGroups; i++) {
            const gruppe = document.createElement("table");
            gruppe.classList.add("gruppe");
    
            const titel = document.createElement("h3");
            titel.textContent = `Gruppe ${String.fromCharCode(65 + i)}`;
            gruppe.appendChild(titel);
    
            const liste = document.createElement("tr");
            const anzahlTeams = teamsProGruppe + (restTeams > 0 ? 1 : 0);
            if (restTeams > 0) restTeams--;
    
            for (let j = 0; j < anzahlTeams; j++) {
                const teamNr = i * teamsProGruppe + j + 1;
                const li = document.createElement("tr");
                li.textContent = `Team ${teamNr}`;
                liste.appendChild(li);
            }
    
            gruppe.appendChild(liste);
            container.appendChild(gruppe);
        }
    
        document.querySelector(".forForm").appendChild(container);
    }

}


    

    

