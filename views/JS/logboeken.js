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

    opslaanBtn.addEventListener('click', () => {

        sessionStorage.setItem(
            'successMessage',
            'Logboek opgeslagen'
        );

        window.location.href =
            'studentlogboeken.html';

    });

}