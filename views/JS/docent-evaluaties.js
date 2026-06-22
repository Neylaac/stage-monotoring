document.addEventListener("DOMContentLoaded", () => {
    let allStudenten = [];

    // 1. Ophalen van ingelogde docent profiel
    fetch("/api/user/profile")
        .then(response => response.json())
        .then(data => {
            if (data.status !== "success") return;
            const user = data.user;
            const circle = document.getElementById("userCircle");
            if (circle) {
                circle.textContent = user.voornaam.charAt(0) + user.achternaam.charAt(0);
            }
        })
        .catch(err => console.error("Fout bij laden profiel:", err));

    // 2. Ophalen van studenten en evaluatiestatussen
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const tussentijdsTbody = document.getElementById("tussentijdsTableBody");
    const eindTbody = document.getElementById("eindTableBody");

    function fetchEvaluaties() {
        fetch("/api/docent/evaluaties")
            .then(response => response.json())
            .then(data => {
                if (data.status !== "success") {
                    const errMsg = `
                        <tr>
                            <td colspan="6" class="empty-state" style="color: #c62828;">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <p>Fout bij laden van studentengegevens: ${data.message || 'Onbekende fout'}</p>
                            </td>
                        </tr>
                    `;
                    if (tussentijdsTbody) tussentijdsTbody.innerHTML = errMsg;
                    if (eindTbody) eindTbody.innerHTML = errMsg;
                    return;
                }

                allStudenten = data.studenten || [];
                renderTable();
            })
            .catch(err => {
                console.error("Fout bij laden evaluaties:", err);
                const errMsg = `
                    <tr>
                        <td colspan="6" class="empty-state" style="color: #c62828;">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p>Interne fout bij het ophalen van de gegevens.</p>
                        </td>
                    </tr>
                `;
                if (tussentijdsTbody) tussentijdsTbody.innerHTML = errMsg;
                if (eindTbody) eindTbody.innerHTML = errMsg;
            });
    }

    function populateTable(tbody, type, students) {
        if (!tbody) return;
        tbody.innerHTML = "";
        
        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>Geen studenten gevonden die voldoen aan de criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        students.forEach(s => {
            const tr = document.createElement("tr");

            // Check keys depending on type
            const isMid = type === "TUSSENTIJDS";
            const zelfExists = isMid ? (s.zelf_tussentijds_exists > 0) : (s.zelf_eind_exists > 0);
            const mentorExists = isMid ? (s.mentor_tussentijds_exists > 0) : (s.mentor_eind_exists > 0);
            const docentBeoordeeld = isMid ? (s.docent_tussentijds_beoordeeld > 0) : (s.docent_eind_beoordeeld > 0);

            // Badges
            const zelfBadge = zelfExists
                ? '<span class="status-badge green">Ingevuld</span>'
                : '<span class="status-badge red">Niet ingevuld</span>';

            const mentorBadge = mentorExists
                ? '<span class="status-badge green">Ingevuld</span>'
                : '<span class="status-badge red">Niet ingevuld</span>';

            let docentBadge = '';
            let actieKnop = '';

            if (docentBeoordeeld) {
                docentBadge = '<span class="status-badge green">Finaal beoordeeld</span>';
                actieKnop = `<a href="/docent/evaluaties/beoordelen?studentId=${s.student_id}&type=${type}" class="action-btn secondary"><i class="fa-solid fa-pen-to-square"></i> Wijzigen</a>`;
            } else if (zelfExists && mentorExists) {
                docentBadge = '<span class="status-badge orange">Te beoordelen</span>';
                actieKnop = `<a href="/docent/evaluaties/beoordelen?studentId=${s.student_id}&type=${type}" class="action-btn primary"><i class="fa-solid fa-gavel"></i> Beoordelen</a>`;
            } else {
                docentBadge = '<span class="status-badge grey">Wachten op submissions</span>';
                actieKnop = `<button class="action-btn disabled"><i class="fa-solid fa-hourglass-start"></i> Wachten</button>`;
            }

            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="user-circle" style="background-color: #832D2C; width: 34px; height: 34px; font-size: 13px;">
                            ${s.voornaam.charAt(0)}${s.achternaam.charAt(0)}
                        </div>
                        <div>
                            <strong style="color: #333; font-size: 15px;">${s.voornaam} ${s.achternaam}</strong>
                            <span style="display: block; font-size: 12px; color: #777;">${s.email}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <strong style="color: #555; font-size: 14px;">${s.studentnummer || "-"}</strong>
                    <span style="display: block; font-size: 12px; color: #777;">${s.opleiding || "-"}</span>
                </td>
                <td style="text-align: center;">${zelfBadge}</td>
                <td style="text-align: center;">${mentorBadge}</td>
                <td style="text-align: center;">${docentBadge}</td>
                <td style="text-align: center;">${actieKnop}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderTable() {
        const query = searchInput.value.toLowerCase().trim();
        const filterVal = statusFilter.value;

        // Helper to filter students for a specific type
        function filterForType(type) {
            return allStudenten.filter(s => {
                // Text search
                const naam = `${s.voornaam} ${s.achternaam}`.toLowerCase();
                const nummer = (s.studentnummer || "").toLowerCase();
                const opleiding = (s.opleiding || "").toLowerCase();
                const matchesText = naam.includes(query) || nummer.includes(query) || opleiding.includes(query);

                if (!matchesText) return false;

                // Status checks based on type
                const isMid = type === "TUSSENTIJDS";
                const zelfExists = isMid ? (s.zelf_tussentijds_exists > 0) : (s.zelf_eind_exists > 0);
                const mentorExists = isMid ? (s.mentor_tussentijds_exists > 0) : (s.mentor_eind_exists > 0);
                const docentBeoordeeld = isMid ? (s.docent_tussentijds_beoordeeld > 0) : (s.docent_eind_beoordeeld > 0);

                if (filterVal === "TODO") {
                    return zelfExists && mentorExists && !docentBeoordeeld;
                } else if (filterVal === "DONE") {
                    return docentBeoordeeld;
                } else if (filterVal === "WAITING") {
                    return !zelfExists || !mentorExists;
                }

                return true;
            });
        }

        populateTable(tussentijdsTbody, "TUSSENTIJDS", filterForType("TUSSENTIJDS"));
        populateTable(eindTbody, "EIND", filterForType("EIND"));
    }

    // Event listeners
    if (searchInput) searchInput.addEventListener("input", renderTable);
    if (statusFilter) statusFilter.addEventListener("change", renderTable);

    // Initial fetch
    fetchEvaluaties();
});
