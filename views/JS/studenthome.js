fetch("/api/student/profile")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.status !== "success") {
            console.log(data.message);
            return;
        }

        const student = data.student;

        const welkomTitel = document.querySelector("#studentWelkom");
        const userCircle = document.querySelector(".user-circle");

        if (welkomTitel) {
            welkomTitel.textContent = "Welkom terug, " + student.voornaam + "!";
        }

        if (userCircle) {
            userCircle.textContent =
                student.voornaam.charAt(0) + student.achternaam.charAt(0);
        }
    })
    .catch(function(error) {
        console.error("Fout bij laden student home:", error);
    });



    fetch("/api/student/home")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.status !== "success") {
            console.log(data.message);
            return;
        }

        const stage = data.stage;

        if (!stage) {
            return;
        }

        document.querySelector("#studentBedrijf").textContent = stage.bedrijfsnaam || "-";
        document.querySelector("#studentMentor").textContent =
            (stage.contact_voornaam || "") + " " + (stage.contact_naam || "");
        document.querySelector("#studentPeriode").textContent =
            stage.startdatum + " - " + stage.einddatum;
    })
    .catch(function(error) {
        console.error("Fout bij laden student stagegegevens:", error);
    });