document.addEventListener("DOMContentLoaded", () => {
    // 1. Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("studentId");
    const evaluationType = urlParams.get("type"); // 'TUSSENTIJDS' or 'EIND'

    if (!studentId || !evaluationType || (evaluationType !== "TUSSENTIJDS" && evaluationType !== "EIND")) {
        alert("Ongeldige parametergegevens.");
        window.location.href = "/bedrijf/evaluatie";
        return;
    }

    const isMidterm = evaluationType === "TUSSENTIJDS";

    // Fetch and display user profile details in the topbar
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
        });

    // 2. Fetch student's self-reflection & existing company review
    fetch(`/api/bedrijf/evaluaties/${studentId}/${evaluationType}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== "success") {
                alert("Evaluatiegegevens konden niet worden opgehaald.");
                window.location.href = "/bedrijf/evaluatie";
                return;
            }

            // Set page headers containing student's name
            const formTitleEl = document.getElementById("form-title");
            if (formTitleEl) {
                formTitleEl.textContent = isMidterm 
                    ? `Tussentijdse evaluatie voor ${data.studentName}` 
                    : `Eindevaluatie voor ${data.studentName}`;
            }

            const selfReflection = data.zelfreflectie;
            const mentorEvaluation = data.evaluatie;

            // Populate Student Self-Reflection Boxes
            populateStudentReflection("planning", selfReflection, "planning_score", "planning_feedback");
            populateStudentReflection("technisch", selfReflection, "technisch_score", "technisch_feedback");
            populateStudentReflection("onderzoek", selfReflection, "onderzoek_score", "onderzoek_feedback");
            populateStudentReflection("communicatie", selfReflection, "communicatie_score", "communicatie_feedback");
            populateStudentReflection("groei", selfReflection, "groei_score", "groei_feedback");

            // Pre-fill Mentor Existing Review (if any)
            if (mentorEvaluation) {
                prefillMentorField("planning_score", mentorEvaluation.planning_score);
                prefillMentorField("planning_feedback", mentorEvaluation.planning_feedback);

                prefillMentorField("technisch_score", mentorEvaluation.technisch_score);
                prefillMentorField("technisch_feedback", mentorEvaluation.technisch_feedback);

                prefillMentorField("onderzoek_score", mentorEvaluation.onderzoek_score);
                prefillMentorField("onderzoek_feedback", mentorEvaluation.onderzoek_feedback);

                prefillMentorField("communicatie_score", mentorEvaluation.communicatie_score);
                prefillMentorField("communicatie_feedback", mentorEvaluation.communicatie_feedback);

                prefillMentorField("groei_score", mentorEvaluation.groei_score);
                prefillMentorField("groei_feedback", mentorEvaluation.groei_feedback);
            }
        })
        .catch(err => {
            console.error("Netwerkfout bij ophalen vergelijking:", err);
            alert("Er is een fout opgetreden bij het laden van de gegevens.");
        });

    // Helper to display student's self-reflection score/comments
    function populateStudentReflection(key, selfReflectionObj, scoreKey, feedbackKey) {
        const box = document.getElementById(`box-student-${key}`);
        if (!box) return;

        if (selfReflectionObj && selfReflectionObj[scoreKey]) {
            box.innerHTML = `
                <h4>ZELFREFLECTIE STAGIAIR <span class="student-score-badge">${selfReflectionObj[scoreKey]}</span></h4>
                <p>${selfReflectionObj[feedbackKey] || "Geen toelichting ingevuld door stagiair."}</p>
            `;
        } else {
            box.innerHTML = `
                <h4>ZELFREFLECTIE STAGIAIR</h4>
                <p class="no-score-text"><i class="fa-solid fa-triangle-exclamation"></i> Stagiair heeft de zelfreflectie nog niet ingevuld.</p>
            `;
        }
    }

    // Helper to pre-fill form fields
    function prefillMentorField(id, value) {
        const el = document.getElementById(id);
        if (el && value) {
            el.value = value;
        }
    }

    // 3. Form submit handler
    const form = document.getElementById("bedrijfEvaluatieForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = {
            studentId: studentId,
            type: evaluationType,
            planning_score: document.getElementById("planning_score").value,
            planning_feedback: document.getElementById("planning_feedback").value,
            technisch_score: document.getElementById("technisch_score").value,
            technisch_feedback: document.getElementById("technisch_feedback").value,
            onderzoek_score: document.getElementById("onderzoek_score").value,
            onderzoek_feedback: document.getElementById("onderzoek_feedback").value,
            communicatie_score: document.getElementById("communicatie_score").value,
            communicatie_feedback: document.getElementById("communicatie_feedback").value,
            groei_score: document.getElementById("groei_score").value,
            groei_feedback: document.getElementById("groei_feedback").value
        };

        fetch("/api/bedrijf/evaluatie/indienen", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("De evaluatie is succesvol ingediend!");
                window.location.href = "/bedrijf/evaluatie";
            } else {
                alert("Fout bij opslaan: " + data.message);
            }
        })
        .catch(err => {
            console.error("Netwerkfout bij indienen bedrijf-evaluatie:", err);
            alert("Er is een fout opgetreden bij het indienen van de evaluatie.");
        });
    });
});
