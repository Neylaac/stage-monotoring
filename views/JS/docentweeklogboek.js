function getWeeklogboekId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getAanvraagId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('student');
}

function toonWeekControle(week) {
    const weekControle = document.getElementById('weekControle');

    let statusTekst = 'Niet afgetekend';
    let statusClass = 'logboek-status niet-ingediend';
    let mentorTekst = '-';
    let feedbackTekst = 'Geen feedback.';

    if (week.afgetekend === 1 || week.afgetekend === true) {
        statusTekst = 'Afgetekend';
        statusClass = 'logboek-status ingediend';
        mentorTekst = week.contact_voornaam + ' ' + week.contact_naam;

        if (week.mentor_feedback) {
            feedbackTekst = week.mentor_feedback;
        }
    }

    weekControle.innerHTML = `
        <div class="weekcontrole-card">
            <div class="weekcontrole-icon">
                <i class="fa-solid fa-clipboard-check"></i>
            </div>

            <div class="weekcontrole-content">
                <h2>Weekcontrole door stagementor</h2>

                <div class="weekcontrole-grid">
                    <div>
                        <span>Status</span>
                        <p class="${statusClass}">
                            ${statusTekst}
                        </p>
                    </div>

                    <div>
                        <span>Mentor</span>
                        <p>${mentorTekst}</p>
                    </div>

                    <div>
                        <span>Feedback</span>
                        <p>${feedbackTekst}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function laadWeekInfo() {
    const weeklogboekId = getWeeklogboekId();

    fetch('/api/weeklogboeken/' + weeklogboekId)
        .then(response => response.json())
        .then(week => {
            console.log(week);
            toonWeekControle(week);
        })
        .catch(error => {
            console.error('Fout bij ophalen weeklogboek:', error);
        });
}

function toonDagStatus(dag) {
    if (dag.status === 'INGEVULD') {
        return `
            <span class="logboek-status ingediend">
                ingevuld
            </span>
        `;
    }

    return `
        <span class="logboek-status niet-ingediend">
            Niet ingediend
        </span>
    `;
}

function laadDaglogboeken() {
    const weeklogboekId = getWeeklogboekId();
    const aanvraagId = getAanvraagId();
    const tabel = document.getElementById('daglogboekenTabel');

    fetch('/api/weeklogboeken/' + weeklogboekId + '/daglogboeken')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.status !== 'success') {
                tabel.innerHTML = `
                    <tr>
                        <td colspan="3">
                            ${data.message}
                        </td>
                    </tr>
                `;
                return;
            }

            tabel.innerHTML = '';

            data.dagen.forEach(dag => {
                tabel.innerHTML += `
                    <tr>
                        <td>
                            <strong>${dag.dag_naam}</strong>
                        </td>

                        <td>
                            ${toonDagStatus(dag)}
                        </td>

                        <td>
                            <a
                                href="/docent/daglogboek?id=${dag.id}&week=${weeklogboekId}&student=${aanvraagId}"
                                class="logboek-btn"
                            >
                                Bekijken
                            </a>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Fout bij ophalen daglogboeken:', error);
        });
}

const terugKnop = document.getElementById('terugKnop');

if (terugKnop) {
    terugKnop.href = '/docent/logboeken?id=' + getAanvraagId();
}

laadWeekInfo();
laadDaglogboeken();