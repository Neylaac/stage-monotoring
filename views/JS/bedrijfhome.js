fetch("/api/bedrijf/stagiairs")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.status !== "success") {
            console.log(data.message);
            return;
        }

        const stagiairs = data.stagiairs || [];

        document.querySelector("#aantalStagiairs").textContent = stagiairs.length;

        const teTekenen = stagiairs.filter(function(stagiair) {
    return stagiair.bedrijf_ondertekend === 0;
}).length;

document.querySelector("#aantalTeTekenen").textContent = teTekenen;

        const lijst = document.querySelector("#bedrijfStagiairsLijst");

        if (stagiairs.length === 0) {
            lijst.textContent = "Geen stagiairs gevonden.";
            return;
        }

        lijst.innerHTML = "";

        stagiairs.slice(0, 5).forEach(function(stagiair) {
            lijst.innerHTML += `
                <div class="list-item">
                    <strong>${stagiair.voornaam} ${stagiair.achternaam}</strong><br>
                    <span>${stagiair.opleiding || "-"}</span>
                </div>
            `;
        });
    })
    .catch(function(error) {
        console.error("Fout bij laden bedrijf home:", error);
    });