// Ophalen van ingelogde docent profiel
fetch("/api/user/profile")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") return;
        const user = data.user;

        const userCircle = document.querySelector("#userCircle");
        if (userCircle) {
            userCircle.textContent = user.voornaam.charAt(0) + user.achternaam.charAt(0);
        }
    })
    .catch(error => {
        console.error("Fout bij ophalen docent profiel:", error);
    });

// Ophalen van docent statistieken en studenten
fetch("/api/docent/home")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") {
            console.error(data.message);
            return;
        }

        // 1. Update statistieken
        const aantalStudentenEl = document.querySelector("#aantalDocentStudenten");
        if (aantalStudentenEl) aantalStudentenEl.textContent = data.totaalStudenten || 0;

        const aantalActieveStagesEl = document.querySelector("#aantalActieveStages");
        if (aantalActieveStagesEl) aantalActieveStagesEl.textContent = data.actieveStages || 0;

        const aantalOpenEvaluatiesEl = document.querySelector("#aantalOpenEvaluaties");
        if (aantalOpenEvaluatiesEl) aantalOpenEvaluatiesEl.textContent = data.openEvaluaties || 0;

        // 2. Vul tabel met studenten
        const tbody = document.getElementById("docentStudentenBody");
        if (!tbody) return;

        const studenten = data.studenten || [];
        tbody.innerHTML = "";

        if (studenten.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table">
                        Er zijn momenteel geen studenten aan jou gekoppeld.
                    </td>
                </tr>
            `;
            return;
        }

        studenten.forEach(s => {
            const tr = document.createElement("tr");

            // Status badges voor handtekeningen
            const studentBadge = s.student_ondertekend === 1 
                ? '<span class="status goedgekeurd" style="padding: 3px 8px; font-size: 11px;">Getekend</span>' 
                : '<span class="status in_afwachting" style="padding: 3px 8px; font-size: 11px;">Open</span>';

            const bedrijfBadge = s.bedrijf_ondertekend === 1 
                ? '<span class="status goedgekeurd" style="padding: 3px 8px; font-size: 11px;">Getekend</span>' 
                : '<span class="status in_afwachting" style="padding: 3px 8px; font-size: 11px;">Open</span>';

            const schoolBadge = s.school_ondertekend === 1 
                ? '<span class="status goedgekeurd" style="padding: 3px 8px; font-size: 11px;">Getekend</span>' 
                : '<span class="status in_afwachting" style="padding: 3px 8px; font-size: 11px;">Open</span>';

            const statusTekst = `<div style="display: flex; gap: 5px;">S: ${studentBadge} B: ${bedrijfBadge} D: ${schoolBadge}</div>`;

            // Action button (redirect naar docent detailpagina)
            const actieKnop = s.aanvraag_id 
                ? `<a href="/stageovereenkomst-detail?id=${s.aanvraag_id}" class="view-btn" style="font-size: 12px; padding: 6px 12px; display: inline-block;">Bekijken</a>`
                : `<span style="color: #999; font-style: italic;">Geen aanvraag</span>`;

            tr.innerHTML = `
                <td>
                    <strong>${s.voornaam} ${s.achternaam}</strong>
                    <span style="display: block; font-size: 12px; color: #777;">${s.email}</span>
                </td>
                <td>
                    <strong>${s.studentnummer || "-"}</strong>
                    <span style="display: block; font-size: 12px; color: #777;">${s.opleiding || "-"}</span>
                </td>
                <td>${s.bedrijfsnaam || "-"}</td>
                <td>${statusTekst}</td>
                <td>${actieKnop}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error("Fout bij laden docent studenten data:", error);
    });
