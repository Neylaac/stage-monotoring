console.log('Docent studentdetails JavaScript geladen');

function formatteerDatum(datum) {
    if (!datum) {
        return '-';
    }

    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function laadStudentDetails() {
    const params =
        new URLSearchParams(window.location.search);

    const aanvraagId =
        params.get('id');

    if (!aanvraagId) {
        console.log('Geen aanvraag-id gevonden');
        return;
    }

    fetch('/api/docent/student/' + aanvraagId)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            if (data.status !== 'success') {
                console.log(data.message);
                return;
            }

            const student =
                data.student || data;

            if (!student) {
                console.log('Geen student gevonden');
                return;
            }

            const volledigeNaam =
                student.voornaam +
                ' ' +
                student.achternaam;

            document.getElementById(
                'studentInitialen'
            ).textContent =
                student.voornaam.charAt(0) +
                student.achternaam.charAt(0);

            document.getElementById(
                'studentNaam'
            ).textContent =
                volledigeNaam;

            document.getElementById(
                'studentOpleiding'
            ).textContent =
                student.opleiding;

            document.getElementById(
                'studentStageperiode'
            ).textContent =
                formatteerDatum(student.startdatum) +
                ' - ' +
                formatteerDatum(student.einddatum);

            document.getElementById(
                'studentNummer'
            ).textContent =
                student.studentnummer;

            document.getElementById(
                'studentEmail'
            ).textContent =
                student.email;

            document.getElementById(
                'stageBedrijf'
            ).textContent =
                student.bedrijfsnaam;

            document.getElementById(
                'stageMentor'
            ).textContent =
                student.contact_voornaam +
                ' ' +
                student.contact_naam;

            document.getElementById(
                'stageTelefoon'
            ).textContent =
                student.telefoonnummer;

            const logboekenKnop =
                document.getElementById('logboekenKnop');

            const evaluatiesKnop =
                document.getElementById('evaluatiesKnop');

            logboekenKnop.onclick = function () {
                window.location.href =
                    '/docent/logboeken?id=' + aanvraagId;
            };

            evaluatiesKnop.onclick = function () {
                window.location.href =
                    '/docent/evaluaties?id=' + aanvraagId;
            };
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen studentdetails:',
                error
            );
        });
}

laadStudentDetails();