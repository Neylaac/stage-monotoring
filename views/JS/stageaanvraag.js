async function laadStudentProfile() {
    try {
        const response = await fetch('/api/student/profile');
        const data = await response.json();

        if (data.status !== 'success') {
            console.log(data.message);
            return;
        }

        const student = data.student;

        const naamInput = document.querySelector("#naam");
        const achternaamInput = document.querySelector("#achternaam");
        const studentnummerInput = document.querySelector("#studentnummer");
        const opleidingInput = document.querySelector("#opleiding");

        if (naamInput) {
            naamInput.value = student.voornaam;
        }

        if (achternaamInput) {
            achternaamInput.value = student.achternaam;
        }

        if (studentnummerInput) {
            studentnummerInput.value = student.studentnummer;
        }

        if (opleidingInput) {
            opleidingInput.value = student.opleiding;
        }

    } catch (error) {
        console.error("Fout bij ophalen studentgegevens:", error);

    }
}

if (document.querySelector("#aanvraagForm")) {
    laadStudentProfile();
}




const aanvraagForm = document.querySelector("#aanvraagForm");

if (aanvraagForm) {
    aanvraagForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const aanvraagData = {
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
        };

        try {
            const response = await fetch('/api/stageaanvragen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aanvraagData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            window.location.href = '/student/stageaanvraagoverzicht.html';
        } catch (error) {
            console.error(
                'Fout bij indienen stageaanvraag:',
                error
            );
        }

    });
}


