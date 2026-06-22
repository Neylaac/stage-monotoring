document.addEventListener("DOMContentLoaded", () => {
    let lastZelfreflectie = null;
    let lastEvaluatie = null;

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

    // 2. Get parameters from URL
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get("studentId");
    const evaluationType = params.get("type") || "EIND"; // Default to EIND for compatibility

    if (!studentId) {
        alert("Geen student geselecteerd.");
        window.location.href = "/docent/evaluaties";
        return;
    }

    const form = document.getElementById("docentEvaluatieForm");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const docentFormTitle = document.getElementById("docentFormTitle");

    // Load comparison data
    fetch(`/api/docent/evaluaties/${studentId}/${evaluationType}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== "success") {
                alert("Fout bij het ophalen van gegevens: " + data.message);
                window.location.href = "/docent/evaluaties";
                return;
            }

            // Update title
            const isMid = evaluationType === "TUSSENTIJDS";
            docentFormTitle.textContent = isMid
                ? `Tussentijdse Evaluatie Beoordelen: ${data.studentName}`
                : `Eindevaluatie Beoordelen: ${data.studentName}`;

            const subtitleEl = document.getElementById("docentFormSubtitle");
            if (subtitleEl) {
                subtitleEl.textContent = isMid
                    ? "Gelieve de tussentijdse zelfreflectie van de student en de beoordeling van de mentor te vergelijken en uw oordeel in te voeren."
                    : "Gelieve de zelfreflectie van de student en de beoordeling van de mentor te vergelijken en uw eindoordeel in te voeren.";
            }

            lastZelfreflectie = data.zelfreflectie;
            lastEvaluatie = data.evaluatie;

            // Populate columns
            populateCategory("planning", data.zelfreflectie, data.evaluatie);
            populateCategory("technisch", data.zelfreflectie, data.evaluatie);
            populateCategory("onderzoek", data.zelfreflectie, data.evaluatie);
            populateCategory("communicatie", data.zelfreflectie, data.evaluatie);
            populateCategory("groei", data.zelfreflectie, data.evaluatie);

            // Compute averages initially
            updateCalculatedAverages(data.zelfreflectie, data.evaluatie);

            // Hide spinner and show form
            loadingIndicator.style.display = "none";
            form.style.display = "flex";
        })
        .catch(err => {
            console.error("Fout bij laden vergelijking:", err);
            alert("Interne fout bij het laden van de gegevens.");
            window.location.href = "/docent/evaluaties";
        });

    function populateCategory(category, zelfreflectie, evaluatie) {
        // 1. Zelfreflectie Student
        const studentScoreBadge = document.getElementById(`student_${category}_badge`);
        const studentFeedbackEl = document.getElementById(`student_${category}_feedback`);

        if (zelfreflectie && zelfreflectie[`${category}_score`]) {
            const score = zelfreflectie[`${category}_score`];
            studentScoreBadge.textContent = `${score} / 5`;
            studentScoreBadge.className = `status-badge green`;
            
            // Hide student feedback text field completely as requested: "feedback kan enkel de bedrijf zijn"
            if (studentFeedbackEl) {
                studentFeedbackEl.style.display = "none";
            }
        } else {
            studentScoreBadge.textContent = "Niet ingevuld";
            studentScoreBadge.className = "status-badge none";
            if (studentFeedbackEl) {
                studentFeedbackEl.textContent = "De student heeft deze zelfreflectie nog niet ingevuld.";
            }
        }

        // 2. Beoordeling Mentor
        const mentorScoreBadge = document.getElementById(`mentor_${category}_badge`);
        const mentorFeedbackEl = document.getElementById(`mentor_${category}_feedback`);

        if (evaluatie && evaluatie[`${category}_score`]) {
            const score = evaluatie[`${category}_score`];
            mentorScoreBadge.textContent = `${score} / 5`;
            mentorScoreBadge.className = `status-badge green`;
            if (mentorFeedbackEl) {
                mentorFeedbackEl.textContent = evaluatie[`${category}_feedback`] || "Geen feedback ingevoerd.";
            }
        } else {
            mentorScoreBadge.textContent = "Niet ingevuld";
            mentorScoreBadge.className = "status-badge none";
            if (mentorFeedbackEl) {
                mentorFeedbackEl.textContent = "De mentor heeft deze evaluatie nog niet ingediend.";
            }
        }

        // 3. Pre-fill Docent inputs if already evaluated
        if (evaluatie && evaluatie[`${category}_score_docent`]) {
            const docentScore = evaluatie[`${category}_score_docent`];
            const docentSelect = document.getElementById(`${category}_score`);
            if (docentSelect) docentSelect.value = docentScore;
            
            // Adjust title slightly if in edit mode
            document.getElementById("submitDocentBtn").textContent = "Beoordeling Bijwerken";
        }
    }

    function updateCalculatedAverages(zelfreflectie, evaluatie) {
        const categories = ["planning", "technisch", "onderzoek", "communicatie", "groei"];
        
        // 1. Student Average
        let studentSum = 0;
        let studentCount = 0;
        categories.forEach(cat => {
            if (zelfreflectie && zelfreflectie[`${cat}_score`]) {
                const val = parseFloat(zelfreflectie[`${cat}_score`]);
                if (!isNaN(val)) {
                    studentSum += val;
                    studentCount++;
                }
            }
        });
        const studentAvg = studentCount > 0 ? (studentSum / studentCount).toFixed(1) : "-";
        const studentAvgEl = document.getElementById("avg_student_score");
        if (studentAvgEl) studentAvgEl.textContent = studentAvg !== "-" ? `${studentAvg} / 5` : "-";

        // 2. Mentor Average
        let mentorSum = 0;
        let mentorCount = 0;
        categories.forEach(cat => {
            if (evaluatie && evaluatie[`${cat}_score`]) {
                const val = parseFloat(evaluatie[`${cat}_score`]);
                if (!isNaN(val)) {
                    mentorSum += val;
                    mentorCount++;
                }
            }
        });
        const mentorAvg = mentorCount > 0 ? (mentorSum / mentorCount).toFixed(1) : "-";
        const mentorAvgEl = document.getElementById("avg_mentor_score");
        if (mentorAvgEl) mentorAvgEl.textContent = mentorAvg !== "-" ? `${mentorAvg} / 5` : "-";

        // 3. Docent Average
        let docentSum = 0;
        let docentCount = 0;
        categories.forEach(cat => {
            const selectEl = document.getElementById(`${cat}_score`);
            if (selectEl && selectEl.value) {
                const val = parseFloat(selectEl.value);
                if (!isNaN(val)) {
                    docentSum += val;
                    docentCount++;
                }
            }
        });
        const docentAvg = docentCount > 0 ? (docentSum / docentCount).toFixed(1) : "-";
        const docentAvgEl = document.getElementById("avg_docent_score");
        if (docentAvgEl) docentAvgEl.textContent = docentAvg !== "-" ? `${docentAvg} / 5` : "-";
    }

    // Bind event listeners to dropdowns for live overall score average calculation
    const categories = ["planning", "technisch", "onderzoek", "communicatie", "groei"];
    categories.forEach(cat => {
        const select = document.getElementById(`${cat}_score`);
        if (select) {
            select.addEventListener("change", () => {
                updateCalculatedAverages(lastZelfreflectie, lastEvaluatie);
            });
        }
    });

    // Handle form submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = {
            planning_score: document.getElementById("planning_score").value,
            technisch_score: document.getElementById("technisch_score").value,
            onderzoek_score: document.getElementById("onderzoek_score").value,
            communicatie_score: document.getElementById("communicatie_score").value,
            groei_score: document.getElementById("groei_score").value
        };

        // Show loading indicator during submit
        loadingIndicator.querySelector("p").textContent = "Beoordeling indienen...";
        loadingIndicator.style.display = "flex";
        form.style.display = "none";

        fetch(`/api/docent/evaluaties/${studentId}/${evaluationType}/indienen`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Beoordeling succesvol ingediend!");
                window.location.href = "/docent/evaluaties";
            } else {
                alert("Fout bij indienen: " + data.message);
                loadingIndicator.style.display = "none";
                form.style.display = "flex";
            }
        })
        .catch(err => {
            console.error("Fout bij verzenden beoordeling:", err);
            alert("Er is een fout opgetreden bij het verzenden van de beoordeling.");
            loadingIndicator.style.display = "none";
            form.style.display = "flex";
        });
    });
});
