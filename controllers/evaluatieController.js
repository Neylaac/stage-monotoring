const connection = require('../config/db_connection');

// Fetch completion status of all 4 evaluations for a student
const getStudentEvaluatiesStatus = async (req, res) => {
    try {
        const studentId = req.user?.id || req.session?.userId;
        if (!studentId) {
            return res.status(401).json({ status: 'error', message: 'Niet ingelogd' });
        }

        const query = 'SELECT id, type FROM evaluaties WHERE student_id = ?';
        const [rows] = await connection.promise().query(query, [studentId]);

        // Map database rows to statuses
        const statusMap = {
            ZELF_TUSSENTIJDS: { status: 'Niet ingevuld', id: null },
            TUSSENTIJDS: { status: 'In afwachting', id: null },
            ZELF_EIND: { status: 'Niet ingevuld', id: null },
            EIND: { status: 'In afwachting', id: null }
        };

        rows.forEach(row => {
            if (statusMap[row.type]) {
                statusMap[row.type].status = 'Ingevuld';
                statusMap[row.type].id = row.id;
            }
        });

        res.json({
            status: 'success',
            evaluaties: statusMap
        });
    } catch (error) {
        console.error('Fout bij ophalen evaluatiestatus:', error);
        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het ophalen van de evaluatiestatussen'
        });
    }
};

// Fetch details for a specific evaluation type
const getEvaluatieDetails = async (req, res) => {
    try {
        const studentId = req.user?.id || req.session?.userId;
        const { type } = req.params;

        if (!studentId) {
            return res.status(401).json({ status: 'error', message: 'Niet ingelogd' });
        }

        const allowedTypes = ['ZELF_TUSSENTIJDS', 'ZELF_EIND', 'TUSSENTIJDS', 'EIND'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ status: 'error', message: 'Ongeldig evaluatietype' });
        }

        const query = 'SELECT * FROM evaluaties WHERE student_id = ? AND type = ?';
        const [rows] = await connection.promise().query(query, [studentId, type]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Evaluatie niet gevonden'
            });
        }

        res.json({
            status: 'success',
            evaluatie: rows[0]
        });
    } catch (error) {
        console.error('Fout bij ophalen evaluatiedetails:', error);
        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het ophalen van de evaluatiedetails'
        });
    }
};

// Submit or update a student self-reflection
const submitZelfreflectie = async (req, res) => {
    try {
        const studentId = req.user?.id || req.session?.userId;
        if (!studentId) {
            return res.status(401).json({ status: 'error', message: 'Niet ingelogd' });
        }

        const {
            type,
            planning_score,
            planning_feedback,
            technisch_score,
            technisch_feedback,
            onderzoek_score,
            onderzoek_feedback,
            communicatie_score,
            communicatie_feedback,
            groei_score,
            groei_feedback
        } = req.body;

        const allowedTypes = ['ZELF_TUSSENTIJDS', 'ZELF_EIND'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ status: 'error', message: 'Ongeldig zelfreflectietype' });
        }

        if (type === 'ZELF_EIND') {
            const checkQuery = 'SELECT id FROM evaluaties WHERE student_id = ? AND type = ?';
            const [checkRows] = await connection.promise().query(checkQuery, [studentId, 'ZELF_TUSSENTIJDS']);
            if (checkRows.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Je moet eerst de tussentijdse zelfreflectie invullen.'
                });
            }
        }

        const query = `
            INSERT INTO evaluaties (
                student_id,
                type,
                planning_score,
                planning_feedback,
                technisch_score,
                technisch_feedback,
                onderzoek_score,
                onderzoek_feedback,
                communicatie_score,
                communicatie_feedback,
                groei_score,
                groei_feedback
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                planning_score = VALUES(planning_score),
                planning_feedback = VALUES(planning_feedback),
                technisch_score = VALUES(technisch_score),
                technisch_feedback = VALUES(technisch_feedback),
                onderzoek_score = VALUES(onderzoek_score),
                onderzoek_feedback = VALUES(onderzoek_feedback),
                communicatie_score = VALUES(communicatie_score),
                communicatie_feedback = VALUES(communicatie_feedback),
                groei_score = VALUES(groei_score),
                groei_feedback = VALUES(groei_feedback)
        `;

        const params = [
            studentId,
            type,
            planning_score,
            planning_feedback,
            technisch_score,
            technisch_feedback,
            onderzoek_score,
            onderzoek_feedback,
            communicatie_score,
            communicatie_feedback,
            groei_score,
            groei_feedback
        ];

        await connection.promise().query(query, params);

        res.json({
            status: 'success',
            message: 'Zelfreflectie succesvol ingediend'
        });
    } catch (error) {
        console.error('Fout bij indienen zelfreflectie:', error);
        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het opslaan van de zelfreflectie'
        });
    }
};

