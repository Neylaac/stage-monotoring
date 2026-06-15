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

            naam: document.querySelector("#naam").value,
            achternaam: document.querySelector("#achternaam").value,
            studentnummer: document.querySelector("#studentnummer").value,
            opleiding: document.querySelector("#opleiding").value,
            startdatum: document.querySelector("#startdatum").value,
            einddatum: document.querySelector("#einddatum").value,
            functie: document.querySelector("#functie").value,
            bedrijfsnaam: document.querySelector("#bedrijfsnaam").value,
            telefoonnummer: document.querySelector("#telefoonnummer").value,
            emailBedrijf: document.querySelector("#emailBedrijf").value,
            gemeente: document.querySelector("#gemeente").value,
            postcode: document.querySelector("#postcode").value,
            straat: document.querySelector("#straat").value,
            straatnummer: document.querySelector("#straatnummer").value,
            contactVoornaam: document.querySelector("#contactVoornaam").value,
            contactNaam: document.querySelector("#contactNaam").value,

            opdracht: document.querySelector("#opdracht").value,
            omschrijving: document.querySelector("#omschrijving").value,
        };

        try {
            const params = new URLSearchParams(window.location.search);
            const aanvraagId = params.get("id");
            const mode = params.get("mode");

            let url = "/api/stageaanvragen";
            let methode = "POST";

            if (mode === "aanpassen" && aanvraagId) {
                url = `/api/stageaanvragen/${aanvraagId}`;
                methode = "PATCH";
            }

            const response = await fetch(url, {
                method: methode,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aanvraagData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            window.location.href =
                "/student/stageaanvraagoverzicht.html";

        } catch (error) {
            console.error(
                "Fout bij opslaan stageaanvraag:",
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

        if (!response.ok) {
            console.error(data.message);
            return;
        }

        if (data.aanvragen.length === 0) {
            window.location.href = "/student/stageaanvraagformulier.html";
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

        velden.forEach(function (veld) {
            const key = veld.dataset.aanvraag;

            veld.textContent = gegevensVoorPagina[key] || "-";
        })


        if (aanvraag.status === "INGEDIEND") {
            updateProgressStatus("administratie");
        }

        toonStudentBeslissing(aanvraag);

    } catch (error) {
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
async function laadStagecommissieAanvragen() {
    try {
        const response = await fetch('/api/stagecommissie/stageaanvragen');

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message);
            return;
        }

        const commissieAanvragenBody = document.querySelector("#commissieAanvragenBody");


        if (!commissieAanvragenBody) {
            return;
        }

        commissieAanvragenBody.innerHTML = "";

        if (data.aanvragen.length === 0) {

            commissieAanvragenBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Geen stageaanvragen gevonden.
                    </td>
                </tr>
            `;

            return;
        }
        data.aanvragen.forEach(function (aanvraag) {
            let statusTekst = "Ingediend";
            let statusClass = "in_afwachting";

            if (aanvraag.status === "GOEDGEKEURD") {
                statusTekst = "Goedgekeurd";
                statusClass = "goedgekeurd";
            }

            if (aanvraag.status === "AFGEKEURD") {
                statusTekst = "Afgekeurd";
                statusClass = "afgekeurd";
            }

            if (aanvraag.status === "AANPASSING_GEVRAAGD") {
                statusTekst = "Aanpassing gevraagd";
                statusClass = "aanpassing";
            }


            let bekijkenLink =
                `stageaanvraagoverzichtstagecomissie.html?id=${aanvraag.id}`;

            if (aanvraag.status === "GOEDGEKEURD") {
                bekijkenLink =
                    `stageaanvraaggoedgekeurdstagecommissie.html?id=${aanvraag.id}&mode=bekijken`;
            }

            if (aanvraag.status === "AFGEKEURD") {
                bekijkenLink =
                    `stageaanvraagafgekeurdstagecommissie.html?id=${aanvraag.id}&mode=bekijken`;
            }

            if (aanvraag.status === "AANPASSING_GEVRAAGD") {
                bekijkenLink =
                    `stageaanvraagaangepaststagecommissie.html?id=${aanvraag.id}&mode=bekijken`;
            }

            commissieAanvragenBody.innerHTML += `
                <tr>
                    <td>
                        <strong>
                            ${aanvraag.voornaam}
                            ${aanvraag.achternaam}
                        </strong>
                        <span>${aanvraag.opleiding}</span>
                    </td>

                    <td>${aanvraag.bedrijfsnaam}</td>

                    <td>${aanvraag.opdracht}</td>

                    <td>
                        ${formatteerDatum(aanvraag.startdatum)}
                        -<br>
                        ${formatteerDatum(aanvraag.einddatum)}
                    </td>

                    <td>
                        <span class="status ${statusClass}">
                            ${statusTekst}
                        </span>
                    </td>

                    <td>
                        <a
                          href="${bekijkenLink}"
                          class="view-btn"
                        >
                            Bekijken
                        </a>
                    </td>
                </tr>
            `;
        });


    } catch (error) {
        console.error(
            "Fout bij ophalen stagecommissie-aanvragen",
            error
        );
    }
}

if (document.querySelector("#commissieAanvragenBody")) {
    laadStagecommissieAanvragen();
}

// Stagecommissie detailpagina

async function laadStageaanvraagDetail() {
    try {
        const params = new URLSearchParams(window.location.search);
        const aanvraagId = params.get("id");

        if (!aanvraagId) {
            console.log("Geen aanvraag-id gevonden")
            return;
        }

        const response = await fetch(`/api/stageaanvragen/${aanvraagId}`);

        const data = await response.json();

        if (!response.ok) {
            console.log(data.message);
            return;
        }

        const aanvraag = data.aanvraag;

        const velden = document.querySelectorAll("[data-commissie-aanvraag]");

        velden.forEach(function (veld) {
            const key = veld.dataset.commissieAanvraag;

            if (key === "naam") {
                veld.value = aanvraag.voornaam || "";
            }
            else if (key === "achternaam") {
                veld.value = aanvraag.achternaam || "";
            }
            else if (key === "startdatum") {
                veld.value = formatteerDatum(aanvraag.startdatum);
            }
            else if (key === "einddatum") {
                veld.value = formatteerDatum(aanvraag.einddatum);
            }
            else {
                veld.value = aanvraag[key] || "";
            }
        })

    } catch (error) {
        console.error("Fout bij ophalen va, stageaanvraag:", error);
    }

}

if (document.querySelector(".commissie-formulier")) {
    laadStageaanvraagDetail();
}




const btnAanpassing = document.querySelector("#btnAanpassing");
const btnAfkeuren = document.querySelector("#btnAfkeuren");
const btnGoedkeuren = document.querySelector('#btnGoedkeuren');

const params = new URLSearchParams(window.location.search);
const aanvraagId = params.get("id");

if (btnAanpassing) {
    btnAanpassing.addEventListener("click", function () {
        window.location.href = `stageaanvraagaangepaststagecommissie.html?id=${aanvraagId}`;
    });
}
if (btnAfkeuren) {
    btnAfkeuren.addEventListener("click", function () {
        window.location.href = `stageaanvraagafgekeurdstagecommissie.html?id=${aanvraagId}`;
    });

}

if (btnGoedkeuren) {
    btnGoedkeuren.addEventListener("click", function () {
        window.location.href = `stageaanvraaggoedgekeurdstagecommissie.html?id=${aanvraagId}`;
    })
}


// Stagecommissie feedback: status opslaan wanneer je op Terug klikt

const beslissingKnop = document.querySelector(".feedback-terug-btn, .feedback-indienen-btn");

if (beslissingKnop) {
    beslissingKnop.addEventListener("click", async function (event) {
        event.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const aanvraagId = params.get("id");
        const mode = params.get("mode");

        if (mode === "bekijken") {
            window.location.href =
                "/stagecommissie/stageaanvragen";
            return;
        }
        const gekozenStatus = beslissingKnop.dataset.status;
        let statusVoorDatabase = "";

        if (gekozenStatus === "goedgekeurd") {
            statusVoorDatabase = "GOEDGEKEURD";
        }

        if (gekozenStatus === "afgekeurd") {
            statusVoorDatabase = "AFGEKEURD";
        }

        if (gekozenStatus === "aanpassing") {
            statusVoorDatabase = "AANPASSING_GEVRAAGD";
        }

        const feedbackVeld =
            document.querySelector("#commissieFeedback");

        let feedbackTekst = "";

        if (feedbackVeld) {
            feedbackTekst = feedbackVeld.value.trim();
        }

        if (statusVoorDatabase === "GOEDGEKEURD") {
            feedbackTekst =
                "Je stageaanvraag is goedgekeurd.";
        }

        if (
            statusVoorDatabase !== "GOEDGEKEURD" &&
            feedbackTekst === ""
        ) {
            alert("Vul eerst feedback in.");
            return;
        }


        try {
            const response = await fetch(`/api/stageaanvragen/${aanvraagId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: statusVoorDatabase,
                    feedback: feedbackTekst
                })
            })

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return
            }

            window.location.href = "/stagecommissie/stageaanvragen"

        } catch (error) {
            console.error("Fout bij opslaan van de beslissing:", error);

        }
    })
}


