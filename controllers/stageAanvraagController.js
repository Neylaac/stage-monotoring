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

module.exports = {maakStageaanvraag}; // andere besantden mogen deze functie ook importeren.