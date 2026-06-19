window.onload = () => {

    function formatteerDatum(datum) {
        const datumObject = new Date(datum);

        return datumObject.toLocaleDateString('nl-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function toonWeekStatus(week) {
        if (week.ingediend === 1) {
            return `
                <span class="logboek-status ingediend">
                    Ingediend
                </span>
            `;
        }

        return `
            <span class="logboek-status niet-ingediend">
                Niet ingediend
            </span>
        `;
    }

    function laadWeken() {
        const wekenTabel =
            document.getElementById('wekenTabel');

        if (!wekenTabel) {
            return;
        }

        fetch('/api/student/logboeken')
            .then(response => response.json())
            .then(data => {

                console.log(data);

                if (data.status !== 'success') {
                    wekenTabel.innerHTML = `
                        <tr>
                            <td colspan="4">
                                ${data.message}
                            </td>
                        </tr>
                    `;

                    return;
                }

                if (data.weken.length === 0) {
                    wekenTabel.innerHTML = `
                        <tr>
                            <td colspan="4">
                                Geen logboeken gevonden.
                            </td>
                        </tr>
                    `;

                    return;
                }

                wekenTabel.innerHTML = '';

                data.weken.forEach(week => {

                    wekenTabel.innerHTML += `
                        <tr>
                            <td>
                                <strong>Week ${week.weeknummer}</strong>
                            </td>

                            <td>
                                ${formatteerDatum(week.startdatum)}
                                -
                                ${formatteerDatum(week.einddatum)}
                            </td>

                            <td>
                                ${toonWeekStatus(week)}
                            </td>

                            <td>
                                <button
                                    class="logboek-btn"
                                    onclick="window.location.href='/student/weeklogboek?id=${week.id}'"
                                >
                                    Bekijken
                                </button>
                            </td>
                        </tr>
                    `;
                });
            })
            .catch(error => {
                console.error(
                    'Fout bij ophalen logboeken:',
                    error
                );
            });
    }

    laadWeken();
};