document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch and display user profile details in the topbar
    fetch("/api/user/profile")
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const user = data.user;
                const userAvatarEl = document.querySelector(".user-avatar-top");
                if (userAvatarEl) {
                    userAvatarEl.textContent = user.voornaam.charAt(0) + user.achternaam.charAt(0);
                }
            }
        })
        .catch(err => {
            console.error("Fout bij laden bedrijfprofiel:", err);
        });

    // 2. Fetch trainees list and status from DB
    fetch("/api/bedrijf/evaluaties")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("traineesEvaluatieBody");
            if (!tableBody) return;

            if (data.status !== "success" || !data.trainees || data.trainees.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 30px; color: #888;">
                            Geen actieve stagiairs gevonden met een volledig ondertekend contract.
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = "";

            data.trainees.forEach(trainee => {
                const initials = trainee.voornaam.charAt(0) + trainee.achternaam.charAt(0);
                const fullName = trainee.voornaam + " " + trainee.achternaam;

                const tr = document.createElement("tr");

                // Trainee Name / Avatar cell
                const nameTd = document.createElement("td");
                nameTd.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="user-avatar" style="background-color: #832D2C; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            ${initials}
                        </div>
                        <div>
                            <strong>${fullName}</strong>
                        </div>
                    </div>
                `;
                tr.appendChild(nameTd);

                // Opleiding cell
                const majorTd = document.createElement("td");
                majorTd.textContent = trainee.opleiding;
                tr.appendChild(majorTd);

                // Tussentijdse cell (Midterm)
                const midtermTd = document.createElement("td");
                const isMidtermFilled = trainee.tussentijds.status === "Ingevuld";
                midtermTd.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span class="status-badge ${isMidtermFilled ? 'green' : 'grey'}">
                            ${isMidtermFilled ? 'Ingevuld' : 'Niet ingevuld'}
                        </span>
                        <a href="/bedrijf/evaluatie/invullen?studentId=${trainee.student_id}&type=TUSSENTIJDS" class="eval-btn ${isMidtermFilled ? 'view' : 'fill'}">
                            <i class="fa-solid ${isMidtermFilled ? 'fa-eye' : 'fa-pen'}"></i>
                            ${isMidtermFilled ? 'Bekijken' : 'Invullen'}
                        </a>
                    </div>
                `;
                tr.appendChild(midtermTd);

                // Eindevaluatie cell (Final)
                const eindTd = document.createElement("td");
                const isEindFilled = trainee.eind.status === "Ingevuld";
                eindTd.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span class="status-badge ${isEindFilled ? 'green' : 'grey'}">
                            ${isEindFilled ? 'Ingevuld' : 'Niet ingevuld'}
                        </span>
                        <a href="/bedrijf/evaluatie/invullen?studentId=${trainee.student_id}&type=EIND" class="eval-btn ${isEindFilled ? 'view' : 'fill'}">
                            <i class="fa-solid ${isEindFilled ? 'fa-eye' : 'fa-pen'}"></i>
                            ${isEindFilled ? 'Bekijken' : 'Invullen'}
                        </a>
                    </div>
                `;
                tr.appendChild(eindTd);

                tableBody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Fout bij laden stagiairs evaluaties:", err);
            const tableBody = document.getElementById("traineesEvaluatieBody");
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 30px; color: #d32f2f;">
                            Fout bij het ophalen van gegevens.
                        </td>
                    </tr>
                `;
            }
        });
});
