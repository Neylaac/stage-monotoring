function getAanvraagId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatteerDatum(datum) {
    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function toonWeekStatus(week) {
    if (week.afgetekend === 1 || week.afgetekend === true) {
        return `
            <span class="logboek-status ingediend">
                Goedgekeurd
            </span>
        `;
    }

    return `
        <span class="logboek-status niet-ingediend">
            Ingediend
        </span>
    `;
}

function laadWeeklogboeken() {
    const wekenTabel =
        document.getElementById('weeklogboekenTabel');

    const aanvraagId =
        getAanvraagId();

    if (!wekenTabel || !aanvraagId) {
        return;
    }

    fetch('/api/docent/student/' + aanvraagId + '/logboeken')
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
                            Geen ingediende weeklogboeken gevonden.
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
                            <strong>
                                Week ${week.weeknummer}
                            </strong>
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
                            <a
                                href="/docent/weeklogboek?id=${week.id}&student=${aanvraagId}"
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
                'Fout bij ophalen weeklogboeken:',
                error
            );
        });
}

const terugKnop =
    document.querySelector('.form-actions a');

if (terugKnop) {
    terugKnop.href =
        '/docent/studentdetails?id=' + getAanvraagId();
}

laadWeeklogboeken();