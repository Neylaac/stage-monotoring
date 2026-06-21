const competentieButtons =
    document.querySelectorAll('.competentie-btn');

competentieButtons.forEach(button => {

    button.addEventListener('click', () => {
        button.classList.toggle('selected');
    });

});

const datumInput = document.getElementById('datum');
const urenInput = document.getElementById('aantalUren');
const takenInput = document.getElementById('taken');
const geleerdInput = document.getElementById('geleerd');
const problemenInput = document.getElementById('problemen');

const conceptBtn = document.getElementById('conceptBtn');
const opslaanBtn = document.getElementById('opslaanBtn');

function getDaglogboekId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getWeeklogboekId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('week');
}

function vulDaglogboekIn(dag) {
    if (datumInput) {
        datumInput.value = dag.datum
            ? formatDatumVoorInput(dag.datum)
            : '';
    }

    if (urenInput) {
        urenInput.value = dag.aantal_uren || '';
    }

    if (takenInput) {
        takenInput.value = dag.taken || '';
    }

    if (geleerdInput) {
        geleerdInput.value = dag.geleerd || '';
    }

    if (problemenInput) {
        problemenInput.value = dag.problemen || '';
    }

    if (dag.competenties) {
        const competenties = JSON.parse(dag.competenties);

        competentieButtons.forEach(button => {
            if (competenties.includes(button.textContent.trim())) {
                button.classList.add('selected');
            }
        });
    }


    if (dag.status === 'INGEVULD') {
        if (conceptBtn) {
            conceptBtn.style.display = 'none';
        }

        if (opslaanBtn) {
            opslaanBtn.style.display = 'none';
        }

        datumInput.disabled = true;
        urenInput.disabled = true;
        takenInput.disabled = true;
        geleerdInput.disabled = true;
        problemenInput.disabled = true;

        competentieButtons.forEach(button => {
            button.disabled = true;
        });
    }
}


const terugKnop = document.getElementById('terugKnop');

if (terugKnop) {
    terugKnop.href =
        '/student/weeklogboek?id=' + getWeeklogboekId();
}

function formatDatumVoorInput(datum) {
    const datumObject = new Date(datum);

    const jaar = datumObject.getFullYear();
    const maand = String(datumObject.getMonth() + 1).padStart(2, '0');
    const dag = String(datumObject.getDate()).padStart(2, '0');

    return jaar + '-' + maand + '-' + dag;
}


function laadDaglogboek() {
    const daglogboekId = getDaglogboekId();

    if (!daglogboekId) {
        return;
    }

    fetch('/api/daglogboeken/' + daglogboekId)
        .then(response => response.json())
        .then(dag => {
            vulDaglogboekIn(dag);
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen daglogboek:',
                error
            );
        });
}

function getGeselecteerdeCompetenties() {
    return Array.from(competentieButtons)
        .filter(button => button.classList.contains('selected'))
        .map(button => button.textContent.trim());
}

function verzamelLogboekData() {
    return {
        daglogboekId: getDaglogboekId(),
        datum: datumInput.value,
        aantalUren: urenInput.value,
        taken: takenInput.value,
        geleerd: geleerdInput.value,
        problemen: problemenInput.value,
        competenties: getGeselecteerdeCompetenties()
    };
}

function slaDaglogboekOp() {
    const logboekData = verzamelLogboekData();

    fetch('/api/daglogboeken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logboekData)
    })
        .then(response => response.json())
        .then(data => {

            if (data.status !== 'success') {
                alert(data.message);
                return;
            }

            sessionStorage.setItem(
                'successMessage',
                'Daglogboek opgeslagen'
            );

            window.location.href =
                '/student/weeklogboek?id=' + getWeeklogboekId();
        })
        .catch(error => {
            console.error(error);
            alert('Opslaan mislukt');
        });
}

if (opslaanBtn) {
    opslaanBtn.addEventListener('click', () => {
        slaDaglogboekOp();
    });
}

if (conceptBtn) {
    conceptBtn.addEventListener('click', () => {
        slaDaglogboekOp();
    });
}

laadDaglogboek();