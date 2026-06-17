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


        document.querySelector("#stepAanvraag").classList.add("active");

if (stage.status === "GOEDGEKEURD") {
    document.querySelector("#stepGoedkeuring").classList.add("active");
}

document.querySelector("#lineAanvraagGoedkeuring").classList.add("active");

if (stage.student_ondertekend) {
    document.querySelector("#stepOvereenkomst").classList.add("active");
      document.querySelector("#lineGoedkeuringOvereenkomst").classList.add("active");
}

if (stage.student_ondertekend && stage.bedrijf_ondertekend) {
    document.querySelector("#stepActief").classList.add("active");

        document.querySelector("#lineOvereenkomstActief").classList.add("active");
}

        document.querySelector("#studentBedrijf").textContent = stage.bedrijfsnaam || "-";
        document.querySelector("#studentMentor").textContent =
            (stage.contact_voornaam || "") + " " + (stage.contact_naam || "");

        
const start = new Date(stage.startdatum).toLocaleDateString("nl-BE");
const einde = new Date(stage.einddatum).toLocaleDateString("nl-BE");
            
        document.querySelector("#studentPeriode").textContent =
              start + " - " + einde;
    })
    .catch(function(error) {
        console.error("Fout bij laden student stagegegevens:", error);
    });