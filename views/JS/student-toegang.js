window.addEventListener('load', () => {

    fetch('/api/student/toegang')
        .then(response => response.json())
        .then(data => {

            if (data.status !== 'success') {
                console.log(data.message);
                return;
            }

            if (data.toegang === true) {

                const sloten =
                    document.querySelectorAll('.lock');

                sloten.forEach(slot => {
                    slot.style.display = 'none';
                });

                const homeLink =
                    document.getElementById('homeLink');

                const logboekenLink =
                    document.getElementById('logboekenLink');

                const evaluatieLink =
                    document.getElementById('evaluatieLink');

                const profielLink =
                    document.getElementById('profielLink');

                if (homeLink) {
                    homeLink.href = '/student/home';
                }

                if (logboekenLink) {
                    logboekenLink.href = '/student/logboeken';
                }

                if (evaluatieLink) {
                    evaluatieLink.href = '/student/evaluatie';
                }

                if (profielLink) {
                    profielLink.href = '/student/profiel';
                }
            }
        })
        .catch(error => {
            console.error('Fout bij controleren toegang:', error);
        });
});