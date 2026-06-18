const connection = require('../config/db_connection');

const getStudentProfile = async(req, res)=>{
    try{
        const userId = req.user?.id || req.session?.userId;


        if (!userId) {
    return res.status(401).json({
        status: "error",
        message: "Geen student ingelogd"
    });
}
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



const getStudentHome = async (req, res) => {
    try {
        const userId = req.user?.id || req.session?.userId;
    

        const query = `
            SELECT
                s.bedrijfsnaam,
                s.contact_voornaam,
                s.contact_naam,
                s.startdatum,
                s.einddatum,
                s.status,
                so.student_ondertekend,
                so.bedrijf_ondertekend
           
            FROM stageaanvragen s
            LEFT JOIN stageovereenkomsten so
                ON so.stageaanvraag_id = s.id
            WHERE s.student_id = ?
            ORDER BY s.created_at DESC
            LIMIT 1
        `;

        const [rows] = await connection.promise().query(query, [userId]);

        res.json({
            status: "success",
            stage: rows[0] || null
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message:error.sqlMessage || error.message
        });
    }
};

module.exports={
    getStudentProfile,
    getStudentHome
};

