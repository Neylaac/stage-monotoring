// Ophalen van ingelogde bedrijf-gebruiker profiel
fetch("/api/user/profile")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") return;
        const user = data.user;
        
        const welkomTitel = document.querySelector("#bedrijfWelkom");
        const userCircle = document.querySelector(".user-circle");

        if (welkomTitel) {
            welkomTitel.textContent = `Welkom terug, ${user.voornaam}!`;
        }

        if (userCircle) {
            userCircle.textContent = (user.voornaam.charAt(0) + user.achternaam.charAt(0)).toUpperCase();
        }
    })
    .catch(error => {
        console.error("Fout bij ophalen bedrijf profiel:", error);
    });

// Ophalen van gekoppelde docenten (stagementoren) van de school
fetch("/api/bedrijf/begeleiders")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") return;
        const begeleiders = data.begeleiders || [];
        const mentorNaamEl = document.querySelector("#mentorNaam");
        const aantalBegeleidersEl = document.querySelector("#aantalBegeleiders");

        if (aantalBegeleidersEl) {
            aantalBegeleidersEl.textContent = begeleiders.length;
        }

        if (mentorNaamEl) {
            if (begeleiders.length === 0) {
                mentorNaamEl.textContent = "Nog niet gekoppeld";
            } else {
                const namen = begeleiders.map(b => `${b.voornaam} ${b.achternaam}`).join(", ");
                mentorNaamEl.textContent = namen;
            }
        }
    })
    .catch(error => {
        console.error("Fout bij ophalen begeleiders:", error);
    });

// Ophalen van stagiairs en statistieken
fetch("/api/bedrijf/stagiairs")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") {
            console.log(data.message);
            return;
        }

        const stagiairs = data.stagiairs || [];

        const aantalStagiairsEl = document.querySelector("#aantalStagiairs");
        if (aantalStagiairsEl) aantalStagiairsEl.textContent = stagiairs.length;

        const teTekenen = stagiairs.filter(s => s.bedrijf_ondertekend === 0).length;
        const aantalTeTekenenEl = document.querySelector("#aantalTeTekenen");
        if (aantalTeTekenenEl) aantalTeTekenenEl.textContent = teTekenen;

        const lijst = document.querySelector("#bedrijfStagiairsLijst");
        if (lijst) {
            if (stagiairs.length === 0) {
                lijst.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #64748b; padding: 30px;">
                            Geen actieve stagiairs gevonden.
                        </td>
                    </tr>
                `;
                return;
            }

            lijst.innerHTML = "";
            stagiairs.forEach(stagiair => {
                const initials = (stagiair.voornaam.charAt(0) + stagiair.achternaam.charAt(0)).toUpperCase();
                
                // Signature badge
                let statusBadge = "";
                let actionBtnText = "Bekijken";
                if (stagiair.bedrijf_ondertekend === 1) {
                    statusBadge = `<span class="badge badge-success"><i class="fa-solid fa-check"></i> Ondertekend</span>`;
                } else {
                    statusBadge = `<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Te ondertekenen</span>`;
                    actionBtnText = "Ondertekenen";
                }

                lijst.innerHTML += `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <div class="avatar-circle">${initials}</div>
                                <div class="user-name-wrapper">
                                    <span class="user-name">${stagiair.voornaam} ${stagiair.achternaam}</span>
                                </div>
                            </div>
                        </td>
                        <td>${stagiair.opleiding || "-"}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <a href="/bedrijf-stageovereenkomst-detail?id=${stagiair.id}" class="action-btn">
                                <i class="fa-solid fa-file-signature"></i> ${actionBtnText}
                            </a>
                        </td>
                    </tr>
                `;
            });
        }
    })
    .catch(error => {
        console.error("Fout bij laden bedrijf home:", error);
    });