
const connection = require('../config/db_connection');

function formatDatumVoorDatabase(datum) {
    const jaar = datum.getFullYear();
    const maand = String(datum.getMonth() + 1).padStart(2, '0');
    const dag = String(datum.getDate()).padStart(2, '0');

    return jaar + '-' + maand + '-' + dag;
}

function maakDagenVoorWeek(weeklogboekId, startDatum, eindDatum, klaar) {
    let huidigeDag = new Date(startDatum);

    function maakVolgendeDag() {
        if (huidigeDag > eindDatum) {
            klaar();
            return;
        }

        const dagNaam = huidigeDag.toLocaleDateString('nl-BE', {
            weekday: 'long'
        });

        const query = `
            INSERT INTO daglogboeken (
                weeklogboek_id,
                datum,
                dag_naam
            )
            VALUES (?, ?, ?)
        `;

        connection.query(
            query,
            [
                weeklogboekId,
                formatDatumVoorDatabase(huidigeDag),
                dagNaam
            ],
            (error) => {
                if (error) {
                    klaar(error);
                    return;
                }

                huidigeDag.setDate(huidigeDag.getDate() + 1);
                maakVolgendeDag();
            }
        );
    }

    maakVolgendeDag();
}

function maakWekenEnDagen(stage, klaar) {
    const startDatum = new Date(stage.startdatum);
    const eindDatum = new Date(stage.einddatum);

    console.log('STARTDATUM:', startDatum);
    console.log('EINDDATUM:', eindDatum);

    let huidigeDatum = new Date(startDatum);
    let weeknummer = 1;

    function maakVolgendeWeek() {
        if (huidigeDatum > eindDatum) {
            klaar();
            return;
        }

        const weekStart = new Date(huidigeDatum);
        const weekEinde = new Date(huidigeDatum);

        weekEinde.setDate(weekEinde.getDate() + 6);

        if (weekEinde > eindDatum) {
            weekEinde.setTime(eindDatum.getTime());
        }

        const query = `
            INSERT INTO weeklogboeken (
                stageovereenkomst_id,
                weeknummer,
                startdatum,
                einddatum
            )
            VALUES (?, ?, ?, ?)
        `;

        connection.query(
            query,
            [
                stage.stageovereenkomst_id,
                weeknummer,
                formatDatumVoorDatabase(weekStart),
                formatDatumVoorDatabase(weekEinde)
            ],
            (error, result) => {
                if (error) {
                    klaar(error);
                    return;
                }

                const weeklogboekId = result.insertId;

                maakDagenVoorWeek(
                    weeklogboekId,
                    weekStart,
                    weekEinde,
                    (error) => {
                        if (error) {
                            klaar(error);
                            return;
                        }

                        huidigeDatum.setDate(huidigeDatum.getDate() + 7);
                        weeknummer = weeknummer + 1;

                        maakVolgendeWeek();
                    }
                );
            }
        );
    }

    maakVolgendeWeek();
}


