const connection = require('../config/db_connection'); // je gebruikt de verbindig, dus we halen de databaseverbinfing

const maakStageaanvraag = async(req,res) => { // we maken een nieuwe functie, wordt gebruikt wanneer we de stageaanvraag gaan indienen.
    try{
        const studentId = req.user.id; //Welke student is ingelogd
        
        const { // destructuring
            startdatum, 
            einddatum,
            functie, 
            bedrijfsnaam, 
            telefoonnummer,
            contactpersoon, 
            adres,
            emailBedrijf,
            docentNaam,
            docentEmail,
            opdracht, 
            omschrijving
        } = req.body;


        if(// controleren of alles is ingevuld
            !startdatum || 
            !einddatum ||
            !functie ||
            !bedrijfsnaam ||
            !telefoonnummer ||
            !contactpersoon ||
            !adres ||
            !emailBedrijf ||
            !docentNaam ||
            !docentEmail ||
            !opdracht ||
            !omschrijving
        ){// als 1 veld niet ingevuld is dan krijg je deze error bericht
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
                docent_naam,
                docent_email,
                startdatum,
                einddatum,
                functie,
                bedrijfsnaam,
                contactpersoon,
                email_bedrijf,
                telefoonnummer,
                adres,
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
            docentNaam,
            docentEmail,
            startdatum,
            einddatum,
            functie,
            bedrijfsnaam,
            contactpersoon,
            emailBedrijf,
            telefoonnummer,
            adres,
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
    }catch(error){ // technische fout
        console.error('Fout bij maken stageaanvraag', error);

        return res.status(500).json({ // dat sturen we naar de brouwser. 
            status: 'error',
            message: 'Stageaanvraag kan niet worden opgeslagen.'
        });
    }
};


const getMijnStageaanvragen = async(req, res) =>{
    try{
        const studentId = req.user.id //neem ingelogde student

        const query = `
            SELECT
                stageaanvragen.id,
                stageaanvragen.startdatum,
                stageaanvragen.einddatum,
                stageaanvragen.functie,
                stageaanvragen.bedrijfsnaam,
                stageaanvragen.telefoonnummer,
                stageaanvragen.contactpersoon,
                stageaanvragen.adres,
                stageaanvragen.email_bedrijf,
                stageaanvragen.docent_naam,
                stageaanvragen.docent_email,
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
        
        const [rows] = await connection.promise().query(query,[studentId]);

        return res.status(200).json({
            status: "success",
            aanvragen: rows
        });
    }catch (error){
        console.error('Fout bij ophalen stageaanvragen va studeent', error);

        return res.status(500).json({
            status: 'error', 
            message: 'Stageaanvragen konden niet worden opgehaald'
        });
    }
}



const getAlleStageaanvragen = async(req, res) =>{
    try{
        const query =  `
            SELECT
                stageaanvragen.id,
                stageaanvragen.startdatum,
                stageaanvragen.einddatum,
                stageaanvragen.functie,
                stageaanvragen.bedrijfsnaam,
                stageaanvragen.telefoonnummer,
                stageaanvragen.contactpersoon,
                stageaanvragen.adres,
                stageaanvragen.email_bedrijf,
                stageaanvragen.docent_naam,
                stageaanvragen.docent_email,
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

const getStageaanvraagOpId = async(req, res) =>{
    try{
        const aanvraagId = req.params.id;

        const query =  `
            SELECT
                stageaanvragen.id,
                stageaanvragen.startdatum,
                stageaanvragen.einddatum,
                stageaanvragen.functie,
                stageaanvragen.bedrijfsnaam,
                stageaanvragen.telefoonnummer,
                stageaanvragen.contactpersoon,
                stageaanvragen.adres,
                stageaanvragen.email_bedrijf,
                stageaanvragen.docent_naam,
                stageaanvragen.docent_email,
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

        if(rows.length === 0){
            return res.status(404).json({
                status: 'error', 
                message: 'Stageaanvraag niet gevonden'
            });
        }

        return res.status(200).json({
            status: 'success',
            aanvraag: rows[0]
        });
    }catch (error){
        console.error('Fout bij het ophalen van stageaanvraag:', error);

        return res.status(500).json({
            status: 'error', 
            message: 'Stageaanvraag kan niet worden opgehaald'
        })

    }
}

module.exports = {maakStageaanvraag, getMijnStageaanvragen, getAlleStageaanvragen, getStageaanvraagOpId}; // andere besantden mogen deze functie ook importeren.