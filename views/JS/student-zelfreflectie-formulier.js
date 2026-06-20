document.addEventListener("DOMContentLoaded", () => {
    // 1. Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const evaluationType = urlParams.get("type");

    if (!evaluationType || (evaluationType !== "ZELF_TUSSENTIJDS" && evaluationType !== "ZELF_EIND")) {
        alert("Ongeldige of ontbrekende evaluatietype.");
        window.location.href = "/student/evaluatie";
        return;
    }

    // Customize title based on type
    const formTitleEl = document.getElementById("form-title");
    const isMidterm = evaluationType === "ZELF_TUSSENTIJDS";
    
    if (formTitleEl) {
        formTitleEl.textContent = isMidterm 
            ? "Mijn Zelfreflectie - Tussentijdse evaluatie" 
            : "Mijn Zelfreflectie - Eindevaluatie";
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

    // 2. Fetch existing data (if any) to pre-fill the form
    fetch(`/api/student/evaluaties/${evaluationType}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" && data.evaluatie) {
                const evalData = data.evaluatie;
                
                // Pre-fill planning
                setFormValue("planning_score", evalData.planning_score);
                setFormValue("planning_feedback", evalData.planning_feedback);

                // Pre-fill technisch
                setFormValue("technisch_score", evalData.technisch_score);
                setFormValue("technisch_feedback", evalData.technisch_feedback);

                // Pre-fill onderzoek
                setFormValue("onderzoek_score", evalData.onderzoek_score);
                setFormValue("onderzoek_feedback", evalData.onderzoek_feedback);

                // Pre-fill communicatie
                setFormValue("communicatie_score", evalData.communicatie_score);
                setFormValue("communicatie_feedback", evalData.communicatie_feedback);

                // Pre-fill groei
                setFormValue("groei_score", evalData.groei_score);
                setFormValue("groei_feedback", evalData.groei_feedback);
            }
        })
        .catch(err => {
            // Evaluatie doesn't exist yet, which is expected for new submissions.
            console.log("Geen eerdere zelfreflectie gevonden. Starten met een leeg formulier.");
        });

    // Helper to set element value safely
    function setFormValue(id, value) {
        const el = document.getElementById(id);
        if (el && value) {
            el.value = value;
        }
    }

    // 3. Form submit handler
    const form = document.getElementById("zelfreflectieForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = {
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

        fetch("/api/student/evaluatie/zelfreflectie", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Je zelfreflectie is succesvol opgeslagen!");
                window.location.href = "/student/evaluatie";
            } else {
                alert("Fout bij opslaan: " + data.message);
            }
        })
        .catch(err => {
            console.error("Netwerkfout bij opslaan zelfreflectie:", err);
            alert("Er is een fout opgetreden bij het indienen van de zelfreflectie.");
        });
    });
});
