function laadWeeklogboeken() {

    fetch('/api/weeklogboeken')
        .then(response => response.json())
        .then(weeklogboeken => {

            const tabel =
                document.getElementById(
                    'weeklogboekenTabel'
                );

            if (!tabel) {
                return;
            }

            tabel.innerHTML = '';

            weeklogboeken.forEach(week => {

                tabel.innerHTML += `
                    <tr>

                        <td>
                            <strong>
                                Week ${week.weeknummer}
                            </strong>
                        </td>

                        <td>
                            ${week.startdatum}
                            -
                            ${week.einddatum}
                        </td>

                        <td>

                            <span class="logboek-status ingediend">

                                Ingediend

                            </span>

                        </td>

                        <td>

                            <a
                                href="docentweeklogboek.html?id=${week.id}"
                                class="logboek-btn">

                                Bekijken

                            </a>

                        </td>

                    </tr>
                `;

            });

        })
        .catch(error => {

            console.error(error);

        });

}

laadWeeklogboeken();