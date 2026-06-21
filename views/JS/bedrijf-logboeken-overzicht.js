function formatteerDatum(datum) {
    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function laadStagiairs() {
    const stagiairsTabel =
        document.getElementById('stagiairsTabel');

    if (!stagiairsTabel) {
        return;
    }

    fetch('/api/bedrijf/stagiairs')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                stagiairsTabel.innerHTML = `
                    <tr>
                        <td colspan="4">
                            ${data.message}
                        </td>
                    </tr>
                `;
                return;
            }

            if (data.stagiairs.length === 0) {
                stagiairsTabel.innerHTML = `
                    <tr>
                        <td colspan="4">
                            Geen stagiairs gevonden.
                        </td>
                    </tr>
                `;
                return;
            }

            stagiairsTabel.innerHTML = '';

            data.stagiairs.forEach(stagiair => {
                stagiairsTabel.innerHTML += `
                    <tr>
                        <td>
                            ${stagiair.voornaam}
                            ${stagiair.achternaam}
                        </td>

                        <td>
                            ${stagiair.opleiding}
                        </td>

                        <td>
                            ${formatteerDatum(stagiair.startdatum)}
                            -
                            ${formatteerDatum(stagiair.einddatum)}
                        </td>

                        <td>
                            <a
                                href="/bedrijf/studentlogboeken?id=${stagiair.id}"
                                class="logboek-btn"
                            >
                                Logboeken bekijken
                            </a>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error(
                'Fout bij ophalen stagiairs:',
                error
            );
        });
}

laadStagiairs();