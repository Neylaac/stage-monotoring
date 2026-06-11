const mysql = require('mysql2'); //gebruik de package mysql2 voor dit bestand
require('dotenv').config(); //zorgt ervoor dat node.js je .env bestand leest.



const db_config = { //je maakt hier een object met alle gegevens die nodig zijn om te verbinden met de database
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

let connection; //variable waarin je later je databaseverbinding wordt opgeslagen.

function handleDisconnect(){
    connection = mysql.createConnection(db_config); //hier maak je een verbinding met MySql

    connection.connect((err)=>{ //// probeert effectief te verbinden met de database; err bevat de fout als het mislukt
    if(err){
        console.log('Fout bij verbinden met database', err);
        setTimeout(handleDisconnect,2000); 
    /* Als er een fout is bij verbinden:
    toon de fout in de console
    wacht 2 seconden
    probeer opnieuw te verbinden */
    }else{
        console.log("Verbonden met XAMPP database"); // als geen fout dan krijg je dit.
    }
        
    });

    //Als er later een databasefout gebeurt, voer deze code uit.

    connection.on('error', (err)=>{
        console.log('Database error:', err); //Dit toont de fout in de console.

        if(err.code === 'PROTOCOL_CONNECTION_LOST'){ //De verbinding met MySQL is verloren gegaan.
            handleDisconnect(); //Dan roep je opnieuw dezelfde functie op.
        }else{
            throw err; //Als het geen gewone “connection lost” is, dan gooit de code de fout door.
        }
    })
}


    
  handleDisconnect(); //hier ga je de functie oproepen, Start nu de databaseverbinding.


module.exports = connection; //Andere bestanden mogen deze databaseconnection gebruiken.




