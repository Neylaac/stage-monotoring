
USE stage_monitoring;

-- Testdata
-- Wachtwoord voor alle accounts: Test1234!


INSERT INTO users (voornaam, achternaam, email, wachtwoord, role) VALUES
('Admin', 'School', 'admin@ehb.be', '$2b$10$Kf/f8/TYJ63/z2cmDwR6Mu7u0GZM04GbVGsMG.lrc.WDQkBysEGRW', 'ADMIN'),
('Stagecommissie', 'School', 'stagecommissie@ehb.be', '$2b$10$Kf/f8/TYJ63/z2cmDwR6Mu7u0GZM04GbVGsMG.lrc.WDQkBysEGRW', 'STAGECOMMISSIE'),
('Neyla', 'Achaoui', 'neyla.achaoui@student.ehb.be', '$2b$10$Kf/f8/TYJ63/z2cmDwR6Mu7u0GZM04GbVGsMG.lrc.WDQkBysEGRW', 'STUDENT'),
('Malak', 'Achaoui', 'malak.achaoui@student.ehb.be', '$2b$10$Kf/f8/TYJ63/z2cmDwR6Mu7u0GZM04GbVGsMG.lrc.WDQkBysEGRW', 'STUDENT'),
('Bart', 'Bellemans', 'bart.bellemans@docent.ehb.be', '$2b$10$Kf/f8/TYJ63/z2cmDwR6Mu7u0GZM04GbVGsMG.lrc.WDQkBysEGRW', 'DOCENT')

ON DUPLICATE KEY UPDATE
    voornaam = VALUES(voornaam),
    achternaam = VALUES(achternaam),
    wachtwoord = VALUES(wachtwoord),
    role = VALUES(role);

-- Extra studentgegevens voor Neyla
INSERT INTO student_profiles (user_id, studentnummer, opleiding)
SELECT id, 'STU001', 'Toegepaste Informatica'
FROM users
WHERE email = 'neyla.achaoui@student.ehb.be'
ON DUPLICATE KEY UPDATE
    studentnummer = VALUES(studentnummer),
    opleiding = VALUES(opleiding);

INSERT INTO student_profiles (user_id, studentnummer, opleiding)
SELECT id, 'STU002', 'Toegepaste Informatica'
FROM users
WHERE email = 'malak.achaoui@student.ehb.be'
ON DUPLICATE KEY UPDATE
    studentnummer = VALUES(studentnummer),
    opleiding = VALUES(opleiding);
