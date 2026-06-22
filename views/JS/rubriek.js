document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch user profile to identify role and initials
    fetch("/api/user/profile")
        .then(response => response.json())
        .then(data => {
            if (data.status !== "success") {
                window.location.href = "/login";
                return;
            }

            const user = data.user;
            const role = user.role;

            // Set user initials in header
            const circle = document.getElementById("userCircle");
            if (circle) {
                circle.textContent = user.voornaam.charAt(0) + user.achternaam.charAt(0);
            }

            // Populate dynamic sidebar and set back button href based on role
            renderSidebarAndSetupBackLink(role);
        })
        .catch(err => {
            console.error("Fout bij laden gebruikersprofiel:", err);
            window.location.href = "/login";
        });

    function renderSidebarAndSetupBackLink(role) {
        const sidebarTitle = document.getElementById("sidebarTitle");
        const sidebarMenuItems = document.getElementById("sidebarMenuItems");
        const terugKnop = document.getElementById("terugKnop");

        if (!sidebarTitle || !sidebarMenuItems) return;

        let menuHtml = "";
        let backUrl = "#";

        if (role === "STUDENT") {
            sidebarTitle.textContent = "Student";
            backUrl = "/student/home";
            menuHtml = `
                <a href="/student/stageaanvraag" class="menu-item">
                    <i class="fa-solid fa-graduation-cap"></i>
                    <span>Stageaanvraag</span>
                </a>
                <a href="/student/home" class="menu-item">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="#" class="menu-item">
                    <i class="fa-solid fa-book"></i>
                    <span>Logboeken</span>
                    <i class="fa-solid fa-lock lock"></i>
                </a>
                <a href="/student/evaluatie" class="menu-item">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span>Evaluatie</span>
                    <i class="fa-solid fa-lock lock"></i>
                </a>
                <a href="/rubriek" class="menu-item active">
                    <i class="fa-solid fa-table"></i>
                    <span>Rubriek</span>
                </a>
            `;
        } else if (role === "BEDRIJF") {
            sidebarTitle.textContent = "Bedrijf";
            backUrl = "/bedrijf/home";
            menuHtml = `
                <a href="/bedrijf/home" class="menu-item">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="/bedrijf-stageovereenkomst-overzicht" class="menu-item">
                    <i class="fa-solid fa-users"></i>
                    <span>Stagiairs</span>
                </a>
                <a href="#" class="menu-item">
                    <i class="fa-solid fa-book"></i>
                    <span>Logboeken</span>
                </a>
                <a href="/bedrijf/evaluatie" class="menu-item">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span>Evaluatie</span>
                </a>
                <a href="/rubriek" class="menu-item active">
                    <i class="fa-solid fa-table"></i>
                    <span>Rubriek</span>
                </a>
            `;
        } else if (role === "DOCENT") {
            sidebarTitle.textContent = "Docent";
            backUrl = "/docent/home";
            menuHtml = `
                <a href="/docent/home" class="menu-item">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="/docent/stageovereenkomsten" class="menu-item">
                    <i class="fa-solid fa-briefcase"></i>
                    <span>Stageovereenkomst</span>
                </a>
                <a href="/docent/evaluaties" class="menu-item">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span>Evaluaties</span>
                </a>
                <a href="/docent/home" class="menu-item">
                    <i class="fa-solid fa-graduation-cap"></i>
                    <span>Studenten</span>
                </a>
                <a href="/rubriek" class="menu-item active">
                    <i class="fa-solid fa-table"></i>
                    <span>Rubriek</span>
                </a>
            `;
        } else if (role === "ADMIN") {
            sidebarTitle.textContent = "Admin";
            backUrl = "/administratie/home";
            menuHtml = `
                <a href="/administratie/home" class="menu-item">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="/rubriek" class="menu-item active">
                    <i class="fa-solid fa-table"></i>
                    <span>Rubriek</span>
                </a>
            `;
        } else {
            sidebarTitle.textContent = "Menu";
            backUrl = "/";
            menuHtml = `
                <a href="/" class="menu-item">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
            `;
        }

        sidebarMenuItems.innerHTML = menuHtml;
        if (terugKnop) {
            terugKnop.href = backUrl;
        }
    }
});
