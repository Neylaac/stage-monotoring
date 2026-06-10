const aanvraagForm = document.querySelector("#aanvraagForm");

if (aanvraagForm) {
    aanvraagForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const aanvraagData = {
            naam: document.querySelector("#naam").value,
            studentnummer: document.querySelector("#studentnummer").value,
            opleiding: document.querySelector("#opleiding").value,

            startdatum: document.querySelector("#startdatum").value,
            einddatum: document.querySelector("#einddatum").value,
            functie: document.querySelector("#functie").value,

            bedrijfsnaam: document.querySelector("#bedrijfsnaam").value,
            telefoonnummer: document.querySelector("#telefoonnummer").value,
            contactpersoon: document.querySelector("#contactpersoon").value,
            adres: document.querySelector("#adres").value,
            emailBedrijf: document.querySelector("#emailBedrijf").value,

            docentNaam: document.querySelector("#docentNaam").value,
            docentEmail: document.querySelector("#docentEmail").value,

            opdracht: document.querySelector("#opdracht").value,
            omschrijving: document.querySelector("#omschrijving").value
        };

        localStorage.setItem("stageaanvraag", JSON.stringify(aanvraagData));
        localStorage.setItem("stageaanvraagStatus", "administratie");
        window.location.href = "stageaanvraagoverzicht.html";
    });
}

const opgeslagenAanvraag = JSON.parse(localStorage.getItem("stageaanvraag"));

if (opgeslagenAanvraag) {
    const velden = document.querySelectorAll("[data-aanvraag]");

    velden.forEach(function(veld) {
        const key = veld.dataset.aanvraag;
        veld.textContent = opgeslagenAanvraag[key] || "-";
    });
}

const status = localStorage.getItem("stageaanvraagStatus");

if (status === "administratie") {

    document.querySelector("#stap1").classList.add("actief");
    document.querySelector("#stap2").classList.add("actief");

}

function updateProgressStatus(status) {
    const volgorde = ["ingediend", "administratie", "behandeling", "goedgekeurd"];
    const statusIndex = volgorde.indexOf(status);

    const stappen = document.querySelectorAll(".progress-step");
    const lijnen = document.querySelectorAll(".progress-line");
    const statusMessage = document.querySelector("#statusMessage");

    stappen.forEach(function(stap, index) {
        if (index <= statusIndex) {
            stap.classList.add("done");
        }

        if (index === statusIndex) {
            stap.classList.add("active");
        }
    });

    lijnen.forEach(function(lijn, index) {
        if (index < statusIndex) {
            lijn.classList.add("done");
        }
    });

    const berichten = {
        ingediend: "Je aanvraag werd ingediend.",
        administratie: "Je aanvraag is aangekomen bij de administratie.",
        behandeling: "Je aanvraag wordt behandeld.",
        goedgekeurd: "Je aanvraag werd goedgekeurd."
    };

    if (statusMessage) {
        statusMessage.textContent = berichten[status] || "Status onbekend.";
    }
}

if (document.querySelector(".progress-card")) {
    const huidigeStatus = localStorage.getItem("stageaanvraagStatus") || "administratie";
    updateProgressStatus(huidigeStatus);
}