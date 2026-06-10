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
        window.location.href = "stageaanvraag-overzicht.html";
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