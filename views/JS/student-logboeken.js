window.onload = () => {

    function formatteerDatum(datum) {
        const datumObject = new Date(datum);

        return datumObject.toLocaleDateString('nl-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function datumZonderTijd(datum) {
        const datumObject = new Date(datum);

        datumObject.setHours(0, 0, 0, 0);

        return datumObject;
    }

    function isWeekBeschikbaar(week) {
        const vandaag = new Date();
        vandaag.setHours(0, 0, 0, 0);

        const startdatum = datumZonderTijd(week.startdatum);

        return startdatum <= vandaag;
    }

    function toonWeekStatus(week) {
    if (!isWeekBeschikbaar(week)) {
        return `
            <span class="logboek-status niet-gestart">
                Niet beschikbaar
            </span>
        `;
    }

    if (week.ingediend === 1 || week.ingediend === true) {
        return `
            <span class="logboek-status ingediend">
                Ingediend
            </span>
        `;
    }

    return `
        <span class="logboek-status ingediend">
            Beschikbaar
        </span>
    `;
}

    function toonActieKnop(week) {
    if (!isWeekBeschikbaar(week)) {
        return '';
    }

    return `
        <button
            class="logboek-btn"
            onclick="window.location.href='/student/weeklogboek?id=${week.id}'"
        >
            Bekijken
        </button>
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
    ${toonActieKnop(week)}
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