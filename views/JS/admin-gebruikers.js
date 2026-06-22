document.addEventListener('DOMContentLoaded', () => {
    let studentenList = [];
    let docentenList = [];
    let activeTab = 'STUDENT'; // STUDENT or DOCENT

    const tabStudenten = document.getElementById('tabStudenten');
    const tabDocenten = document.getElementById('tabDocenten');
    const userSearch = document.getElementById('userSearch');
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    const roleSelect = document.getElementById('roleSelect');
    const studentFields = document.getElementById('studentFields');
    const studentnummerInput = document.getElementById('studentnummer');
    const opleidingInput = document.getElementById('opleiding');
    const form = document.getElementById('gebruikerForm');
    const formFeedback = document.getElementById('formFeedback');

    // Modal elements
    const addUserModal = document.getElementById('addUserModal');
    const openAddUserModal = document.getElementById('openAddUserModal');
    const closeAddUserModal = document.getElementById('closeAddUserModal');

    // Modal open/close actions
    openAddUserModal.addEventListener('click', () => {
        addUserModal.classList.add('open');
        formFeedback.textContent = '';
    });

    closeAddUserModal.addEventListener('click', () => {
        addUserModal.classList.remove('open');
        form.reset();
    });

    addUserModal.addEventListener('click', (e) => {
        if (e.target === addUserModal) {
            addUserModal.classList.remove('open');
            form.reset();
        }
    });

    // Load data from the server
    async function loadUsers() {
        try {
            const [studentenRes, docentenRes] = await Promise.all([
                fetch('/api/admin/studenten'),
                fetch('/api/admin/docenten')
            ]);

            if (studentenRes.ok) {
                studentenList = await studentenRes.json();
            } else {
                console.error('Kon studenten niet laden');
            }

            if (docentenRes.ok) {
                docentenList = await docentenRes.json();
            } else {
                console.error('Kon docenten niet laden');
            }

            renderTable();
        } catch (error) {
            console.error('Fout bij laden van gebruikers:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table" style="color: #832D2C; font-weight: bold;">
                        Fout bij laden van gebruikers. Controleer de databaseverbinding.
                    </td>
                </tr>
            `;
        }
    }

    // Render table rows dynamically based on the active tab and search query
    function renderTable() {
        const query = userSearch.value.trim().toLowerCase();
        tableBody.innerHTML = '';

        if (activeTab === 'STUDENT') {
            // Headers for studenten
            tableHead.innerHTML = `
                <tr>
                    <th style="width: 20%; padding: 12px;">Naam</th>
                    <th style="width: 30%; padding: 12px;">E-mailadres</th>
                    <th style="width: 15%; padding: 12px;">Studentnummer</th>
                    <th style="width: 35%; padding: 12px;">Opleiding</th>
                </tr>
            `;

            // Filter students
            const filteredStudents = studentenList.filter(s => {
                const fullName = `${s.voornaam} ${s.achternaam}`.toLowerCase();
                const email = (s.email || '').toLowerCase();
                const studentnummer = (s.studentnummer || '').toLowerCase();
                const opleiding = (s.opleiding || '').toLowerCase();
                return fullName.includes(query) || email.includes(query) || studentnummer.includes(query) || opleiding.includes(query);
            });

            if (filteredStudents.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-table" style="text-align: center; padding: 20px; color: #777;">
                            Geen studenten gevonden.
                        </td>
                    </tr>
                `;
            } else {
                filteredStudents.forEach(s => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 12px; font-weight: bold; word-wrap: break-word; white-space: normal;">${s.voornaam} ${s.achternaam}</td>
                        <td style="padding: 12px; word-wrap: break-word; white-space: normal;">${s.email}</td>
                        <td style="padding: 12px; word-wrap: break-word; white-space: normal;">${s.studentnummer || '-'}</td>
                        <td style="padding: 12px; word-wrap: break-word; white-space: normal;">${s.opleiding || '-'}</td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        } else {
            // Headers for docenten
            tableHead.innerHTML = `
                <tr>
                    <th style="width: 40%; padding: 12px;">Naam</th>
                    <th style="width: 60%; padding: 12px;">E-mailadres</th>
                </tr>
            `;

            // Filter docenten
            const filteredDocenten = docentenList.filter(d => {
                const fullName = `${d.voornaam} ${d.achternaam}`.toLowerCase();
                const email = (d.email || '').toLowerCase();
                return fullName.includes(query) || email.includes(query);
            });

            if (filteredDocenten.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="2" class="empty-table" style="text-align: center; padding: 20px; color: #777;">
                            Geen docenten gevonden.
                        </td>
                    </tr>
                `;
            } else {
                filteredDocenten.forEach(d => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 12px; font-weight: bold; word-wrap: break-word; white-space: normal;">${d.voornaam} ${d.achternaam}</td>
                        <td style="padding: 12px; word-wrap: break-word; white-space: normal;">${d.email}</td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        }
    }

    // Tab buttons event listeners
    tabStudenten.addEventListener('click', () => {
        activeTab = 'STUDENT';
        tabStudenten.classList.add('active');
        tabDocenten.classList.remove('active');
        renderTable();
    });

    tabDocenten.addEventListener('click', () => {
        activeTab = 'DOCENT';
        tabDocenten.classList.add('active');
        tabStudenten.classList.remove('active');
        renderTable();
    });

    // Live search event listener
    userSearch.addEventListener('input', renderTable);

    // Role selection changes in the form
    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'STUDENT') {
            studentFields.style.display = 'block';
            studentnummerInput.setAttribute('required', 'required');
            opleidingInput.setAttribute('required', 'required');
        } else {
            studentFields.style.display = 'none';
            studentnummerInput.removeAttribute('required');
            opleidingInput.removeAttribute('required');
        }
    });

    // Handle form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        formFeedback.textContent = 'Bezig met opslaan...';
        formFeedback.style.color = '#333';

        const role = roleSelect.value;
        const voornaam = document.getElementById('voornaam').value.trim();
        const achternaam = document.getElementById('achternaam').value.trim();
        const email = document.getElementById('email').value.trim();
        const wachtwoord = document.getElementById('wachtwoord').value;

        const bodyData = {
            voornaam,
            achternaam,
            email,
            wachtwoord
        };

        let endpoint = '/api/admin/docenten';

        if (role === 'STUDENT') {
            endpoint = '/api/admin/studenten';
            bodyData.studentnummer = studentnummerInput.value.trim();
            bodyData.opleiding = opleidingInput.value.trim();
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                formFeedback.textContent = data.message || 'Gebruiker succesvol aangemaakt!';
                formFeedback.style.color = '#2E9E49';
                form.reset();

                // Reset role state
                roleSelect.value = role;
                if (role === 'STUDENT') {
                    studentFields.style.display = 'block';
                    studentnummerInput.setAttribute('required', 'required');
                    opleidingInput.setAttribute('required', 'required');
                } else {
                    studentFields.style.display = 'none';
                    studentnummerInput.removeAttribute('required');
                    opleidingInput.removeAttribute('required');
                }

                // Reload users immediately
                loadUsers();

                // Close modal after a brief delay so success feedback is visible
                setTimeout(() => {
                    addUserModal.classList.remove('open');
                    formFeedback.textContent = '';
                }, 1200);
            } else {
                formFeedback.textContent = data.message || 'Fout bij het aanmaken van gebruiker.';
                formFeedback.style.color = '#832D2C';
            }
        } catch (error) {
            console.error('Fout bij submit:', error);
            formFeedback.textContent = 'Er is een verbindingsfout opgetreden.';
            formFeedback.style.color = '#832D2C';
        }
    });

    // Initial load
    loadUsers();
});
