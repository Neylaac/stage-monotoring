const competentieButtons =
    document.querySelectorAll('.competentie-btn');

competentieButtons.forEach(button => {

    button.addEventListener('click', () => {

        button.classList.toggle('selected');

    });
});
const conceptBtn = document.getElementById('conceptBtn');

if (conceptBtn) {

    conceptBtn.addEventListener('click', () => {

        sessionStorage.setItem(
            'successMessage',
            'Daglogboek opgeslagen als concept'
        );

        window.location.href =
            'studentlogboeken.html';
    });

}
const successMessage =
    document.getElementById('successMessage');

const storedMessage =
    sessionStorage.getItem('successMessage');

if (successMessage && storedMessage) {

    successMessage.textContent =
        storedMessage;

    successMessage.style.display =
        'block';

    sessionStorage.removeItem(
        'successMessage'
    );

}

const melding =
    localStorage.getItem("successMessage");

if (melding) {

    alert(melding);

    localStorage.removeItem(
        "successMessage"
    );

}
const opslaanBtn = document.getElementById('opslaanBtn');

if (opslaanBtn) {

    opslaanBtn.addEventListener('click', async () => {

        const logboekData = {
            datum: datumInput.value,
            aantalUren: urenInput.value,
            taken: takenInput.value,
            geleerd: geleerdInput.value,
            problemen: problemenInput.value
        };

        try {

            const response = await fetch(
                '/api/daglogboeken',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(logboekData)
                }
            );

            const data = await response.json();

            console.log(data);

            sessionStorage.setItem(
                'successMessage',
                'Logboek opgeslagen'
            );

        } catch (error) {

            console.error(error);

            alert('Opslaan mislukt');

        }

    });

}
const datumInput = document.getElementById('datum');
const urenInput = document.getElementById('aantalUren');
const takenInput = document.getElementById('taken');
const geleerdInput = document.getElementById('geleerd');
const problemenInput = document.getElementById('problemen');

if (opslaanBtn) {

    opslaanBtn.addEventListener('click', () => {

        const logboekData = {
            datum: datumInput.value,
            aantalUren: urenInput.value,
            taken: takenInput.value,
            geleerd: geleerdInput.value,
            problemen: problemenInput.value
        };

        console.log(logboekData);

    });

}