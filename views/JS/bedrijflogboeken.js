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