async function laadBestaandeFeedback() {
    try {
        const params = new URLSearchParams(window.location.search);
        const aanvraagId = params.get("id");
        const mode = params.get("mode");

        if (mode !== "bekijken" || !aanvraagId) {
            return;
        }

        const response = await fetch(`/api/stageaanvragen/${aanvraagId}`);

        const data = await response.json();

        if (!response.ok) {
            console.log(data.message);
            return;
        }

        const aanvraag = data.aanvraag;

        const feedbackVeld =
            document.querySelector("#commissieFeedback");

        if (feedbackVeld) {
            feedbackVeld.value =
                aanvraag.feedback || "Geen feedback beschikbaar.";

            feedbackVeld.readOnly = true;
        }

        const indienenKnop =
            document.querySelector(".feedback-indienen-btn");

        if (indienenKnop) {
            indienenKnop.style.display = "none";
        }
    } catch (error) {
        console.error("Fout bij ophalen van bestaande feedback", error);
    }
}

laadBestaandeFeedback();

const terugKnop = document.querySelector("#terugKnop");

if (terugKnop) {
    terugKnop.addEventListener("click", function () {
        window.location.href =
            "/stagecommissie/stageaanvragen";
    });
}


// Student overzicht: extra scherm tonen na beslissing stagecommissie
function toonStudentBeslissing(aanvraag) {
    const studentStatusExtra = document.querySelector("#studentStatusExtra");

    const detailsCard = document.querySelector(".details-card");

    const statusMessage = document.querySelector("#statusMessage")

    const laatsteStap = document.querySelectorAll(".progress-step")[3];

    const laatsteBol = laatsteStap?.querySelector(".progress-dot");

    const laatsteTekst = laatsteStap?.querySelector("p");

    if (!studentStatusExtra) {
        return;
    }

    studentStatusExtra.innerHTML = "";

    if (aanvraag.status === "GOEDGEKEURD") {
        updateProgressStatus("goedgekeurd");

        if (statusMessage) {
            statusMessage.textContent = "Je aanvraag werd geaccepteerd.";
        }

        if (detailsCard) {
            detailsCard.style.display = "none";
        }

        studentStatusExtra.innerHTML = `
            <div class="stage-contract-card">
                <h2>Stageovereenkomst</h2>

                <button
    class="submit-btn"
    onclick="window.location.href='/student-stageovereenkomst-detail'"
>
    Ondertekenen
</button>
            </div>
        `;
    }

    if (aanvraag.status === "AANPASSING_GEVRAAGD") {
        updateProgressStatus("behandeling");

        if (statusMessage) {
            statusMessage.textContent =
                "Je aanvraag moet aangepast worden.";
        }

        if (detailsCard) {
            detailsCard.style.display = "none";
        }

        if (laatsteTekst) {
            laatsteTekst.textContent = "Aanpassing vereist";
        }

        if (laatsteBol) {
            laatsteBol.classList.add("aanpassing-bol");
        }

        studentStatusExtra.innerHTML = `
        <div class="feedback-box">
            <strong>Feedback van de stagecommissie</strong>

            <ul>
                <li>
                    ${aanvraag.feedback || "Geen feedback beschikbaar."}
                </li>
            </ul>
        </div>

        <button
            type="button"
            class="submit-btn"
            onclick="window.location.href='/student/stageaanvraagformulier.html?id=${aanvraag.id}&mode=aanpassen'"
        >
            Aanvraag aanpassen
        </button>
    `;
    }

    if (aanvraag.status === "AFGEKEURD") {
        updateProgressStatus("behandeling");

        if (statusMessage) {
            statusMessage.textContent =
                "Je aanvraag werd afgekeurd.";
        }

        if (detailsCard) {
            detailsCard.style.display = "none";
        }

        studentStatusExtra.innerHTML = `
    <div class="feedback-box">
        <strong>Feedback van de stagecommissie</strong>
        <ul>
            <li>${aanvraag.feedback || "Geen feedback beschikbaar."}</li>
        </ul>
    </div>

    <button
        class="submit-btn"
        onclick="window.location.href='/student/stageaanvraagformulier.html'"
    >
        Nieuwe aanvraag starten
    </button>
`;

        if (laatsteTekst) {
            laatsteTekst.textContent = "Afgekeurd";
        }

        if (laatsteBol) {
            laatsteBol.classList.add("afgekeurd-bol");
        }
    }

}

