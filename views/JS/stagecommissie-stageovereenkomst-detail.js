window.onload = () => {

    console.log('Stagecommissie detail JS geladen');

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

    function toonHandtekening(elementId, handtekening) {
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
            vak.textContent = 'Nog niet ondertekend';
        }
    }

    const params = new URLSearchParams(window.location.search);
    const aanvraagId = params.get('id');

    if (!aanvraagId) {
        console.log('Geen stageaanvraag-id gevonden');
        return;
    }

    const tekenVak = document.getElementById('tekenVak');
    const canvas = document.getElementById('handtekeningCanvas');
    const context = canvas.getContext('2d');

    const ondertekenKnop = document.getElementById('ondertekenKnop');
    const wissenKnop = document.getElementById('wissenKnop');
    const opslaanKnop = document.getElementById('opslaanKnop');
    const terugKnop = document.getElementById('terugKnop');

    let tekenen = false;
    let heeftGetekend = false;

    tekenVak.style.display = 'none';

    canvas.width = 600;
    canvas.height = 200;

    context.lineWidth = 2;
    context.lineCap = 'round';

    function laadStageovereenkomst() {
        fetch('/api/stagecommissie/stageovereenkomsten/' + aanvraagId)
            .then(response => response.json())
            .then(data => {

                console.log(data);

                if (data.status !== 'success') {
                    console.log(data.message);
                    return;
                }

                const overeenkomst = data.stageovereenkomst;

                const volledigeNaam =
                    overeenkomst.voornaam + ' ' + overeenkomst.achternaam;

                const stageperiode =
                    formatteerDatum(overeenkomst.startdatum) +
                    ' - ' +
                    formatteerDatum(overeenkomst.einddatum);

                document.getElementById('studentInitialen').textContent =
                    overeenkomst.voornaam.charAt(0) +
                    overeenkomst.achternaam.charAt(0);

                document.getElementById('studentNaam').textContent =
                    volledigeNaam;

                document.getElementById('studentOpleiding').textContent =
                    overeenkomst.opleiding;

                document.getElementById('studentStageperiode').textContent =
                    stageperiode;

                document.getElementById('contractStudentNaam').textContent =
                    volledigeNaam;

                document.getElementById('contractOpleiding').textContent =
                    overeenkomst.opleiding;

                document.getElementById('contractBedrijf').textContent =
                    overeenkomst.bedrijfsnaam;

                document.getElementById('contractStageperiode').textContent =
                    stageperiode;

                document.getElementById('contractOpdracht').textContent =
                    overeenkomst.opdracht + ' - ' + overeenkomst.omschrijving;

                toonStatus(
                    'studentStatus',
                    overeenkomst.student_ondertekend
                );

                toonStatus(
                    'bedrijfStatus',
                    overeenkomst.bedrijf_ondertekend
                );

                toonStatus(
                    'schoolStatus',
                    overeenkomst.school_ondertekend
                );

                toonHandtekening(
                    'studentHandtekening',
                    overeenkomst.student_handtekening
                );

                toonHandtekening(
                    'bedrijfHandtekening',
                    overeenkomst.bedrijf_handtekening
                );

                toonHandtekening(
                    'schoolHandtekening',
                    overeenkomst.school_handtekening
                );

                if (overeenkomst.school_ondertekend === 1) {
                    ondertekenKnop.style.display = 'none';
                    tekenVak.style.display = 'none';
                } else {
                    ondertekenKnop.style.display = 'block';
                }
            })
            .catch(error => {
                console.error(
                    'Fout bij ophalen stageovereenkomst:',
                    error
                );
            });
    }

    canvas.addEventListener('mousedown', function (event) {
        tekenen = true;
        heeftGetekend = true;

        context.beginPath();
        context.moveTo(event.offsetX, event.offsetY);
    });

    canvas.addEventListener('mousemove', function (event) {
        if (!tekenen) {
            return;
        }

        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();
    });

    canvas.addEventListener('mouseup', function () {
        tekenen = false;
    });

    canvas.addEventListener('mouseleave', function () {
        tekenen = false;
    });

    ondertekenKnop.onclick = function () {
        tekenVak.style.display = 'block';

        tekenVak.scrollIntoView({
            behavior: 'smooth'
        });
    };

    wissenKnop.onclick = function () {
        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        heeftGetekend = false;
    };

    opslaanKnop.onclick = function () {
        if (!heeftGetekend) {
            alert('Plaats eerst je handtekening');
            return;
        }

        const handtekening =
            canvas.toDataURL('image/png');

        fetch(
            '/api/stagecommissie/stageovereenkomsten/' +
            aanvraagId +
            '/ondertekenen',
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    handtekening: handtekening
                })
            }
        )
            .then(response => response.json())
            .then(data => {

                if (data.status !== 'success') {
                    alert(data.message);
                    return;
                }

                alert('Stageovereenkomst ondertekend door school');

                window.location.reload();
            })
            .catch(error => {
                console.error(
                    'Fout bij ondertekenen:',
                    error
                );
            });
    };

    terugKnop.onclick = function () {
        window.location.href =
            '/stagecommissie-stageovereenkomst-overzicht';
    };

    laadStageovereenkomst();

};