const connection = require('../config/db_connection'); // je gebruikt de verbindig, dus we halen de databaseverbinfing

const maakStageaanvraag = async (req, res) => { // we maken een nieuwe functie, wordt gebruikt wanneer we de stageaanvraag gaan indienen.
    try {
        const studentId = req.user.id; //Welke student is ingelogd

        const { // destructuring
            startdatum,
            einddatum,
            functie,
            bedrijfsnaam,
            telefoonnummer,
            emailBedrijf,
            gemeente,
            postcode,
            straat,
            straatnummer,
            contactVoornaam,
            contactNaam,
            opdracht,
            omschrijving
        } = req.body;


        if (// controleren of alles is ingevuld
            !startdatum ||
            !einddatum ||
            !functie ||
            !bedrijfsnaam ||
            !telefoonnummer ||
            !emailBedrijf ||
            !gemeente ||
            !postcode ||
            !straat ||
            !straatnummer ||
            !contactVoornaam ||
            !contactNaam ||
            !opdracht ||
            !omschrijving
        ) {// als 1 veld niet ingevuld is dan krijg je deze error bericht
            return res.status(400).json({
                status: 'error',
                message: 'Vul alle verplichte velden in'
            }); //400 = De gegevens die de gebruiker stuurde zijn niet correct of onvolledig.
        }

        const query = ` 
    INSERT INTO stageaanvragen (
        student_id,
        docent_id,
        bedrijf_id,
        startdatum,
        einddatum,
        functie,
        bedrijfsnaam,
        email_bedrijf,
        telefoonnummer,
        gemeente,
        postcode,
        straat,
        straatnummer,
        contact_voornaam,
        contact_naam,
        opdracht,
        omschrijving,
        status
            )
        VALUES (
            ?,
            NULL,
            NULL,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,  
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'INGEDIEND'
            )
        `;

        /* INSERT INTO voegt een nieuwe rij toe.
        De vraagtekens worden ingevuld met de waarden hieronder.
        docent_id en bedrijf_id zijn voorlopig NULL.
        De backend bepaalt zelf de beginstatus INGEDIEND.
        */

        const waarden = [
            studentId,
            startdatum,
            einddatum,
            functie,
            bedrijfsnaam,
            emailBedrijf,
            telefoonnummer,
            gemeente,
            postcode,
            straat,
            straatnummer,
            contactVoornaam,
            contactNaam,
            opdracht,
            omschrijving
        ];

        const [result] = await connection.promise().query(query, waarden);
        /* connection = databaseverbinding
        promise() = maakt await mogelijk
        query() = voert de SQL-query uit
        result bevat informatie over de nieuwe rij */

        return res.status(201).json({ //antwoord wanneer het succesvol aangemaakt is
            status: 'success',
            message: 'stageaanvraag succesvol ingediend',
            aanvraagId: result.insertId
        });
    } catch (error) { // technische fout
        console.error('Fout bij maken stageaanvraag', error);

        return res.status(500).json({ // dat sturen we naar de brouwser. 
            status: 'error',
            message: 'Stageaanvraag kan niet worden opgeslagen.'
        });
    }
};


const getMijnStageaanvragen = async (req, res) => {
    try {
        const studentId = req.user.id //neem ingelogde student

        const query = `
            SELECT
                stageaanvragen.id,
                stageaanvragen.startdatum,
                stageaanvragen.einddatum,
                stageaanvragen.functie,
                stageaanvragen.bedrijfsnaam,
                stageaanvragen.telefoonnummer,
                stageaanvragen.email_bedrijf,
                stageaanvragen.gemeente,
                stageaanvragen.postcode,
                stageaanvragen.straat,
                stageaanvragen.straatnummer,
                stageaanvragen.contact_voornaam,
                stageaanvragen.contact_naam,
                stageaanvragen.opdracht,
                stageaanvragen.omschrijving,
                stageaanvragen.status,
                stageaanvragen.feedback,
                stageaanvragen.created_at,

                users.voornaam,
                users.achternaam,
                users.email AS student_email,

                student_profiles.studentnummer,
                student_profiles.opleiding

            FROM stageaanvragen

            JOIN users
                ON stageaanvragen.student_id = users.id

            JOIN student_profiles
                ON student_profiles.user_id = users.id

            WHERE stageaanvragen.student_id = ? 

            ORDER BY stageaanvragen.created_at DESC
        `;

        const [rows] = await connection.promise().query(query, [studentId]);

        return res.status(200).json({
            status: "success",
            aanvragen: rows
        });
    } catch (error) {
        console.error('Fout bij ophalen stageaanvragen van studeent', error);

        return res.status(500).json({
            status: 'error',
            message: 'Stageaanvragen konden niet worden opgehaald'
        });
    }
}



const getAlleStageaanvragen = async (req, res) => {
    try {
        const query = `
            SELECT
                stageaanvragen.id,
                stageaanvragen.startdatum,
                stageaanvragen.einddatum,
                stageaanvragen.functie,
                stageaanvragen.bedrijfsnaam,
                stageaanvragen.telefoonnummer,
                stageaanvragen.email_bedrijf,
                stageaanvragen.gemeente,
                stageaanvragen.postcode,
                stageaanvragen.straat,
                stageaanvragen.straatnummer,
                stageaanvragen.contact_voornaam,
                stageaanvragen.contact_naam,
                stageaanvragen.opdracht,
                stageaanvragen.omschrijving,
                stageaanvragen.status,
                stageaanvragen.feedback,
                stageaanvragen.created_at,

                users.voornaam,
                users.achternaam,
                users.email AS student_email,

                student_profiles.studentnummer,
                student_profiles.opleiding,

                so.student_ondertekend,
                so.bedrijf_ondertekend,
                so.school_ondertekend

            FROM stageaanvragen

            JOIN users
                ON stageaanvragen.student_id = users.id

            JOIN student_profiles
                ON student_profiles.user_id = users.id

            LEFT JOIN stageovereenkomsten so
                ON so.stageaanvraag_id = stageaanvragen.id

            ORDER BY stageaanvragen.created_at DESC
        `;

        const [rows] = await connection.promise().query(query);

        return res.status(200).json({
            status: 'success',
            aanvragen: rows
        });

    } catch (error) {
        console.error('Fout bij ophalen van alle stageaanvragen:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Stageaanvragen konden niet worden opgehaald'
        });
    }
};

