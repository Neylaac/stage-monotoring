function laadStudentStageovereenkomst() {
    fetch('/api/student/stageovereenkomst').then(response => response.json()).then(data => {

        console.log(data);
        if (data.status !== 'success') {
            console.log(data.message);
            return;
        }

        const overeenkomst = data.stageovereenkomst;

        document.querySelector('#studentNaam').textContent = overeenkomst.voornaam + ' ' + overeenkomst.achternaam;
        document.querySelector('#studentOpleiding').textContent = overeenkomst.opleiding;
        document.querySelector('#stageBedrijf').textContent = overeenkomst.bedrijfsnaam;
        document.querySelector('#stagePeriode').textContent = overeenkomst.startdatum + ' ' + overeenkomst.einddatum;
        document.querySelector('#stageOpdracht').textContent = overeenkomst.opdracht + ' ' + overeenkomst.omschrijving;


        if (overeenkomst.student_ondertekend === 1) {
            const handtekeningAfbeelding =
                document.querySelector('#studentHandtekening');

            const signatureContainer =
                document.querySelector('#signatureContainer');

            const terugKnop =
                document.querySelector('#terugNaarOverzicht');

            if (overeenkomst.student_handtekening) {
                handtekeningAfbeelding.src =
                    overeenkomst.student_handtekening;

                handtekeningAfbeelding.style.display = 'block';
            }

            const bedrijfHandtekening =
                document.querySelector('#bedrijfHandtekening');

            if (overeenkomst.bedrijf_handtekening) {
                bedrijfHandtekening.src =
                    overeenkomst.bedrijf_handtekening;

                bedrijfHandtekening.style.display = 'block';
            }

            const schoolHandtekening =
                document.querySelector('#schoolHandtekening');

            if (overeenkomst.school_handtekening) {
                schoolHandtekening.src =
                    overeenkomst.school_handtekening;

                schoolHandtekening.style.display = 'block';
            }

            signatureContainer.style.display = 'none';
            terugKnop.style.display = 'block';
        }
    })

        .catch(error => {
            console.error("Fout bij laden stageovereenkomst", error)
        })




    const canvas = document.querySelector('#signatureCanvas');

    if (canvas) {
        const context = canvas.getContext('2d');

        let aanHetTekenen = false;
        let heeftGetekend = false;

        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = '#000000';

        canvas.addEventListener('mousedown', function (event) {
            aanHetTekenen = true;
            heeftGetekend = true;

            context.beginPath();
            context.moveTo(
                event.offsetX,
                event.offsetY
            );
        });

        canvas.addEventListener('mousemove', function (event) {
            if (!aanHetTekenen) {
                return;
            }

            context.lineTo(
                event.offsetX,
                event.offsetY
            );

            context.stroke();
        });

        canvas.addEventListener('mouseup', function () {
            aanHetTekenen = false;
        });

        canvas.addEventListener('mouseleave', function () {
            aanHetTekenen = false;
        });

        const wissenKnop = document.querySelector('#wissenKnop');

        wissenKnop.addEventListener('click', function () {
            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            heeftGetekend = false;
        });

        const ondertekenenKnop =
            document.querySelector('#ondertekenenKnop');

        ondertekenenKnop.addEventListener('click', function () {
            if (!heeftGetekend) {
                alert('Plaats eerst je handtekening.');
                return;
            }

            const handtekening = canvas.toDataURL('image/png');

            fetch('/api/student/stageovereenkomst/ondertekenen', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    handtekening: handtekening
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status !== 'success') {
                        alert(data.message);
                        return;
                    }

                    const handtekeningAfbeelding =
                        document.querySelector('#studentHandtekening');

                    const signatureContainer =
                        document.querySelector('#signatureContainer');

                    const terugKnop =
                        document.querySelector('#terugNaarOverzicht');

                    handtekeningAfbeelding.src = handtekening;
                    handtekeningAfbeelding.style.display = 'block';

                    signatureContainer.style.display = 'none';
                    terugKnop.style.display = 'block';
                })
                .catch(error => {
                    console.error(
                        'Fout bij digitaal ondertekenen:',
                        error
                    );
                });
        });


        const terugNaarOverzicht =
            document.querySelector('#terugNaarOverzicht');

        if (terugNaarOverzicht) {
            terugNaarOverzicht.addEventListener('click', function () {
                window.location.href =
                    '/student/stageovereenkomsten';
            });
        }
    }
}

laadStudentStageovereenkomst();