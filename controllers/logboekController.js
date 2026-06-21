
const connection = require('../config/db_connection');

function formatDatumVoorDatabase(datum) {
    const jaar = datum.getFullYear();
    const maand = String(datum.getMonth() + 1).padStart(2, '0');
    const dag = String(datum.getDate()).padStart(2, '0');

    return jaar + '-' + maand + '-' + dag;
}

function isWerkdag(datum) {
    const dag = datum.getDay();

    return dag !== 0 && dag !== 6;
}

function maakDagenVoorWeek(weeklogboekId, startDatum, eindDatum, klaar) {
    let huidigeDag = new Date(startDatum);

    function maakVolgendeDag() {
        if (huidigeDag > eindDatum) {
            klaar();
            return;
        }

        if (!isWerkdag(huidigeDag)) {
            huidigeDag.setDate(huidigeDag.getDate() + 1);
            maakVolgendeDag();
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
        daglogboekId,
        datum,
        aantalUren,
        taken,
        geleerd,
        problemen,
        competenties
    } = req.body;

    if (
        !daglogboekId ||
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

    const gekozenCompetenties = Array.isArray(competenties)
        ? competenties
        : [];

    const updateDaglogboekQuery = `
        UPDATE daglogboeken
        SET
            datum = ?,
            aantal_uren = ?,
            taken = ?,
            geleerd = ?,
            problemen = ?,
            status = 'INGEVULD',
            ingevuld_op = NOW()
        WHERE id = ?
    `;

    connection.query(
        updateDaglogboekQuery,
        [
            datum,
            aantalUren,
            taken,
            geleerd,
            problemen || '',
            daglogboekId
        ],
        (error, result) => {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    status: 'error',
                    message: 'Daglogboek kon niet worden opgeslagen'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Daglogboek niet gevonden'
                });
            }

            const deleteCompetentiesQuery = `
                DELETE FROM daglogboek_competenties
                WHERE daglogboek_id = ?
            `;

            connection.query(
                deleteCompetentiesQuery,
                [daglogboekId],
                (error) => {
                    if (error) {
                        console.error(error);

                        return res.status(500).json({
                            status: 'error',
                            message: 'Competenties konden niet worden verwijderd'
                        });
                    }

                    if (gekozenCompetenties.length === 0) {
                        return res.json({
                            status: 'success',
                            message: 'Daglogboek opgeslagen',
                            id: daglogboekId
                        });
                    }

                    const insertCompetentiesQuery = `
                        INSERT INTO daglogboek_competenties (
                            daglogboek_id,
                            competentie
                        )
                        VALUES ?
                    `;

                    const values = gekozenCompetenties.map(
                        competentie => [
                            daglogboekId,
                            competentie
                        ]
                    );

                    connection.query(
                        insertCompetentiesQuery,
                        [values],
                        (error) => {
                            if (error) {
                                console.error(error);

                                return res.status(500).json({
                                    status: 'error',
                                    message: 'Competenties konden niet worden opgeslagen'
                                });
                            }

                            res.json({
                                status: 'success',
                                message: 'Daglogboek opgeslagen',
                                id: daglogboekId
                            });
                        }
                    );
                }
            );
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

    const queryDaglogboek = `
        SELECT *
        FROM daglogboeken
        WHERE id = ?
    `;

    connection.query(queryDaglogboek, [id], (error, rows) => {
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

        const daglogboek = rows[0];

        const queryCompetenties = `
            SELECT competentie
            FROM daglogboek_competenties
            WHERE daglogboek_id = ?
        `;

        connection.query(
            queryCompetenties,
            [id],
            (error, competentieRows) => {
                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        message: 'Competenties konden niet worden opgehaald'
                    });
                }

                daglogboek.competenties = JSON.stringify(
                    competentieRows.map(row => row.competentie)
                );

                res.json(daglogboek);
            }
        );
    });
};

const getDaglogboekenVanWeek = (req, res) => {
    const weeklogboekId = req.params.id;

    const query = `
        SELECT *
        FROM daglogboeken
        WHERE weeklogboek_id = ?
        ORDER BY datum
    `;

    connection.query(query, [weeklogboekId], (error, rows) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                status: 'error',
                message: 'Daglogboeken konden niet worden opgehaald'
            });
        }

        res.json({
            status: 'success',
            dagen: rows
        });
    });
};


const dienWeeklogboekIn = (req, res) => {
    const weeklogboekId = req.params.id;

    const controleQuery = `
        SELECT *
        FROM daglogboeken
        WHERE weeklogboek_id = ?
    `;

    connection.query(
        controleQuery,
        [weeklogboekId],
        (error, dagen) => {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    status: 'error',
                    message: 'Dagen konden niet worden gecontroleerd'
                });
            }

            if (dagen.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Deze week heeft geen dagen'
                });
            }

            const alleDagenIngevuld = dagen.every(dag => {
                return dag.status === 'INGEVULD';
            });

            if (!alleDagenIngevuld) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vul eerst alle dagen in'
                });
            }

            const updateQuery = `
                UPDATE weeklogboeken
                SET
                    ingediend = TRUE,
                    ingediend_op = NOW()
                WHERE id = ?
            `;

            connection.query(
                updateQuery,
                [weeklogboekId],
                (error, result) => {
                    if (error) {
                        console.error(error);

                        return res.status(500).json({
                            status: 'error',
                            message: 'Weeklogboek kon niet worden ingediend'
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            status: 'error',
                            message: 'Weeklogboek niet gevonden'
                        });
                    }

                    res.json({
                        status: 'success',
                        message: 'Weeklogboek ingediend'
                    });
                }
            );
        }
    );
};


const keurWeeklogboekGoed = (req, res) => {
    const weeklogboekId = req.params.id;

    const query = `
        UPDATE weeklogboeken
        SET
            afgetekend = TRUE,
            afgetekend_op = NOW()
        WHERE id = ?
    `;

    connection.query(query, [weeklogboekId], (error, result) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                status: 'error',
                message: 'Weeklogboek kon niet worden goedgekeurd'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Weeklogboek niet gevonden'
            });
        }

        res.json({
            status: 'success',
            message: 'Weeklogboek goedgekeurd'
        });
    });
};

module.exports = {
    getStudentLogboeken,
    getAlleWeeklogboeken,
    maakDaglogboek,
    getWeeklogboekOpId,
    getDaglogboekOpId,
    keurWeeklogboekGoed,
    getDaglogboekenVanWeek,
    dienWeeklogboekIn
};
