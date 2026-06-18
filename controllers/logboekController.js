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

module.exports = {
    getAlleWeeklogboeken
};