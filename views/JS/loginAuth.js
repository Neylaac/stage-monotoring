document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form'); //HTML zoekt je formulieren

    const loginBox = document.querySelector('#login-box');
    const registerBox = document.querySelector('#register-box'); //zoekt de twee form-boxen.

    const showRegister = document.querySelector("#show-register");
    const showLogin = document.querySelector("#show-login"); // zoekt de klikbare links


    //-----------------------------Van login naar register-----------------------------------------------//

    if (showRegister) {
        showRegister.addEventListener('click', (e) => { // Als je de register link ziet, wanneer je erop drukt, luister ernaar
            e.preventDefault(); //Niet navigeren. Blijf op deze pagina.

            loginBox.classList.add('hidden'); //loginbox krijgt hidden
            registerBox.classList.remove('hidden'); //registerbox verliest hidden
        })
    }


    //-----------------------------Van register naar login-----------------------------------------------//
    if (showLogin) {
        showLogin.addEventListener('click', (e) => { // Als je de register link ziet, wanneer je erop drukt, luister ernaar
            e.preventDefault(); //Niet navigeren. Blijf op deze pagina.

            registerBox.classList.add('hidden'); //registerBox krijgt hidden

            loginBox.classList.remove('hidden'); //loginBox verliest hidden

        })
    }

    //----------------------------LoginForm-Blok-----------------------------------------------//


    if (loginForm) { // bestaat het loginformlier op deze pagina 
        loginForm.addEventListener('submit', async (e) => { //wanneer iemand het loginformulier verze,dt, voer deze code uit.
            e.preventDefault(); //async betekent dat je binnen deze functie await mag gebruiken.

            const email = document.querySelector('#login-email').value; //zoek in je HTML pagina login-email en de value pakt de tekst die de gebruiker heeft ingevuld
            const wachtwoord = document.querySelector('#login-wachtwoord').value; //hetzelfde als email maar voor wachtwoord. 

            const result = await loginGebruiker(email, wachtwoord); // je roept de loginfunctie, je reeft 2 dingen binnen namelijk email en wachtwoord, je antwoord komt in je result. 

            if (result.status === 'success') { //als de respons sucessvol is 
                //accesstoken is een soort digitaal bewijs om aan te tonen welke gebruiker ingelogd is.
                const accessToken = result.accessToken; //haalt de token uit het antwoord van de backend
                const role = result.role; // je haalt de rol van de gebruiker uit het antwoord. 

                localStorage.setItem('accessToken', accessToken); // je bewaart de token in de browser.
                localStorage.setItem('role', role); // je bewaart ook je rol in de brouwsr.

                window.location.href = `/set-token?token=${accessToken}&role=${role}`;
            } else {
                alert(result.message);// als login niet gelukt heeft
            }


        });
    }


    //----------------------------RegisterForm-Blok-----------------------------------------------//

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            //waarden uit het formulier halen. 
            const voornaam = document.querySelector('#register-voornaam').value;
            const achternaam = document.querySelector('#register-achternaam').value;
            const email = document.querySelector('#register-email').value;
            const wachtwoord = document.querySelector('#register-wachtwoord').value; //hetzelfde als email maar voor wachtwoord. 


            const result = await registreerGebruiker (voornaam, achternaam, email, wachtwoord);
            /*
    Roep de functie registreerGebruiker op.
    Geef voornaam, achternaam, email en wachtwoord mee.
    Wacht op het antwoord van de backend.
    Bewaar het antwoord in result.
            */

            if (result.status === 'success') {
                alert("Registratie succesvol. Je kan nu inloggen");

                registerBox.classList.add('hidden');
                loginBox.classList.remove('hidden')

                registerForm.reset();

            } else {
                alert(result.message)
            }

        })
    }

});

//async betekent dat deze functie iets gaat doen dat tijd nodig heeft.
const loginGebruiker = async (email, wachtwoord) => {  // maak een functie met de naam loginGebruiker, de functie krijgt twee waarden binnen; email en wachtwoord.
    try { // Probeer deze code uit te voeren.
        const response = await fetch('/login', { // stuur een request naar login en login is een backend route + await betekent: Wacht tot de backend antwoord geeft.
            method: 'POST', // welk soort request --> POST is voor gegevens versturen, zoals login-data.
            headers: { // extra informatie over je request 
                'Content-Type': 'application/json' // de header zegt tegen de backend: de data dat ik stuur is JSON
            },
            body: JSON.stringify({ email, wachtwoord }) //body : inhoud die je aan je backend stuurt + JSON.stringify: zet een JavaScript-object om naar JSON-tekst.
        });
        // respons is eigenlijk de antwoord van je backend, maar is nog niet de echte data
        const result = await response.json();//leest de JSON-response van de backend en zet die om naar een JavaScript-object.
        return result;
    } catch (error) { // als er iets fout gaat in de try 
        console.log("Error in login gebruiker", error); //toont de fout in de console. 
        return {
            status: 'error',
            message: 'er is iets fout gegaan bij het inloggen.'
        }
    }

};

const registreerGebruiker = async (voornaam, achternaam, email, wachtwoord) => {
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ voornaam, achternaam, email, wachtwoord })
        });

        const result = await response.json();
        return result
    } catch (error) {
        console.log('Error in registratie:', error);

        return {
            status: 'error',
            message: 'Er is iets fout gegaan bij het registreren'
        };
    }
};