// Fetch all interns for the logged-in company with their evaluation completion status
const getBedrijfStagiairsEvaluaties = async (req, res) => {
    try {
        const companyEmail = req.user?.email;
        if (!companyEmail) {
            return res.status(401).json({ status: 'error', message: 'Niet ingelogd' });
        }

        const query = `
            SELECT 
                u.id AS student_id,
                u.voornaam,
                u.achternaam,
                sp.opleiding,
                sa.id AS stageaanvraag_id,
                
                (SELECT id FROM evaluaties WHERE student_id = u.id AND type = 'TUSSENTIJDS') AS tussentijds_id,
                (SELECT planning_score FROM evaluaties WHERE student_id = u.id AND type = 'TUSSENTIJDS') AS tussentijds_score,
                
                (SELECT id FROM evaluaties WHERE student_id = u.id AND type = 'EIND') AS eind_id,
                (SELECT planning_score FROM evaluaties WHERE student_id = u.id AND type = 'EIND') AS eind_score

            FROM stageaanvragen sa
            JOIN users u ON u.id = sa.student_id
            JOIN student_profiles sp ON sp.user_id = u.id
            JOIN stageovereenkomsten so ON so.stageaanvraag_id = sa.id

            WHERE sa.email_bedrijf = ?
            AND sa.status = 'GOEDGEKEURD'
            AND so.student_ondertekend = 1
            AND so.bedrijf_ondertekend = 1
            AND so.school_ondertekend = 1
            ORDER BY u.voornaam
        `;

        const [rows] = await connection.promise().query(query, [companyEmail]);

        // Process rows to return cleaner statuses
        const trainees = rows.map(row => ({
            student_id: row.student_id,
            voornaam: row.voornaam,
            achternaam: row.achternaam,
            opleiding: row.opleiding,
            tussentijds: {
                status: row.tussentijds_score ? 'Ingevuld' : 'Niet ingevuld',
                id: row.tussentijds_id
            },
            eind: {
                status: row.eind_score ? 'Ingevuld' : 'Niet ingevuld',
                id: row.eind_id
            }
        }));

        res.json({
            status: 'success',
            trainees
        });
    } catch (error) {
        console.error('Fout bij ophalen stagiair-evaluaties voor bedrijf:', error);
        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het ophalen van de evaluaties'
        });
    }
};

// Fetch evaluation comparison details (student self-reflection + company mentor scores)
const getBedrijfEvaluatieDetails = async (req, res) => {
    try {
        const companyEmail = req.user?.email;
        if (!companyEmail) {
            return res.status(401).json({ status: 'error', message: 'Niet ingelogd' });
        }

        const { studentId, type } = req.params;
        const allowedTypes = ['TUSSENTIJDS', 'EIND'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ status: 'error', message: 'Ongeldig evaluatietype' });
        }

        // Map to corresponding self-reflection type
        const selfType = type === 'TUSSENTIJDS' ? 'ZELF_TUSSENTIJDS' : 'ZELF_EIND';

        // 1. Fetch student's self-reflection
        const selfQuery = 'SELECT * FROM evaluaties WHERE student_id = ? AND type = ?';
        const [selfRows] = await connection.promise().query(selfQuery, [studentId, selfType]);

        // 2. Fetch company's review
        const companyQuery = 'SELECT * FROM evaluaties WHERE student_id = ? AND type = ?';
        const [compRows] = await connection.promise().query(companyQuery, [studentId, type]);

        res.json({
            status: 'success',
            zelfreflectie: selfRows[0] || null,
            evaluatie: compRows[0] || null
        });
    } catch (error) {
        console.error('Fout bij ophalen vergelijkende evaluatiegegevens:', error);
        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het ophalen van de evaluatiegegevens'
        });
    }
};

// Submit or update company mentor scores and feedback
const submitBedrijfEvaluatie = async (req, res) => {
    try {
        const companyEmail = req.user?.email;
        if (!companyEmail) {
            return res.status(401).json({ status: 'error', message: 'Niet ingelogd' });
        }

        const {
            studentId,
            type,
            planning_score,
            planning_feedback,
            technisch_score,
            technisch_feedback,
            onderzoek_score,
            onderzoek_feedback,
            communicatie_score,
            communicatie_feedback,
            groei_score,
            groei_feedback
        } = req.body;

        const allowedTypes = ['TUSSENTIJDS', 'EIND'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ status: 'error', message: 'Ongeldig evaluatietype' });
        }

        // Save or update
        const query = `
            INSERT INTO evaluaties (
                student_id,
                type,
                planning_score,
                planning_feedback,
                technisch_score,
                technisch_feedback,
                onderzoek_score,
                onderzoek_feedback,
                communicatie_score,
                communicatie_feedback,
                groei_score,
                groei_feedback
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                planning_score = VALUES(planning_score),
                planning_feedback = VALUES(planning_feedback),
                technisch_score = VALUES(technisch_score),
                technisch_feedback = VALUES(technisch_feedback),
                onderzoek_score = VALUES(onderzoek_score),
                onderzoek_feedback = VALUES(onderzoek_feedback),
                communicatie_score = VALUES(communicatie_score),
                communicatie_feedback = VALUES(communicatie_feedback),
                groei_score = VALUES(groei_score),
                groei_feedback = VALUES(groei_feedback)
        `;

        const params = [
            studentId,
            type,
            planning_score,
            planning_feedback,
            technisch_score,
            technisch_feedback,
            onderzoek_score,
            onderzoek_feedback,
            communicatie_score,
            communicatie_feedback,
            groei_score,
            groei_feedback
        ];

        await connection.promise().query(query, params);

        res.json({
            status: 'success',
            message: 'Evaluatie succesvol ingediend'
        });
    } catch (error) {
        console.error('Fout bij indienen bedrijf-evaluatie:', error);
        res.status(500).json({
            status: 'error',
            message: 'Er ging iets mis bij het opslaan van de evaluatie'
        });
    }
};

module.exports = {
    getStudentEvaluatiesStatus,
    getEvaluatieDetails,
    submitZelfreflectie,
    getBedrijfStagiairsEvaluaties,
    getBedrijfEvaluatieDetails,
    submitBedrijfEvaluatie
};