const getStageaanvraagOpId = async (req, res) => {
    try {
        const aanvraagId = req.params.id;

        const query = `
            SELECT
                stageaanvragen.id,
                stageaanvragen.startdatum,
                stageaanvragen.einddatum,
                stageaanvragen.functie,
                stageaanvragen.bedrijfsnaam,
                stageaanvragen.telefoonnummer,
                stageaanvragen.email_bedrijf,
                stageaanvragen.gemeente,
                stageaanvragen.postcode,
                stageaanvragen.straat,
                stageaanvragen.straatnummer,
                stageaanvragen.contact_voornaam,
                stageaanvragen.contact_naam,
                stageaanvragen.opdracht,
                stageaanvragen.omschrijving,
                stageaanvragen.status,
                stageaanvragen.feedback,
                stageaanvragen.created_at,

                users.voornaam,
                users.achternaam,
                users.email AS student_email,

                student_profiles.studentnummer,
                student_profiles.opleiding

            FROM stageaanvragen

            JOIN users
                ON stageaanvragen.student_id = users.id

            JOIN student_profiles
                ON student_profiles.user_id = users.id

            WHERE stageaanvragen.id = ?
        `;

        const [rows] = await connection.promise().query(query, [aanvraagId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Stageaanvraag niet gevonden'
            });
        }

        return res.status(200).json({
            status: 'success',
            aanvraag: rows[0]
        });
    } catch (error) {
        console.error('Fout bij het ophalen van stageaanvraag:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Stageaanvraag kan niet worden opgehaald'
        })

    }
}

const updateStageaanvraag = async (req, res) => {
    try {
        const aanvraagId = req.params.id;
        const studentId = req.user.id;

        const {
            startdatum,
            einddatum,
            functie,
            bedrijfsnaam,
            telefoonnummer,
            emailBedrijf,
            gemeente,
            postcode,
            straat,
            straatnummer,
            contactVoornaam,
            contactNaam,
            opdracht,
            omschrijving
        } = req.body;

        if (
            !startdatum ||
            !einddatum ||
            !functie ||
            !bedrijfsnaam ||
            !telefoonnummer ||
            !emailBedrijf ||
            !gemeente ||
            !postcode ||
            !straat ||
            !straatnummer ||
            !contactVoornaam ||
            !contactNaam ||
            !opdracht ||
            !omschrijving
        ) {
            return res.status(400).json({
                status: "error",
                message: "Vul alle verplichte velden in"
            });
        }

        const query = `
            UPDATE stageaanvragen
            SET
                startdatum = ?,
                einddatum = ?,
                functie = ?,
                bedrijfsnaam = ?,
                email_bedrijf = ?,
                telefoonnummer = ?,
                gemeente = ?,
                postcode = ?,
                straat = ?,
                straatnummer = ?,
                contact_voornaam = ?,
                contact_naam = ?,
                opdracht = ?,
                omschrijving = ?,
                status = 'INGEDIEND',
                feedback = NULL
            WHERE id = ?
            AND student_id = ?
        `;

        const waarden = [
            startdatum,
            einddatum,
            functie,
            bedrijfsnaam,
            emailBedrijf,
            telefoonnummer,
            gemeente,
            postcode,
            straat,
            straatnummer,
            contactVoornaam,
            contactNaam,
            opdracht,
            omschrijving,
            aanvraagId,
            studentId
        ];

        const [result] = await connection
            .promise()
            .query(query, waarden);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Stageaanvraag niet gevonden"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Stageaanvraag succesvol aangepast"
        });

    } catch (error) {
        console.error("Fout bij aanpassen stageaanvraag:", error);

        return res.status(500).json({
            status: "error",
            message: "Stageaanvraag kon niet worden aangepast"
        });
    }
};


const updateStageaanvraagStatus = async (req, res) => {
    try {
        const aanvraagId = req.params.id;

        const { status, feedback } = req.body;

        const geldigeStatussen = ["GOEDGEKEURD", "AFGEKEURD", "AANPASSING_GEVRAAGD"];

        if (!geldigeStatussen.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: "Ongeldige status"
            });
        }

        if (status !== "GOEDGEKEURD" && !feedback) {
            return res.status(400).json({
                status: "error",
                message: "Feedback is verplicht"
            });
        }

        const feedbackTekst = feedback || "Je stageaanvraag is goedgekeurd.";

        const query = `
            UPDATE stageaanvragen
            SET
                status = ?,
                feedback = ?
            WHERE id = ?
        `;

        const [result] = await connection.promise().query(query, [status, feedbackTekst, aanvraagId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Stageaanvraag is niet gevonden'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Status en feedback succesvol bijgewerkt'
        })

    } catch (error) {
        console.error("Fout bij bijwerken van stageaanvraag", error);

        return res.status(500).json({
            status: 'error',
            message: 'Stageaanvraag kon niet worden bijgewerkt'
        })
    }


}



module.exports = { maakStageaanvraag, getMijnStageaanvragen, getAlleStageaanvragen, getStageaanvraagOpId,updateStageaanvraag, updateStageaanvraagStatus }; // andere besantden mogen deze functie ook importeren.