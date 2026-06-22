function getDaglogboekId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getWeeklogboekId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('week');
}

function getStudentId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('student');
}

function formatDatumVoorInput(datum) {
    const datumObject = new Date(datum);

    const jaar = datumObject.getFullYear();

    const maand = String(
        datumObject.getMonth() + 1
    ).padStart(2, '0');

    const dag = String(
        datumObject.getDate()
    ).padStart(2, '0');

    return jaar + '-' + maand + '-' + dag;
}

function toonCompetenties(competenties) {
    const knoppen =
        document.querySelectorAll('.competentie-btn');

    let gekozenCompetenties = [];

    if (competenties) {
        gekozenCompetenties = JSON.parse(competenties);
    }

    knoppen.forEach(knop => {
        const naam = knop.textContent.trim();

        if (gekozenCompetenties.includes(naam)) {
            knop.classList.add('selected');
        } else {
            knop.classList.remove('selected');
        }
    });
}

function laadDaglogboek() {
    const daglogboekId = getDaglogboekId();

    if (!daglogboekId) {
        console.log('Geen daglogboek-id gevonden');
        return;
    }

    fetch('/api/daglogboeken/' + daglogboekId)
        .then(response => response.json())
        .then(dag => {

            console.log(dag);

            document.getElementById('datum').value =
                formatDatumVoorInput(dag.datum);

            document.getElementById('aantalUren').value =
                dag.aantal_uren;

            document.getElementById('taken').value =
                dag.taken;

            document.getElementById('geleerd').value =
                dag.geleerd;

            document.getElementById('problemen').value =
                dag.problemen || '';

            toonCompetenties(dag.competenties);
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen daglogboek:',
                error
            );
        });
}

const terugKnop =
    document.querySelector('.form-actions a');

if (terugKnop) {
    terugKnop.href =
        '/docent/weeklogboek?id=' +
        getWeeklogboekId() +
        '&student=' +
        getStudentId();
}

laadDaglogboek();