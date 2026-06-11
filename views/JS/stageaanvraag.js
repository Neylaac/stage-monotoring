const aanvraagForm = document.querySelector("#aanvraagForm");

if (aanvraagForm) {
    aanvraagForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const aanvraagData = {
            naam: document.querySelector("#naam").value,
            achternaam: document.querySelector("#achternaam").value,
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
            omschrijving: document.querySelector("#omschrijving").value,
            status: "administratie"
        };

        // Laatste aanvraag bewaren voor student overzicht
        localStorage.setItem("stageaanvraag", JSON.stringify(aanvraagData));
        localStorage.setItem("stageaanvraagStatus", "administratie");

        // Alle aanvragen bewaren voor administratie overzicht
        const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];
        aanvragen.push(aanvraagData);
        localStorage.setItem("stageaanvragen", JSON.stringify(aanvragen));

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
    updateProgressStatus("administratie");
}

const adminAanvragenBody = document.querySelector("#adminAanvragenBody");

if (adminAanvragenBody) {
    const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];

    if (aanvragen.length > 0) {
        adminAanvragenBody.innerHTML = "";

        aanvragen.forEach(function(aanvraag, index) {
            adminAanvragenBody.innerHTML += `
                <tr>
                    <td>
                        <strong>${aanvraag.naam}</strong>
                        <span>${aanvraag.opleiding}</span>
                    </td>
                    <td>${aanvraag.bedrijfsnaam}</td>
                    <td>${aanvraag.opdracht}</td>
                    <td>${aanvraag.startdatum} -<br>${aanvraag.einddatum}</td>
                    <td>
                        <span class="status behandeling">
                            In behandeling
                        </span>
                    </td>
                    <td>Nog geen feedback</td>
                    <td>
                        <a href="stageaanvraagformulieradministratie.html?index=${index}" class="view-btn">Bekijken</a>
                    </td>
                </tr>
            `;
        });

        document.querySelector("#countNieuwe").textContent = aanvragen.length;
        document.querySelector("#countBehandeling").textContent = aanvragen.length;
    }
}

// Admin detailpagina: juiste aanvraag tonen via index in de URL
const adminFormulier = document.querySelector(".admin-formulier");

if (adminFormulier) {
    const params = new URLSearchParams(window.location.search);
    const aanvraagIndex = params.get("index");

    const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];
    const aanvraag = aanvragen[aanvraagIndex];

    if (aanvraag) {
        const velden = document.querySelectorAll("[data-admin-aanvraag]");

        velden.forEach(function(veld) {
            const key = veld.dataset.adminAanvraag;
            veld.value = aanvraag[key] || "";
        });
    }
}