const getStudentLogboeken = (req, res) => {
    const studentId = req.user.id;

    const queryStage = `
        SELECT
            stageovereenkomsten.id AS stageovereenkomst_id,
            stageaanvragen.startdatum,
            stageaanvragen.einddatum,

            stageovereenkomsten.student_ondertekend,
            stageovereenkomsten.bedrijf_ondertekend,
            stageovereenkomsten.school_ondertekend

        FROM stageaanvragen

        JOIN stageovereenkomsten
            ON stageovereenkomsten.stageaanvraag_id =
               stageaanvragen.id

        WHERE stageaanvragen.student_id = ?
        AND stageaanvragen.status = 'GOEDGEKEURD'

        ORDER BY stageaanvragen.created_at DESC
        LIMIT 1
    `;

    connection.query(queryStage, [studentId], (error, results) => {
        if (error) {
            console.error('Fout bij ophalen stage:', error);

            return res.status(500).json({
                status: 'error',
                message: 'Stage kon niet worden opgehaald'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Geen goedgekeurde stage gevonden'
            });
        }

        const stage = results[0];

        console.log('STAGE GEVONDEN:', stage);

        if (
            stage.student_ondertekend !== 1 ||
            stage.bedrijf_ondertekend !== 1 ||
            stage.school_ondertekend !== 1
        ) {
            return res.status(403).json({
                status: 'error',
                message: 'Je hebt nog geen toegang tot logboeken'
            });
        }

        const queryWeken = `
            SELECT *
            FROM weeklogboeken
            WHERE stageovereenkomst_id = ?
            ORDER BY weeknummer
        `;

        connection.query(
            queryWeken,
            [stage.stageovereenkomst_id],
            (error, weken) => {
                if (error) {
                    console.error('Fout bij ophalen weken:', error);

                    return res.status(500).json({
                        status: 'error',
                        message: 'Logboeken konden niet worden opgehaald'
                    });
                }

                if (weken.length > 0) {
                    return res.json({
                        status: 'success',
                        weken: weken
                    });
                }


                console.log('GEEN WEKEN GEVONDEN, WEKEN WORDEN AANGEMAAKT');


                maakWekenEnDagen(stage, (error) => {
                    if (error) {
                        console.error(
                            'Fout bij aanmaken weken en dagen:',
                            error
                        );

                        return res.status(500).json({
                            status: 'error',
                            message: 'Logboeken konden niet worden aangemaakt'
                        });
                    }

                    connection.query(
                        queryWeken,
                        [stage.stageovereenkomst_id],
                        (error, nieuweWeken) => {
                            if (error) {
                                console.error(
                                    'Fout bij ophalen nieuwe weken:',
                                    error
                                );

                                return res.status(500).json({
                                    status: 'error',
                                    message: 'Logboeken konden niet worden opgehaald'
                                });
                            }

                            res.json({
                                status: 'success',
                                weken: nieuweWeken
                            });
                        }
                    );
                });
            }
        );
    });
};



const getAlleWeeklogboeken = (req, res) => {
    const query = `
        SELECT *
        FROM weeklogboeken
    `;

    connection.query(query, (error, rows) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                message: 'Database fout'
            });
        }

        res.json(rows);
    });
};

const maakDaglogboek = (req, res) => {
    const {
        weeklogboekId,
        datum,
        aantalUren,
        taken,
        geleerd,
        problemen
    } = req.body;

    if (
        !weeklogboekId ||
        !datum ||
        !aantalUren ||
        !taken ||
        !geleerd
    ) {
        return res.status(400).json({
            status: 'error',
            message: 'Vul alle verplichte velden in'
        });
    }

    const dagNaam = new Date(datum).toLocaleDateString('nl-BE', {
        weekday: 'long'
    });

    const query = `
        INSERT INTO daglogboeken (
            weeklogboek_id,
            datum,
            dag_naam,
            aantal_uren,
            taken,
            geleerd,
            problemen,
            status,
            ingevuld_op
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'INGEVULD', NOW())

        ON DUPLICATE KEY UPDATE
            aantal_uren = ?,
            taken = ?,
            geleerd = ?,
            problemen = ?,
            status = 'INGEVULD',
            ingevuld_op = NOW()
    `;

    connection.query(
        query,
        [
            weeklogboekId,
            datum,
            dagNaam,
            aantalUren,
            taken,
            geleerd,
            problemen,

            aantalUren,
            taken,
            geleerd,
            problemen
        ],
        (error, result) => {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    status: 'error',
                    message: 'Daglogboek kon niet worden opgeslagen'
                });
            }

            res.json({
                status: 'success',
                message: 'Daglogboek opgeslagen',
                id: result.insertId
            });
        }
    );
};

const getWeeklogboekOpId = (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT *
        FROM weeklogboeken
        WHERE id = ?
    `;

    connection.query(query, [id], (error, rows) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                message: 'Database fout'
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Weeklogboek niet gevonden'
            });
        }

        res.json(rows[0]);
    });
};

const getDaglogboekOpId = (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT *
        FROM daglogboeken
        WHERE id = ?
    `;

    connection.query(query, [id], (error, rows) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                message: 'Database fout'
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Daglogboek niet gevonden'
            });
        }

        res.json(rows[0]);
    });
};

module.exports = {
    getStudentLogboeken,
    getAlleWeeklogboeken,
    maakDaglogboek,
    getWeeklogboekOpId,
    getDaglogboekOpId
};
