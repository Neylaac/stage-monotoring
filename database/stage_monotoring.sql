CREATE DATABASE IF NOT EXISTS stage_monitoring;
USE stage_monitoring;

DROP TABLE IF EXISTS stageaanvragen;
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


CREATE TABLE stageaanvragen (
    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,
    docent_id INT NULL,
    bedrijf_id INT NULL,

    startdatum DATE NOT NULL,
    einddatum DATE NOT NULL,
    functie VARCHAR(150) NOT NULL,

    bedrijfsnaam VARCHAR(150) NOT NULL,
    email_bedrijf VARCHAR(255) NOT NULL,
    telefoonnummer VARCHAR(50) NOT NULL,

    gemeente VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    straat VARCHAR(150) NOT NULL,
    straatnummer VARCHAR(20) NOT NULL,

    contact_voornaam VARCHAR(100) NOT NULL,
    contact_naam VARCHAR(100) NOT NULL,

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

    FOREIGN KEY (student_id)REFERENCES users(id)ON DELETE CASCADE,
    FOREIGN KEY (bedrijf_id)REFERENCES bedrijf_profiles(id)ON DELETE SET NULL
);


CREATE TABLE stageovereenkomsten (
    id INT AUTO_INCREMENT PRIMARY KEY,

    stageaanvraag_id INT NOT NULL UNIQUE,

    student_ondertekend BOOLEAN DEFAULT FALSE,
    bedrijf_ondertekend BOOLEAN DEFAULT FALSE,
    school_ondertekend BOOLEAN DEFAULT FALSE,

    student_handtekening LONGTEXT NULL,
    bedrijf_handtekening LONGTEXT NULL,
    school_handtekening LONGTEXT NULL,

    student_ondertekend_op DATETIME NULL,
    bedrijf_ondertekend_op DATETIME NULL,
    school_ondertekend_op DATETIME NULL,

    goedgekeurd BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (stageaanvraag_id)
        REFERENCES stageaanvragen(id)
        ON DELETE CASCADE
);



CREATE TABLE koppelingen (
  koppeling_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  docent_id INT NOT NULL,
  gekoppeld_op DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (docent_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS evaluaties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  type ENUM('ZELF_TUSSENTIJDS', 'ZELF_EIND', 'TUSSENTIJDS', 'EIND') NOT NULL,
  
  -- Planning & Organisatie
  planning_score VARCHAR(50) NULL,
  planning_feedback TEXT NULL,
  planning_score_docent VARCHAR(50) NULL,
  planning_feedback_docent TEXT NULL,

  -- Technische Uitwerking
  technisch_score VARCHAR(50) NULL,
  technisch_feedback TEXT NULL,
  technisch_score_docent VARCHAR(50) NULL,
  technisch_feedback_docent TEXT NULL,

  -- Onderzoek & Probleemoplossing
  onderzoek_score VARCHAR(50) NULL,
  onderzoek_feedback TEXT NULL,
  onderzoek_score_docent VARCHAR(50) NULL,
  onderzoek_feedback_docent TEXT NULL,

  -- Communicatie & Professionele Houding
  communicatie_score VARCHAR(50) NULL,
  communicatie_feedback TEXT NULL,
  communicatie_score_docent VARCHAR(50) NULL,
  communicatie_feedback_docent TEXT NULL,

  -- Groei, Initiatief & Ethiek
  groei_score VARCHAR(50) NULL,
  groei_feedback TEXT NULL,
  groei_score_docent VARCHAR(50) NULL,
  groei_feedback_docent TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_type (student_id, type)
);