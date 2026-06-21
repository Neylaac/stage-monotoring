function getWeeklogboekId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getStudentId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('student');
}

function formatteerDatum(datum) {
    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function laadWeekInfo() {
    const weeklogboekId = getWeeklogboekId();

    if (!weeklogboekId) {
        return;
    }

    fetch('/api/weeklogboeken/' + weeklogboekId)
        .then(response => response.json())
        .then(week => {
            const feedbackVak =
                document.getElementById('feedback');

            const goedkeurBtn =
                document.getElementById('goedkeurBtn');

            if (!feedbackVak || !goedkeurBtn) {
                return;
            }

            if (week.mentor_feedback) {
                feedbackVak.value = week.mentor_feedback;
            }

            if (week.afgetekend === 1 || week.afgetekend === true) {
                feedbackVak.readOnly = true;
                goedkeurBtn.style.display = 'none';

                const melding = document.createElement('div');

                melding.textContent =
                    'De week werd afgetekend, de student kan nu je feedback zien';

                melding.classList.add('success-message');

                const content =
                    document.querySelector('.content');

                content.insertBefore(
                    melding,
                    content.querySelector('.logboek-table-card')
                );
            }
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen weeklogboek:',
                error
            );
        });
}

function laadDaglogboeken() {
    const weeklogboekId = getWeeklogboekId();
    const studentId = getStudentId();

    if (!weeklogboekId) {
        return;
    }

    fetch('/api/weeklogboeken/' + weeklogboekId + '/daglogboeken')
        .then(response => response.json())
        .then(data => {
            const tabel = document.getElementById('daglogboekenTabel');

            if (!tabel) {
                return;
            }

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
                            ${formatteerDatum(dag.datum)}
                        </td>

                        <td>
                            <span class="logboek-status ingediend">
                                Ingevuld
                            </span>
                        </td>

                        <td>
                            <a
                                href="/bedrijf/daglogboek?id=${dag.id}&week=${weeklogboekId}&student=${studentId}"
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
            console.error(
                'Fout bij ophalen daglogboeken:',
                error
            );
        });
}

laadWeekInfo();
laadDaglogboeken();

const goedkeurBtn = document.getElementById('goedkeurBtn');

if (goedkeurBtn) {
    goedkeurBtn.addEventListener('click', () => {
        const weeklogboekId = getWeeklogboekId();

        const feedback =
            document.getElementById('feedback').value;

        fetch(
            '/api/weeklogboeken/' +
            weeklogboekId +
            '/goedkeuren',
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    feedback: feedback
                })
            }
        )
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    alert(data.message);
                    return;
                }

                alert('Weeklogboek goedgekeurd');

                window.location.href =
                    '/bedrijf/studentlogboeken?id=' +
                    getStudentId();
            })
            .catch(error => {
                console.error(
                    'Fout bij goedkeuren weeklogboek:',
                    error
                );

                alert('Goedkeuren mislukt');
            });
    });
}


const terugKnop = document.querySelector('.form-actions a');

if (terugKnop) {
    terugKnop.href =
        '/bedrijf/studentlogboeken?id=' +
        getStudentId();
}