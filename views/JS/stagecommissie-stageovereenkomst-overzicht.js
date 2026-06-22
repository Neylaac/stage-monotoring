console.log('Stagecommissie stageovereenkomsten geladen');

function formatteerDatum(datum) {
    const datumObject = new Date(datum);

    return datumObject.toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function toonStatusSchool(overeenkomst) {
    if (overeenkomst.school_ondertekend === 1) {
        return `
            <span class="status-badge signed">
                Volledig ondertekend
            </span>
        `;
    }

    return `
        <span class="status-badge waiting">
            Wacht op school
        </span>
    `;
}

function laadStageovereenkomsten() {
    fetch('/api/stagecommissie/stageovereenkomsten')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const overeenkomstenTabel =
                document.querySelector('#overeenkomstenTabel');

            if (data.status !== 'success') {
                console.log(data.message);
                return;
            }

            if (data.stageovereenkomsten.length === 0) {
                overeenkomstenTabel.innerHTML = `
                    <tr>
                        <td colspan="5">
                            Geen stageovereenkomsten gevonden.
                        </td>
                    </tr>
                `;
                return;
            }

            overeenkomstenTabel.innerHTML = '';

            data.stageovereenkomsten.forEach(overeenkomst => {
                const initialen =
                    overeenkomst.voornaam.charAt(0) +
                    overeenkomst.achternaam.charAt(0);

                overeenkomstenTabel.innerHTML += `
                    <tr>
                        <td class="student-cell">
                            <div class="student-avatar">
                                ${initialen}
                            </div>

                            <div>
                                ${overeenkomst.voornaam}
                                ${overeenkomst.achternaam}
                            </div>
                        </td>

                        <td>
                            ${overeenkomst.opleiding}
                        </td>

                        <td>
                            ${formatteerDatum(overeenkomst.startdatum)}
                            <br>
                            -
                            ${formatteerDatum(overeenkomst.einddatum)}
                        </td>

                        <td>
                            ${toonStatusSchool(overeenkomst)}
                        </td>

                        <td>
                            <button
                                class="view-button"
                                onclick="window.location.href='/stagecommissie-stageovereenkomst-detail?id=${overeenkomst.id}'"
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
                'Fout bij ophalen stageovereenkomsten:',
                error
            );
        });
}

laadStageovereenkomsten();

fetch('/api/user/profile')
    .then(response => response.json())
    .then(data => {
        if (data.status !== 'success') return;

        const user = data.user;
        const userCircle = document.querySelector('.user-circle');

        if (userCircle) {
            userCircle.textContent =
                (
                    user.voornaam.charAt(0) +
                    user.achternaam.charAt(0)
                ).toUpperCase();
        }
    })
    .catch(error => {
        console.error('Fout bij ophalen profiel:', error);
    });