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
                    href="/student/daglogboek?id=${dag.id}"
                    class="logboek-btn"
                >
                    Bekijken
                </a>
            `;
        }

        return `
            <a
                href="/student/daglogboek?id=${dag.id}"
                class="logboek-btn"
            >
                Invullen
            </a>
        `;
    }

    function toonWeekIndienenKnop(dagen) {
        const weekActies = document.getElementById('weekActies');

        if (!weekActies) {
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
            <button class="submit-btn">
                Week indienen
            </button>
        `;
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

    laadDagen();
};