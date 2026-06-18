const connection = require('../config/db_connection');

const getDashboardStats = async (req, res) => {
    try {

        const [aanvragen] = await connection.promise().query(`
            SELECT
                COUNT(*) AS totaal,
                SUM(status = 'INGEDIEND') AS ingediend,
                SUM(status = 'GOEDGEKEURD') AS goedgekeurd
            FROM stageaanvragen
        `);

        res.json({
            status: "success",
            stats: aanvragen[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: "error"
        });
    }
};

module.exports = {
    getDashboardStats
};