function updateProgressStatus(status) {
    const volgorde = ["ingediend", "administratie", "behandeling", "goedgekeurd"];
    const statusIndex = volgorde.indexOf(status);

    const stappen = document.querySelectorAll(".progress-step");
    const lijnen = document.querySelectorAll(".progress-line");
    const statusMessage = document.querySelector("#statusMessage");

    stappen.forEach(function (stap, index) {
        if (index <= statusIndex) {
            stap.classList.add("done");
        }
    });

    lijnen.forEach(function (lijn, index) {
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

function formatteerDatum(datum) {
    if (!datum) {
        return "-";
    }

    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString("nl-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

async function laadMijnStageaanvraag() {
    try {
        const response = await fetch('/api/stageaanvragen/mijn');
        const data = await response.json();

        if(!response.ok){
            console.error(data.message);
            return;
        }

        if(data.aanvragen.length === 0){
            console.log('Geen stageaanvraag gevonden');
            return;
        }

        const aanvraag = data.aanvragen[0]; //de backend sorteert nieuwste aanvragen eerst

        const gegevensVoorPagina = {
            bedrijfsnaam: aanvraag.bedrijfsnaam,
            naam: `${aanvraag.voornaam} ${aanvraag.achternaam}`,
            student: `${aanvraag.voornaam} ${aanvraag.achternaam}`,
            functie: aanvraag.functie,
            startdatum: formatteerDatum(aanvraag.startdatum),
            einddatum: formatteerDatum(aanvraag.einddatum),
            opleiding: aanvraag.opleiding,
            opdracht: aanvraag.opdracht,
            omschrijving: aanvraag.omschrijving,
            status: aanvraag.status,
            feedback: aanvraag.feedback
        };

        const velden = document.querySelectorAll("[data-aanvraag]");

        velden.forEach(function(veld){
            const key = veld.dataset.aanvraag;

            veld.textContent = gegevensVoorPagina[key] || "-";
        })


        if (aanvraag.status === "INGEDIEND") {
            updateProgressStatus("administratie");
        }

        if (aanvraag.status === "GOEDGEKEURD") {
            updateProgressStatus("goedgekeurd");
        }

        if (aanvraag.status === "AANPASSING_GEVRAAGD") {
            updateProgressStatus("behandeling");
        }

        if (aanvraag.status === "AFGEKEURD") {
            updateProgressStatus("behandeling");
        }

    }catch(error){
        console.error("Fout bij ophalen van de stageaanvraag", error);

    }
}

if (document.querySelector(".progress-card")) {
    laadMijnStageaanvraag();
}

const adminAanvragenBody = document.querySelector("#adminAanvragenBody");

if (adminAanvragenBody) {
    const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];

    if (aanvragen.length > 0) {
        adminAanvragenBody.innerHTML = "";

        aanvragen.forEach(function (aanvraag, index) {
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

        velden.forEach(function (veld) {
            const key = veld.dataset.adminAanvraag;
            veld.value = aanvraag[key] || "";
        });
    }
}

// Stagecommissie overzicht: alle aanvragen tonen
const commissieAanvragenBody = document.querySelector("#commissieAanvragenBody");

if (commissieAanvragenBody) {
    const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];

    if (aanvragen.length > 0) {
        commissieAanvragenBody.innerHTML = "";

        aanvragen.forEach(function (aanvraag, index) {
            const commissieStatus = aanvraag.commissieStatus || "in_afwachting";

            let statusTekst = "In afwachting";
            let statusClass = "in_afwachting";

            if (commissieStatus === "goedgekeurd") {
                statusTekst = "Goedgekeurd";
                statusClass = "goedgekeurd";
            }

            if (commissieStatus === "afgekeurd") {
                statusTekst = "Afgekeurd";
                statusClass = "afgekeurd";
            }

            if (commissieStatus === "aanpassing") {
                statusTekst = "Aanpassing";
                statusClass = "aanpassing";
            }

            commissieAanvragenBody.innerHTML += `
                <tr>
                    <td>
                        <strong>${aanvraag.naam} ${aanvraag.achternaam}</strong>
                        <span>${aanvraag.opleiding}</span>
                    </td>
                    <td>${aanvraag.bedrijfsnaam}</td>
                    <td>${aanvraag.opdracht}</td>
                    <td>${aanvraag.startdatum} -<br>${aanvraag.einddatum}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${statusTekst}
                        </span>
                    </td>
                    <td>
                        <a href="stageaanvraagoverzichtstagecomissie.html?index=${index}" class="view-btn">
                            Bekijken
                        </a>
                    </td>
                </tr>
            `;
        });
    }
}

// Stagecommissie detailpagina: juiste aanvraag tonen via index in URL
const commissieDetailFormulier = document.querySelector(".commissie-formulier");

if (commissieDetailFormulier) {
    const params = new URLSearchParams(window.location.search);
    const aanvraagIndex = params.get("index");

    const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];
    const aanvraag = aanvragen[aanvraagIndex];

    if (aanvraag) {
        const velden = document.querySelectorAll("[data-commissie-aanvraag]");

        velden.forEach(function (veld) {
            const key = veld.dataset.commissieAanvraag;
            veld.value = aanvraag[key] || "";
        });
    }
}

const btnAanpassing = document.querySelector("#btnAanpassing");
const btnAfkeuren = document.querySelector("#btnAfkeuren");
const btnGoedkeuren = document.querySelector("#btnGoedkeuren");

if (btnAanpassing || btnAfkeuren || btnGoedkeuren) {
    const params = new URLSearchParams(window.location.search);
    const aanvraagIndex = params.get("index");

    if (btnAanpassing) {
        btnAanpassing.addEventListener("click", function () {
            window.location.href = `stageaanvraagaangepaststagecommissie.html?index=${aanvraagIndex}`;
        });
    }

    if (btnAfkeuren) {
        btnAfkeuren.addEventListener("click", function () {
            window.location.href = `stageaanvraagafgekeurdstagecommissie.html?index=${aanvraagIndex}`;
        });
    }

    if (btnGoedkeuren) {
        btnGoedkeuren.addEventListener("click", function () {
            window.location.href = `stageaanvraaggoedgekeurdstagecommissie.html?index=${aanvraagIndex}`;
        });
    }
}

// Stagecommissie feedback: status opslaan wanneer je op Terug klikt


const feedbackTerugKnop = document.querySelector(".feedback-terug-btn");

if (feedbackTerugKnop) {
    feedbackTerugKnop.addEventListener("click", function () {

        const params = new URLSearchParams(window.location.search);
        const aanvraagIndex = params.get("index");
        let feedbackTekst = "";

        if (document.querySelector("#commissieFeedback")) {
            feedbackTekst =
                document.querySelector("#commissieFeedback").value;
        }
        else {
            feedbackTekst =
                "Je stageaanvraag is helemaal in orde!";
        }
        const nieuweStatus =
            feedbackTerugKnop.dataset.status;

        const aanvragen =
            JSON.parse(localStorage.getItem("stageaanvragen")) || [];

        if (aanvragen[aanvraagIndex]) {

            aanvragen[aanvraagIndex].commissieStatus =
                nieuweStatus;

            aanvragen[aanvraagIndex].commissieFeedback =
                feedbackTekst;

            localStorage.setItem(
                "stageaanvragen",
                JSON.stringify(aanvragen)
            );
        }

        window.location.href =
            "stageaanvraagstagecommissie.html";
    });
}

// Student overzicht: extra scherm tonen na beslissing stagecommissie
const studentStatusExtra = document.querySelector("#studentStatusExtra");

if (studentStatusExtra) {
    const laatsteAanvraag = JSON.parse(localStorage.getItem("stageaanvraag"));
    const alleAanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];

    const aanvraag = alleAanvragen.find(function (item) {
        return item.studentnummer === laatsteAanvraag.studentnummer;
    });

    if (aanvraag && aanvraag.commissieStatus === "goedgekeurd") {
        updateProgressStatus("goedgekeurd");

        document.querySelector("#statusMessage").textContent =
            "Je aanvraag werd geaccepteerd.";

        document.querySelector(".details-card").style.display = "none";

        studentStatusExtra.innerHTML = `
            <div class="stage-contract-card">
                <h2>Stageovereenkomst</h2>

                <button class="submit-btn">
                    Ondertekenen
                </button>
            </div>
        `;
    }

    if (aanvraag && aanvraag.commissieStatus === "aanpassing") {
        document.querySelector("#statusMessage").textContent =
            "Je aanvraag moet aangepast worden.";

        document.querySelector(".details-card").style.display = "none";

        studentStatusExtra.innerHTML = `
        <div class="feedback-box">
            <strong>Feedback van de stagecommissie</strong>
            <ul>
                <li>${aanvraag.commissieFeedback}</li>
            </ul>
        </div>

        <button class="submit-btn">
            Aanvraag aanpassen
        </button>
    `;
    }

    if (aanvraag && aanvraag.commissieStatus === "afgekeurd") {
        document.querySelector("#statusMessage").textContent =
            "Je aanvraag werd afgekeurd.";

        document.querySelector(".details-card").style.display = "none";

        studentStatusExtra.innerHTML = `
        <div class="feedback-box">
            <strong>Feedback van de stagecommissie</strong>
            <ul>
                <li>${aanvraag.commissieFeedback}</li>
            </ul>
        </div>

        <button class="submit-btn">
            Nieuw aanvraag starten
        </button>
    `;
    }
}

// Stagecommissie: feedback indienen naar student
const feedbackIndienenKnop = document.querySelector(".feedback-indienen-btn");

if (feedbackIndienenKnop) {
    feedbackIndienenKnop.addEventListener("click", function () {
        const params = new URLSearchParams(window.location.search);
        const aanvraagIndex = params.get("index");

        const nieuweStatus = feedbackIndienenKnop.dataset.status;
        const feedbackTekst = document.querySelector("#commissieFeedback").value;

        const aanvragen = JSON.parse(localStorage.getItem("stageaanvragen")) || [];

        if (aanvragen[aanvraagIndex]) {
            aanvragen[aanvraagIndex].commissieStatus = nieuweStatus;
            aanvragen[aanvraagIndex].commissieFeedback = feedbackTekst;

            localStorage.setItem("stageaanvragen", JSON.stringify(aanvragen));
        }

        window.location.href = "stageaanvraagstagecommissie.html";
    });
}