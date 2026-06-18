const connection = require('../config/db_connection');

const getAlleWeeklogboeken = async (req, res) => {

    try {

        const [rows] = await connection
            .promise()
            .query(
                'SELECT * FROM weeklogboeken'
            );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Database fout'
        });

    }

};
const maakDaglogboek = async (req, res) => {

    try {

        const {
            datum,
            aantalUren,
            taken,
            geleerd,
            problemen
        } = req.body;

        const [result] = await connection
            .promise()
            .query(
                `
                INSERT INTO daglogboeken
                (
                    weeklogboek_id,
                    datum,
                    aantal_uren,
                    taken,
                    geleerd,
                    problemen
                )
                VALUES
                (
                    1,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    datum,
                    aantalUren,
                    taken,
                    geleerd,
                    problemen
                ]
            );

        res.status(201).json({
            message: 'Daglogboek opgeslagen',
            id: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Database fout'
        });

    }

};
const getWeeklogboekOpId = async (req, res) => {

    try {

        const id = req.params.id;

        const [rows] = await connection
            .promise()
            .query(
                'SELECT * FROM weeklogboeken WHERE id = ?',
                [id]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Weeklogboek niet gevonden'
            });
        }

        res.json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Database fout'
        });

    }

};
const getDaglogboekOpId = async (req, res) => {

    try {

        const id = req.params.id;

        const [rows] = await connection
            .promise()
            .query(
                'SELECT * FROM daglogboeken WHERE id = ?',
                [id]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Daglogboek niet gevonden'
            });
        }

        res.json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Database fout'
        });

    }

};

module.exports = {
    getAlleWeeklogboeken,
    maakDaglogboek,
    getWeeklogboekOpId,
    getDaglogboekOpId
};