async function laadAanvraagOmAanTePassen() {
    try {
        const params = new URLSearchParams(window.location.search);
        const aanvraagId = params.get("id");
        const mode = params.get("mode");

        if (mode !== "aanpassen" || !aanvraagId) {
            return;
        }

        const response = await fetch(
            `/api/stageaanvragen/${aanvraagId}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message);
            return;
        }

        const aanvraag = data.aanvraag;

        document.querySelector("#startdatum").value =
            aanvraag.startdatum
                ? aanvraag.startdatum.substring(0, 10)
                : "";

        document.querySelector("#einddatum").value =
            aanvraag.einddatum
                ? aanvraag.einddatum.substring(0, 10)
                : "";

        document.querySelector("#functie").value =
            aanvraag.functie || "";

        document.querySelector("#bedrijfsnaam").value =
            aanvraag.bedrijfsnaam || "";

        document.querySelector("#telefoonnummer").value =
            aanvraag.telefoonnummer || "";

        document.querySelector("#emailBedrijf").value =
            aanvraag.email_bedrijf || "";

        document.querySelector("#gemeente").value =
            aanvraag.gemeente || "";

        document.querySelector("#postcode").value =
            aanvraag.postcode || "";

        document.querySelector("#straat").value =
            aanvraag.straat || "";

        document.querySelector("#straatnummer").value =
            aanvraag.straatnummer || "";

        document.querySelector("#contactVoornaam").value =
            aanvraag.contact_voornaam || "";

        document.querySelector("#contactNaam").value =
            aanvraag.contact_naam || "";

        document.querySelector("#opdracht").value =
            aanvraag.opdracht || "";

        document.querySelector("#omschrijving").value =
            aanvraag.omschrijving || "";

    } catch (error) {
        console.error(
            "Fout bij laden van stageaanvraag:",
            error
        );
    }
}

if (document.querySelector("#aanvraagForm")) {
    laadAanvraagOmAanTePassen();
}