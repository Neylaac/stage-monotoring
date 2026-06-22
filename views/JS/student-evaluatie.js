// Fetch and display user profile info in the header
fetch("/api/student/profile")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") {
            console.log(data.message);
            return;
        }

        const student = data.student;
        const userCircle = document.querySelector(".user-circle");

        if (userCircle) {
            userCircle.textContent =
                student.voornaam.charAt(0) + student.achternaam.charAt(0);
        }
    })
    .catch(error => {
        console.error("Fout bij laden student profiel:", error);
    });

// Fetch evaluation statuses and populate the dashboard cards
fetch("/api/student/evaluaties")
    .then(response => response.json())
    .then(data => {
        if (data.status !== "success") {
            console.error("Fout bij laden evaluaties:", data.message);
            return;
        }

        const evaluaties = data.evaluaties;

        // Populate Zelfreflectie - Tussentijdse
        updateEvaluationCard(
            "zelf-tussentijds",
            evaluaties.ZELF_TUSSENTIJDS,
            "/student/zelfreflectie/invullen?type=ZELF_TUSSENTIJDS",
            "/student/evaluatie/detail?type=ZELF_TUSSENTIJDS",
            "Niet ingevuld"
        );

        // Populate Tussentijdse evaluatie
        updateEvaluationCard(
            "tussentijds",
            evaluaties.TUSSENTIJDS,
            null,
            "/student/evaluatie/detail?type=TUSSENTIJDS",
            "In afwachting"
        );

        // Populate Zelfreflectie - Eindevaluatie
        const isTussentijdsFilled = evaluaties.ZELF_TUSSENTIJDS.status === "Ingevuld";
        if (!isTussentijdsFilled) {
            const statusEl = document.getElementById("status-zelf-eind");
            const btnEl = document.getElementById("btn-zelf-eind");
            if (statusEl && btnEl) {
                statusEl.className = "status-badge grey";
                statusEl.textContent = "Vergrendeld";
                btnEl.className = "btn btn-red disabled";
                btnEl.textContent = "Nog niet beschikbaar";
                btnEl.href = "#";
            }
        } else {
            updateEvaluationCard(
                "zelf-eind",
                evaluaties.ZELF_EIND,
                "/student/zelfreflectie/invullen?type=ZELF_EIND",
                "/student/evaluatie/detail?type=ZELF_EIND",
                "Niet ingevuld"
            );
        }

        // Populate Eindevaluatie
        updateEvaluationCard(
            "eind",
            evaluaties.EIND,
            null,
            "/student/evaluatie/detail?type=EIND",
            "In afwachting"
        );
    })
    .catch(error => {
        console.error("Fout bij ophalen evaluatiestatussen:", error);
    });

// Helper function to update card layout based on API status values
function updateEvaluationCard(cardKey, dataObj, fillUrl, viewUrl, pendingLabel) {
    const statusEl = document.getElementById(`status-${cardKey}`);
    const btnEl = document.getElementById(`btn-${cardKey}`);

    if (!statusEl || !btnEl) return;

    // Reset classes
    statusEl.className = "status-badge";
    btnEl.className = "btn btn-red";

    if (dataObj.status === "Ingevuld") {
        statusEl.classList.add("green");
        statusEl.textContent = "Ingevuld";
        
        btnEl.textContent = "Bekijken";
        btnEl.href = viewUrl;
    } else {
        // Red badge for self-reflection, Orange badge for mentor/school waiting
        if (pendingLabel === "Niet ingevuld") {
            statusEl.classList.add("red");
            statusEl.textContent = "Niet ingevuld";
            
            btnEl.textContent = "Invullen";
            btnEl.href = fillUrl;
        } else {
            statusEl.classList.add("orange");
            statusEl.textContent = "In afwachting";
            
            btnEl.textContent = "In afwachting";
            btnEl.classList.add("disabled");
            btnEl.href = "#";
        }
    }
}
