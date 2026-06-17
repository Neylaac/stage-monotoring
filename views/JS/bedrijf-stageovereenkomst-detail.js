window.window.onload = () => {

    function formatteerDatum(datum) {
        const datumObject = new Date(datum);

        return datumObject.toLocaleDateString('nl-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function toonStatus(elementId, ondertekend) {
        const status = document.getElementById(elementId);

        if (ondertekend === 1) {
            status.textContent = 'Ondertekend';
            status.classList.remove('waiting');
            status.classList.add('signed');
        } else {
            status.textContent = 'In afwachting';
            status.classList.remove('signed');
            status.classList.add('waiting');
        }
    }

    function toonHandtekening(elementId, handtekening, tekst) {
        const vak = document.getElementById(elementId);

        if (handtekening) {
            vak.innerHTML = `
                <img
                    src="${handtekening}"
                    alt="Handtekening"
                    class="signature-image"
                >
            `;
        } else {
            vak.textContent = tekst;
        }
    }

    const params = new URLSearchParams(window.location.search);
    const aanvraagId = params.get('id');

    if (!aanvraagId) {
        console.log('Geen stageaanvraag-id gevonden');
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

            const volledigeNaam =
                student.voornaam + ' ' + student.achternaam;

            const stageperiode =
                formatteerDatum(student.startdatum) +
                ' - ' +
                formatteerDatum(student.einddatum);

            document.getElementById('studentInitialen').textContent =
                student.voornaam.charAt(0) +
                student.achternaam.charAt(0);

            document.getElementById('studentNaam').textContent =
                volledigeNaam;

            document.getElementById('studentOpleiding').textContent =
                student.opleiding;

            document.getElementById('studentStageperiode').textContent =
                stageperiode;

            document.getElementById('contractStudentNaam').textContent =
                volledigeNaam;

            document.getElementById('contractOpleiding').textContent =
                student.opleiding;

            document.getElementById('contractBedrijf').textContent =
                student.bedrijfsnaam;

            document.getElementById('contractStageperiode').textContent =
                stageperiode;

            document.getElementById('contractOpdracht').textContent =
                student.opdracht;

            toonStatus(
                'studentStatus',
                student.student_ondertekend
            );

            toonStatus(
                'bedrijfStatus',
                student.bedrijf_ondertekend
            );

            toonStatus(
                'schoolStatus',
                student.school_ondertekend
            );

            toonHandtekening(
                'studentHandtekening',
                student.student_handtekening,
                'Nog niet ondertekend'
            );

            toonHandtekening(
                'bedrijfHandtekening',
                student.bedrijf_handtekening,
                'Nog niet ondertekend'
            );

            toonHandtekening(
                'schoolHandtekening',
                student.school_handtekening,
                'Nog niet ondertekend'
            );

            const ondertekenKnop =
                document.querySelector('.sign-button');

            if (
                student.student_ondertekend === 1 &&
                student.bedrijf_ondertekend === 0
            ) {
                ondertekenKnop.style.display = 'block';
            } else {
                ondertekenKnop.style.display = 'none';
            }

            const terugKnop =
                document.querySelector('.back-button');

            terugKnop.onclick = function () {
                window.location.href =
                    '/bedrijf-student-overzicht?id=' +
                    aanvraagId;
            };
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen stageovereenkomst:',
                error
            );
        });
};
