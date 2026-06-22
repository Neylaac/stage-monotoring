function formatteerDatum(datum) {
    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function toonInitialen(voornaam, achternaam) {
    return (
        (voornaam || '').charAt(0) +
        (achternaam || '').charAt(0)
    ).toUpperCase();
}

function laadDocentProfiel() {
    fetch('/api/user/profile')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                return;
            }

            const initialen =
                document.getElementById('docentInitialen');

            if (initialen) {
                initialen.textContent =
                    toonInitialen(
                        data.user.voornaam,
                        data.user.achternaam
                    );
            }
        })
        .catch(error => {
            console.error('Fout bij ophalen docent profiel:', error);
        });
}

function laadStudenten() {
    const studentenTabel =
        document.getElementById('docentStudentenTabel');

    if (!studentenTabel) {
        return;
    }

    fetch('/api/docent/home')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                studentenTabel.innerHTML = `
                    <tr>
                        <td colspan="4">
                            ${data.message || 'Studenten konden niet geladen worden.'}
                        </td>
                    </tr>
                `;
                return;
            }

            const studenten = data.studenten || [];

            if (studenten.length === 0) {
                studentenTabel.innerHTML = `
                    <tr>
                        <td colspan="4">
                            Geen studenten gevonden.
                        </td>
                    </tr>
                `;
                return;
            }

            studentenTabel.innerHTML = '';

            studenten.forEach(student => {
                const initialen =
                    toonInitialen(
                        student.voornaam,
                        student.achternaam
                    );

                studentenTabel.innerHTML += `
                    <tr>
                        <td class="student-cell">
                            <div class="student-avatar">
                                ${initialen}
                            </div>

                            <div>
                                ${student.voornaam}
                                ${student.achternaam}
                            </div>
                        </td>

                        <td>
                            ${student.opleiding || '-'}
                        </td>

                        <td>
                            ${
                                student.startdatum && student.einddatum
                                    ? formatteerDatum(student.startdatum) +
                                      '<br>- ' +
                                      formatteerDatum(student.einddatum)
                                    : '-'
                            }
                        </td>

                        <td>
                            ${
                                student.aanvraag_id
                                    ? `
                                        <button
                                            class="view-button"
                                            onclick="window.location.href='/docent/studentdetails?id=${student.aanvraag_id}'"
                                        >
                                            Bekijken
                                        </button>
                                    `
                                    : '-'
                            }
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Fout bij ophalen studenten:', error);
        });
}

laadDocentProfiel();
laadStudenten();