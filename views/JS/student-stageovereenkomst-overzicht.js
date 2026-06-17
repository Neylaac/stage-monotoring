function toonStatus(element, isOndertekend) {
    if (isOndertekend === 1) {
        element.textContent = 'Ondertekend';

        element.classList.remove('waiting');
        element.classList.add('signed');

        return;
    }

    element.textContent = 'In afwachting';

    element.classList.remove('signed');
    element.classList.add('waiting');
}

function laadStageovereenkomstStatus() {
    fetch('/api/student/stageovereenkomst')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                console.log(data.message);
                return;
            }

            const overeenkomst = data.stageovereenkomst;

            const studentStatus =
                document.querySelector('#studentStatus');

            const bedrijfStatus =
                document.querySelector('#bedrijfStatus');

            const schoolStatus =
                document.querySelector('#schoolStatus');

            toonStatus(
                studentStatus,
                overeenkomst.student_ondertekend
            );

            toonStatus(
                bedrijfStatus,
                overeenkomst.bedrijf_ondertekend
            );

            toonStatus(
                schoolStatus,
                overeenkomst.school_ondertekend
            );

            const welkomTekst =
                document.querySelector('#welkomTekst');

            welkomTekst.textContent =
                'Welkom terug, ' +
                overeenkomst.voornaam +
                '!';
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen ondertekenstatus:',
                error
            );
        });
}

const bekijkOvereenkomstKnop =
    document.querySelector('#bekijkOvereenkomstKnop');

if (bekijkOvereenkomstKnop) {
    bekijkOvereenkomstKnop.addEventListener(
        'click',
        function () {
            window.location.href =
                '/student-stageovereenkomst-detail';
        }
    );
}

laadStageovereenkomstStatus();