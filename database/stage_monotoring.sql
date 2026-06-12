CREATE DATABASE IF NOT EXISTS stage_monitoring;
USE stage_monitoring;

DROP TABLE IF EXISTS stageaanvragen;
DROP TABLE IF EXISTS student_docent;
DROP TABLE IF EXISTS bedrijf_profiles;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voornaam VARCHAR(100) NOT NULL,
    achternaam VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wachtwoord VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'DOCENT', 'BEDRIJF', 'STAGECOMMISSIE', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    studentnummer VARCHAR(50) NOT NULL,
    opleiding VARCHAR(150) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id),
    UNIQUE(studentnummer)
);

CREATE TABLE bedrijf_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bedrijfsnaam VARCHAR(150) NOT NULL,
    telefoonnummer VARCHAR(50),
    adres VARCHAR(255),
    contactpersoon VARCHAR(150),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);


CREATE TABLE student_docent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    docent_id INT NOT NULL,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (docent_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE(student_id)
);

CREATE TABLE stageaanvragen (
    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,
    docent_id INT  NULL,
    bedrijf_id INT NULL,

    docent_naam VARCHAR(200) NOT NULL,
    docent_email VARCHAR(255) NOT NULL,

    startdatum DATE NOT NULL,
    einddatum DATE NOT NULL,
    functie VARCHAR(150) NOT NULL,

    bedrijfsnaam VARCHAR(150) NOT NULL,
    contactpersoon VARCHAR(150) NOT NULL,
    email_bedrijf VARCHAR(255) NOT NULL,
    telefoonnummer VARCHAR(50) NOT NULL,
    adres VARCHAR(255) NOT NULL,

    opdracht VARCHAR(255) NOT NULL,
    omschrijving TEXT NOT NULL,

    status ENUM(
        'INGEDIEND',
        'GOEDGEKEURD',
        'AFGEKEURD',
        'AANPASSING_GEVRAAGD'
    ) DEFAULT 'INGEDIEND',

    feedback TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (docent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bedrijf_id) REFERENCES bedrijf_profiles(id) ON DELETE SET NULL
); 


