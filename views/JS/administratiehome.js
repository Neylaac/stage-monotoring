async function laadStats() {
    try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
            console.error('Fout bij ophalen statistieken:', response.statusText);
            return;
        }
        const data = await response.json();
        
        const totaalStudenten = document.querySelector("#totaalStudenten");
        const totaalDocenten = document.querySelector("#totaalDocenten");
        const totaalStageplaatsen = document.querySelector("#totaalStageplaatsen");

        if (totaalStudenten) totaalStudenten.textContent = data.totaalStudenten || 0;
        if (totaalDocenten) totaalDocenten.textContent = data.totaalDocenten || 0;
        if (totaalStageplaatsen) totaalStageplaatsen.textContent = data.totaalStageplaatsen || 0;

    } catch (error) {
        console.error("Fout bij ophalen admin stats:", error);
    }
}

laadStats();
