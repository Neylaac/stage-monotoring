window.onload = () => {

    function getWeeklogboekId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    function toonDagStatus(dag) {
        if (dag.status === 'INGEVULD') {
            return `
            <span class="logboek-status ingediend">
                Ingevuld
            </span>
        `;
        }

        return `
        <span class="logboek-status niet-ingediend">
            Niet ingevuld
        </span>
    `;
    }

    function toonDagActie(dag) {
        if (dag.status === 'INGEVULD') {
            return `
            <a
                href="/student/daglogboek?id=${dag.id}&week=${getWeeklogboekId()}"
                class="logboek-btn"
            >
                Bekijken
            </a>
        `;
        }

        return `
        <a
            href="/student/daglogboek?id=${dag.id}&week=${getWeeklogboekId()}"
            class="logboek-btn"
        >
            Invullen
        </a>
    `;
    }

    let weekIngediend = false;

    function toonWeekControle(week) {
    const weekControle = document.getElementById('weekControle');

    if (!weekControle) {
        return;
    }

    if (week.ingediend !== 1 && week.ingediend !== true) {
        weekControle.innerHTML = '';
        return;
    }

    let statusTekst = 'Ingediend';
    let statusClass = 'status-badge';
    let mentorTekst = 'Nog niet nagekeken';
    let feedbackTekst = 'Nog geen feedback';

    if (week.afgetekend === 1 || week.afgetekend === true) {
        statusTekst = 'Afgecheckt';
        statusClass = 'status-badge ingediend';

        mentorTekst =
            week.contact_voornaam +
            ' ' +
            week.contact_naam;

        if (week.mentor_feedback) {
            feedbackTekst = week.mentor_feedback;
        }
    }

    weekControle.innerHTML = `
        <div class="mentor-card">
            <h2>Weekcontrole door stagementor</h2>

            <div class="mentor-grid">
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
    `;
}

    function laadWeekInfo() {
        const weeklogboekId = getWeeklogboekId();

        return fetch('/api/weeklogboeken/' + weeklogboekId)
            .then(response => response.json())
            .then(week => {
                weekIngediend =
                    week.ingediend === 1 ||
                    week.ingediend === true;

                toonWeekControle(week);
            })
            .catch(error => {
                console.error(
                    'Fout bij ophalen weeklogboek:',
                    error
                );
            });
    }


    function toonWeekIndienenKnop(dagen) {
        const weekActies = document.getElementById('weekActies');

        if (!weekActies) {
            return;
        }

        if (weekIngediend) {
            weekActies.innerHTML = '';
            return;
        }

        const alleDagenIngevuld = dagen.every(dag => {
            return dag.status === 'INGEVULD';
        });

        if (!alleDagenIngevuld) {
            weekActies.innerHTML = '';
            return;
        }

        weekActies.innerHTML = `
        <button id="weekIndienenKnop" class="submit-btn">
            Week indienen
        </button>
    `;

        document
            .getElementById('weekIndienenKnop')
            .addEventListener('click', () => {
                dienWeekIn();
            });
    }

    function dienWeekIn() {
        const weeklogboekId = getWeeklogboekId();

        fetch('/api/weeklogboeken/' + weeklogboekId + '/indienen', {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    alert(data.message);
                    return;
                }
                weekIngediend = true;

                laadWeekInfo().then(() => {
                    laadDagen();
                });
            })
            .catch(error => {
                console.error(error);
                alert('Week indienen mislukt');
            });
    }

    function laadDagen() {
        const dagenTabel = document.getElementById('dagenTabel');

        if (!dagenTabel) {
            return;
        }

        const weeklogboekId = getWeeklogboekId();

        if (!weeklogboekId) {
            dagenTabel.innerHTML = `
                <tr>
                    <td colspan="3">
                        Geen weeklogboek gevonden.
                    </td>
                </tr>
            `;
            return;
        }

        fetch('/api/weeklogboeken/' + weeklogboekId + '/daglogboeken')
            .then(response => response.json())
            .then(data => {

                if (data.status !== 'success') {
                    dagenTabel.innerHTML = `
                        <tr>
                            <td colspan="3">
                                ${data.message}
                            </td>
                        </tr>
                    `;
                    return;
                }

                if (data.dagen.length === 0) {
                    dagenTabel.innerHTML = `
                        <tr>
                            <td colspan="3">
                                Geen dagen gevonden.
                            </td>
                        </tr>
                    `;
                    return;
                }

                dagenTabel.innerHTML = '';

                data.dagen.forEach(dag => {
                    dagenTabel.innerHTML += `
                        <tr>
                            <td>
                                <strong>${dag.dag_naam}</strong>
                            </td>

                            <td>
                                ${toonDagStatus(dag)}
                            </td>

                            <td>
                                ${toonDagActie(dag)}
                            </td>
                        </tr>
                    `;
                });

                toonWeekIndienenKnop(data.dagen);
            })
            .catch(error => {
                console.error(
                    'Fout bij ophalen daglogboeken:',
                    error
                );
            });
    }

    laadWeekInfo().then(() => {
        laadDagen();
    });
};