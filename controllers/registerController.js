const connection = require('../config/db_connection').promise(); //gebruik de databaseverbinding uit db_connenction.js 
const bcrypt = require('bcrypt'); // om wachtwooord veilig op te slaan


const getGebruikerByEmail = async(email)=>{ // je maakt een functie met 1 parameter namelijk email.
    try{ // controleren of er al een gebruiker bestaat met dit emailadres
        const query = 'SELECT * FROM users WHERE email = ?'; // zoek in de tabel users naar een rij waar email gelijk is aan de de mail die ik je heb gegeven.
        const [rows] = await connection.query(query,[email]); // dit gaat de query uitvoeren
//rows de resultaten uit je database.
        if(rows.length === 0){ // als het aantal resultaten die gevonden zijn gelijk zijn aan 0 --> dus gebruiker bestaat niet
            console.log('Gebruiker niet gevonden');
            return null; // retrun ik heb geen gebruiker gevonden.
        }else{// als gebruiker wel gevonden is 
            const user = rows[0];
            console.log("Gebruiker gevonden:", email);
            return user;
        }
    }catch (error){//dat is wanneer je een fout in je try hebt
        console.error(`Fout bij ophalen gebruiker met email: ${email}`, error);
        throw error;
    }
};


const insertGebruiker = async(voornaam, achternaam, email, hashedWachtwoord) =>{ // voegt een nieuwe gebruiker toe aan de database
    try{
        const query =` 
        INSERT INTO users (voornaam, achternaam, email, wachtwoord, role)
        VALUES (?, ?, ?, ?, ?)`; // voeg een nieuwe rij toe in ussers en vul de kolommen voornaam, achternaam, email, wachtwoord en role in.

        const [result] = await connection.query(query, [ // je voert de query uit. 
            voornaam, 
            achternaam,
            email, 
            hashedWachtwoord, 
            'BEDRIJF' // staat vas want het zijn enkel de bedrijven die zich moeten registreren.
        ]);

        return result.insertId;  //geeft hier dus gewoon een nieuwe ID.
        
    }catch(error){ // als er een fout gebeurt bij de toevoeging dus in je try dan kom je hier bij de catch.
        console.error('Fout bij toevoegen nieuwe gebruiker:', error);
        throw error;
    }
};

//-------------------------------------------registreren------------------------------------------------------------------

const registreerGebruiker = async (req,res) =>{ //functie gemaakt voor registreren.
    try{
        const{voornaam, achternaam, email, wachtwoord} = req.body; // je haalt de gegevens uit je frontend

        console.log("In de register controller...");
        console.log(req.body);

        if(!voornaam || !achternaam || !email || !wachtwoord){ //contoleert of alles ingevuld is.
            return res.status(400).json({ // als niet alles ingevuld dan gebeurt er dit.
                status: 'error',
                message: "Alle velden zijn verplicht"
            });
        }




        const bestaandGebruiker = await getGebruikerByEmail(email); // roept de functie --> bestaat er al een gebruiker met deze email.

        if(bestaandGebruiker){ //als gebruiker gevonden.
            return res.status(409).json({
                status: 'error',
                message: 'Gebruiker bestaat al'
            });
        }

        const hashedWachtwoord = await bcrypt.hash(wachtwoord, 10);// maakt een veilige versie van het wachtwoord --> 10 salt round: hoe hoger dit getal, hoe moeilijker het is om de hash te kraken;

        const nieuweGebruikerId = await insertGebruiker( // als gebruiker niet bestaat maken we en je roept de functie insertgebruiker
            voornaam, 
            achternaam,
            email,
            hashedWachtwoord
        );

        console.log(`Nieuwe gebruiker toegevoegd met ID: ${nieuweGebruikerId}`); // nieuwe gebruiker toegevoegd met een ID

        res.status(201).json({ // nieuwe gebruiker succesvol aangemaakt--> 201 betekent created
            status: 'success', 
            message: 'Gebruiker geregistreerd'
        });
    }catch(error){ // fout in je try dan kom je bij de catch
        console.log(`Fout bij registreren gebruiker${error.message}`);
        throw error;

    }

}; 

module.exports = {registreerGebruiker}; //andere bestanden mogen registreerGebruiker gebruiken


