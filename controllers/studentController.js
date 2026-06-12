const connection = require('../config/db_connection');

const getStudentProfile = async(req, res)=>{
    try{
        const userId = req.user.id;
        const query = `
        SELECT
        users.voornaam,
        users.achternaam,
        users.email,
        student_profiles.studentnummer,
        student_profiles.opleiding
        FROM users
        JOIN student_profiles ON student_profiles.user_id = users.id
        WHERE users.id = ?
        AND users.role = 'STUDENT'
        `;

        const [rows] = await connection.promise().query(query, [userId]);

        if(rows.length === 0){
            return res.status(404).json({
                status: 'error',
                message: 'Studentprofiel niet gevonden'
            });
        }

        res.json({
            status: 'success',
            student: rows[0]
        });
    }catch (error){
        console.error('Error in getStudentProfile:', error);

        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het ophalen van het studentprofiel'
        });
    }
}

module.exports={getStudentProfile};