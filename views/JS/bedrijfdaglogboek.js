function getDaglogboekId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get('id');
}

function formatDatumVoorInput(datum) {

    const datumObject =
        new Date(datum);

    const jaar =
        datumObject.getFullYear();

    const maand =
        String(
            datumObject.getMonth() + 1
        ).padStart(2, '0');

    const dag =
        String(
            datumObject.getDate()
        ).padStart(2, '0');

    return jaar +
        '-' +
        maand +
        '-' +
        dag;
}

function laadDaglogboek() {

    const daglogboekId =
        getDaglogboekId();

    if (!daglogboekId) {
        return;
    }

    fetch(
        '/api/daglogboeken/' +
        daglogboekId
    )
        .then(response =>
            response.json()
        )
        .then(dag => {

            document
                .getElementById('datum')
                .value =
                    formatDatumVoorInput(
                        dag.datum
                    );

            document
                .getElementById('aantalUren')
                .value =
                    dag.aantal_uren;

            document
                .getElementById('taken')
                .value =
                    dag.taken;

            document
                .getElementById('geleerd')
                .value =
                    dag.geleerd;

            document
                .getElementById('problemen')
                .value =
                    dag.problemen || '';

        })
        .catch(error => {

            console.error(
                'Fout bij ophalen daglogboek:',
                error
            );

        });

}

laadDaglogboek();