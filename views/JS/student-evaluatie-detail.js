document.addEventListener("DOMContentLoaded", () => {
    // 1. Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const evaluationType = urlParams.get("type");

    if (!evaluationType) {
        alert("Geen type gespecificeerd.");
        window.location.href = "/student/evaluatie";
        return;
    }

    // Customize title based on type
    const titleEl = document.getElementById("detail-title");
    const subtitleEl = document.getElementById("detail-subtitle");
    
    if (titleEl) {
        if (evaluationType === "ZELF_TUSSENTIJDS") {
            titleEl.textContent = "Details Zelfreflectie - Tussentijdse";
            subtitleEl.textContent = "Je eigen tussentijdse beoordelingen.";
        } else if (evaluationType === "ZELF_EIND") {
            titleEl.textContent = "Details Zelfreflectie - Eindevaluatie";
            subtitleEl.textContent = "Je eigen eindbeoordelingen.";
        } else if (evaluationType === "TUSSENTIJDS") {
            titleEl.textContent = "Details Tussentijdse evaluatie";
            subtitleEl.textContent = "Beoordeling door je stagementor en docent.";
        } else if (evaluationType === "EIND") {
            titleEl.textContent = "Details Eindevaluatie";
            subtitleEl.textContent = "Definitieve beoordeling door je stagementor en docent.";
        }
    }

    // Fetch and display user profile info in the header
    fetch("/api/student/profile")
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const student = data.student;
                const userCircle = document.querySelector(".user-circle");
                if (userCircle) {
                    userCircle.textContent = student.voornaam.charAt(0) + student.achternaam.charAt(0);
                }
            }
        });

    // 2. Fetch evaluation details
    fetch(`/api/student/evaluaties/${evaluationType}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== "success" || !data.evaluatie) {
                alert("Evaluatiegegevens konden niet worden geladen.");
                window.location.href = "/student/evaluatie";
                return;
            }

            const evalData = data.evaluatie;
            const isSelf = evaluationType.startsWith("ZELF_");

            // Populate the 5 categories
            populateCategory("planning", evalData, isSelf, "planning_score", "planning_feedback", "planning_score_docent", "planning_feedback_docent");
            populateCategory("technisch", evalData, isSelf, "technisch_score", "technisch_feedback", "technisch_score_docent", "technisch_feedback_docent");
            populateCategory("onderzoek", evalData, isSelf, "onderzoek_score", "onderzoek_feedback", "onderzoek_score_docent", "onderzoek_feedback_docent");
            populateCategory("communicatie", evalData, isSelf, "communicatie_score", "communicatie_feedback", "communicatie_score_docent", "communicatie_feedback_docent");
            populateCategory("groei", evalData, isSelf, "groei_score", "groei_feedback", "groei_score_docent", "groei_feedback_docent");

            // Calculate averages if it's a comparison view
            if (!isSelf) {
                const categories = ["planning", "technisch", "onderzoek", "communicatie", "groei"];
                
                // 1. Student Average (from zelfreflectie)
                let studentSum = 0;
                let studentCount = 0;
                categories.forEach(cat => {
                    if (data.zelfreflectie && data.zelfreflectie[`${cat}_score`]) {
                        const val = parseFloat(data.zelfreflectie[`${cat}_score`]);
                        if (!isNaN(val)) {
                            studentSum += val;
                            studentCount++;
                        }
                    }
                });
                const studentAvg = studentCount > 0 ? (studentSum / studentCount).toFixed(1) : "-";
                
                // 2. Mentor Average
                let mentorSum = 0;
                let mentorCount = 0;
                categories.forEach(cat => {
                    if (evalData[`${cat}_score`]) {
                        const val = parseFloat(evalData[`${cat}_score`]);
                        if (!isNaN(val)) {
                            mentorSum += val;
                            mentorCount++;
                        }
                    }
                });
                const mentorAvg = mentorCount > 0 ? (mentorSum / mentorCount).toFixed(1) : "-";

                // 3. Docent Average
                let docentSum = 0;
                let docentCount = 0;
                categories.forEach(cat => {
                    if (evalData[`${cat}_score_docent`]) {
                        const val = parseFloat(evalData[`${cat}_score_docent`]);
                        if (!isNaN(val)) {
                            docentSum += val;
                            docentCount++;
                        }
                    }
                });
                const docentAvg = docentCount > 0 ? (docentSum / docentCount).toFixed(1) : "-";

                const summaryCard = document.getElementById("summary-card-container");
                if (summaryCard) {
                    summaryCard.style.display = "block";
                    document.getElementById("avg_student_score").textContent = studentAvg !== "-" ? `${studentAvg} / 5` : "-";
                    document.getElementById("avg_mentor_score").textContent = mentorAvg !== "-" ? `${mentorAvg} / 5` : "-";
                    document.getElementById("avg_docent_score").textContent = docentAvg !== "-" ? `${docentAvg} / 5` : "-";
                }
            }
        })
        .catch(err => {
            console.error("Netwerkfout bij ophalen evaluatiedetails:", err);
            alert("Er is een fout opgetreden bij het ophalen van de evaluatiegegevens.");
            window.location.href = "/student/evaluatie";
        });

    // Helper to dynamically render score boxes for a category
    function populateCategory(gridId, evalData, isSelf, scoreField, feedbackField, scoreDocentField, feedbackDocentField) {
        const gridEl = document.getElementById(`grid-${gridId}`);
        if (!gridEl) return;

        gridEl.innerHTML = "";

        if (isSelf) {
            // Render single student self-reflection box
            gridEl.className = "scores-display-grid";
            const scoreVal = evalData[scoreField] || "-";
            gridEl.innerHTML = `
                <div class="score-box">
                    <div class="score-box-header">
                        <h4>JOUW ZELFREFLECTIE</h4>
                        <div class="score-value-badge">${scoreVal !== "-" ? `${scoreVal} / 5` : "-"}</div>
                    </div>
                </div>
            `;
        } else {
            // Render side-by-side boxes for mentor and docent
            gridEl.className = "scores-display-grid two-columns";
            
            const mentorScore = evalData[scoreField];
            const mentorFeedback = evalData[feedbackField];
            const docentScore = evalData[scoreDocentField];

            const mentorBoxHtml = mentorScore 
                ? `
                    <div class="score-box mentor">
                        <div class="score-box-header">
                            <h4>MENTOR (BEDRIJF)</h4>
                            <div class="score-value-badge">${mentorScore} / 5</div>
                        </div>
                        <p>${mentorFeedback || "Geen toelichting ingevuld door mentor."}</p>
                    </div>
                `
                : `
                    <div class="score-box mentor">
                        <div class="score-box-header">
                            <h4>MENTOR (BEDRIJF)</h4>
                        </div>
                        <p class="no-score-text">Nog niet ingevuld door mentor.</p>
                    </div>
                `;

            const docentBoxHtml = docentScore
                ? `
                    <div class="score-box docent">
                        <div class="score-box-header">
                            <h4>DOCENT (SCHOOL)</h4>
                            <div class="score-value-badge">${docentScore} / 5</div>
                        </div>
                    </div>
                `
                : `
                    <div class="score-box docent">
                        <div class="score-box-header">
                            <h4>DOCENT (SCHOOL)</h4>
                        </div>
                        <p class="no-score-text">Nog niet ingevuld door docent.</p>
                    </div>
                `;

            gridEl.innerHTML = mentorBoxHtml + docentBoxHtml;
        }
    }
});
