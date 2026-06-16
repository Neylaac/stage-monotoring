const laatsteAanvragenList = document.querySelector("#laatsteAanvragenList");

if (laatsteAanvragenList) {
    fetch("/api/stagecommissie/stageaanvragen")
        .then(function(response) {
            return response.json();
        })
        .then(function(aanvragen) {
            const totaal = aanvragen.length;

            const inBehandeling = aanvragen.filter(function(aanvraag) {
                return aanvraag.status === "INGEDIEND" ||
                       aanvraag.status === "IN_BEHANDELING";
            }).length;

            const goedgekeurd = aanvragen.filter(function(aanvraag) {
                return aanvraag.status === "GOEDGEKEURD";
            }).length;

            document.querySelector("#countStagevoorstel").textContent =
                totaal + " wachten";

            document.querySelector("#countGoedkeuring").textContent =
                inBehandeling + " behandelen";

            document.querySelector("#countOvereenkomst").textContent =
                goedgekeurd + " ontbrekend";

            document.querySelector("#countEvaluatie").textContent =
                "0 gepland";

            laatsteAanvragenList.innerHTML = "";
            
aanvragen.slice(0, 4).forEach(function(aanvraag) {
                laatsteAanvragenList.innerHTML += `
                    <div class="latest-item">
                        <div>
                            <strong>${aanvraag.voornaam || aanvraag.naam || "Student"} ${aanvraag.achternaam || ""}</strong>
                            <small>${aanvraag.bedrijfsnaam || "Geen bedrijf"}</small>
                        </div>

                        <span class="status ${aanvraag.status ? aanvraag.status.toLowerCase() : "in_afwachting"}">
                            ${aanvraag.status || "In afwachting"}
                        </span>
                    </div>
                `;
            });
        })
        .catch(function(error) {
            console.error("Fout bij laden stagecommissie home:", error);
        });
}