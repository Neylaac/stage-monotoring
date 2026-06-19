const laatsteAanvragenList = document.querySelector("#laatsteAanvragenList");

if (laatsteAanvragenList) {
    fetch("/api/stagecommissie/stageaanvragen")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            const aanvragen = data.aanvragen || [];

            // 1. Stagevoorstel: proposals waiting for initial processing (INGEDIEND)
            const wachten = aanvragen.filter(function(aanvraag) {
                return aanvraag.status === "INGEDIEND";
            }).length;

            // 2. Goedkeuring: in treatment / adjustments requested
            const behandelen = aanvragen.filter(function(aanvraag) {
                return aanvraag.status === "IN_BEHANDELING" || 
                       aanvraag.status === "AANPASSING_GEVRAAGD";
            }).length;

            // 3. Overeenkomst: approved but signature(s) missing
            const ontbrekend = aanvragen.filter(function(aanvraag) {
                return aanvraag.status === "GOEDGEKEURD" && 
                       (aanvraag.student_ondertekend !== 1 || 
                        aanvraag.bedrijf_ondertekend !== 1 || 
                        aanvraag.school_ondertekend !== 1);
            }).length;

            // 4. Evaluatie: approved and fully signed (active stage)
            const gepland = aanvragen.filter(function(aanvraag) {
                return aanvraag.status === "GOEDGEKEURD" && 
                       aanvraag.student_ondertekend === 1 && 
                       aanvraag.bedrijf_ondertekend === 1 && 
                       aanvraag.school_ondertekend === 1;
            }).length;

            document.querySelector("#countStagevoorstel").textContent =
                wachten + " wachten";

            document.querySelector("#countGoedkeuring").textContent =
                behandelen + " behandelen";

            document.querySelector("#countOvereenkomst").textContent =
                ontbrekend + " ontbrekend";

            document.querySelector("#countEvaluatie").textContent =
                gepland + " gepland";

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
