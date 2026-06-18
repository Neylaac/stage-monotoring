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

module.exports = {
    getAlleWeeklogboeken,
    maakDaglogboek
};