function getWeeklogboekId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get('id');
}

function laadDaglogboeken() {

    const weeklogboekId =
        getWeeklogboekId();

    if (!weeklogboekId) {
        return;
    }

    fetch(
        '/api/weeklogboeken/' +
        weeklogboekId +
        '/daglogboeken'
    )
        .then(response => response.json())
        .then(daglogboeken => {

            const tabel =
    document.getElementById(
        'daglogboekenTabel'
    );

tabel.innerHTML = '';

daglogboeken.forEach(dag => {

    tabel.innerHTML += `
        <tr>

            <td>
                ${dag.datum}
            </td>

            <td>
                <span class="logboek-status ingediend">
                    Ingevuld
                </span>
            </td>

            <td>

                <a
                    href="bedrijfdaglogboek.html?id=${dag.id}"
                    class="logboek-btn">

                    Bekijken

                </a>

            </td>

        </tr>
    `;

});

        })
        .catch(error => {

            console.error(
                error
            );

        });

}

laadDaglogboeken();
const goedkeurBtn =
    document.getElementById(
        'goedkeurBtn'
    );

if (goedkeurBtn) {

    goedkeurBtn.addEventListener(
        'click',
        () => {

            const weeklogboekId =
                getWeeklogboekId();

            const feedback =
                document
                    .getElementById(
                        'feedback'
                    )
                    .value;

            fetch(
                '/api/weeklogboeken/' +
                weeklogboekId +
                '/goedkeuren',
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        feedback
                    })
                }
            )
                .then(response =>
                    response.json()
                )
                .then(data => {

                    alert(
                        'Weeklogboek goedgekeurd'
                    );

                })
                .catch(error => {

                    console.error(
                        error
                    );

                    alert(
                        'Goedkeuren mislukt'
                    );

                });

        }
    );

}