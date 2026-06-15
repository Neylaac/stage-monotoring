const connection = require('../config/db_connection');

const getAlleStageovereenkomsten = async (req, res) => {
    try {
        const [rows] = await connection
            .promise()
            .query('SELECT * FROM stageovereenkomsten');

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Database fout'
        });
    }
};

const getStageovereenkomstOpId = async (req, res) => {
    try {
        const id = req.params.id;

        const [rows] = await connection
            .promise()
            .query(
                'SELECT * FROM stageovereenkomsten WHERE id = ?',
                [id]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Stageovereenkomst niet gevonden'
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
    getAlleStageovereenkomsten,
    getStageovereenkomstOpId
};