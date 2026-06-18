window.onload = () => {

    function formatteerDatum(datum) {
        const datumObject = new Date(datum);

        return datumObject.toLocaleDateString('nl-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    const params = new URLSearchParams(window.location.search);
    const aanvraagId = params.get('id');

    if (!aanvraagId) {
        console.log('Geen student-id gevonden');
        return;
    }

    fetch('/api/bedrijf/stagiairs/' + aanvraagId)
        .then(response => response.json())
        .then(data => {

            if (data.status !== 'success') {
                console.log(data.message);
                return;
            }

            const student = data.student;

            document.getElementById('studentInitialen').textContent =
                student.voornaam.charAt(0) +
                student.achternaam.charAt(0);

            document.getElementById('studentNaam').textContent =
                student.voornaam + ' ' + student.achternaam;

            document.getElementById('studentOpleiding').textContent =
                student.opleiding;

            document.getElementById('studentStageperiode').textContent =
                formatteerDatum(student.startdatum) +
                ' - ' +
                formatteerDatum(student.einddatum);

            document.getElementById('studentEmail').textContent =
                student.email;

            document.getElementById('studentTelefoon').textContent =
                student.telefoonnummer;

            document.getElementById('studentBedrijf').textContent =
                student.bedrijfsnaam;

            document.getElementById('studentMentor').textContent =
                student.contact_voornaam +
                ' ' +
                student.contact_naam;

            document.getElementById('overeenkomstKnop')
                .addEventListener('click', function () {

                    window.location.href =
                        '/bedrijf-stageovereenkomst-detail?id=' +
                        student.id;
                });
        })
        .catch(error => {
            console.error('Fout bij ophalen student:', error);
        });

};