console.log('bedrijf JavaScript geladen');

function formatteerDatum(datum) {
    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function laadStagiairs() {
    fetch('/api/bedrijf/stagiairs')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const stagiairsTabel = document.querySelector('#stagiairsTabel');

            if (data.status !== 'success') {
                console.log(data.message);
                return
            }


            if (data.stagiairs.length === 0) {
                stagiairsTabel.innerHTML = `
                    <tr>
                        <td colspan="4">
                            Geen stagiairs gevonden.
                        </td>
                    </tr>
                `;
                return
            }

            stagiairsTabel.innerHTML = ``;
            data.stagiairs.forEach(stagiair => {
                const initialen =
                    stagiair.voornaam.charAt(0) +
                    stagiair.achternaam.charAt(0);

                stagiairsTabel.innerHTML += `
                    <tr>
                        <td class="student-cell">
                            <div class="student-avatar">
                                ${initialen}
                            </div>

                            <div>
                                ${stagiair.voornaam}
                                ${stagiair.achternaam}
                            </div>
                        </td>

                        <td>
                            ${stagiair.opleiding}
                        </td>

                        <td>
                            ${formatteerDatum(stagiair.startdatum)}
                            <br>
                            -
                            ${formatteerDatum(stagiair.einddatum)}
                        </td>

                        <td>
                             <button
                                class="view-button"
                                onclick="window.location.href='/bedrijf-student-overzicht?id=${stagiair.id}'"
                                >
                                Bekijken
                                </button>
                        </td>
                    </tr>
                `;

            });

        })

        .catch(error => {
            console.error('Fout bij ophalen van stagiairs', error)
        })
}


laadStagiairs();