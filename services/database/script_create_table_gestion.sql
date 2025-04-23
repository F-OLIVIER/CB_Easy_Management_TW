CREATE TABLE IF NOT EXISTS Houses (
    ID INTEGER PRIMARY KEY,
    House_name VARCHAR(100) NOT NULL,
    House_logo VARCHAR(250) NOT NULL,
    Langage VARCHAR(5) NOT NULL,
    ID_Server VARCHAR(30) NOT NULL,
    ID_Group_Users VARCHAR(30) NOT NULL,
    ID_Group_Officier VARCHAR(30) NOT NULL,
    ID_Chan_GvG VARCHAR(30) NOT NULL,
    ID_Chan_Gestion VARCHAR(30) NOT NULL,
    ID_Chan_Users VARCHAR(30) NOT NULL,
    Recall_GvG INTEGER DEFAULT 0,
    Allumage INTEGER DEFAULT 0, -- 0 on, 1 off
    ID_MessageGvG VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
    ID INTEGER PRIMARY KEY,
    uuid INTEGER DEFAULT "",
    DateCookie VARCHAR(50) DEFAULT "",
    DiscordID VARCHAR(50) NOT NULL,
    DiscordName VARCHAR(50) NOT NULL,
    DiscordBaseName VARCHAR(50) NOT NULL,
    DiscordRole VARCHAR(50),
    DiscordPhoto VARCHAR(500),
    ID_House INTEGER NOT NULL,
    GameCharacter_ID INTEGER DEFAULT 0,
    Lvl INTEGER DEFAULT 0,
    Influence INTEGER DEFAULT 700,
    EtatInscription INTEGER DEFAULT 0,
    NbGvGParticiped INTEGER DEFAULT 0,
    NbTotalGvG INTEGER DEFAULT 0,
    DateLastGvGParticiped_FR VARCHAR(25) default "",
    DateLastGvGParticiped_EN VARCHAR(25) default "",
    CommentGestionnaire VARCHAR(500) default "",
    uuidApp VARCHAR(50) DEFAULT "",
    uuidAppUse INTEGER DEFAULT 0,
    userLangage VARCHAR(5) DEFAULT "en",
    userAdmin INTEGER DEFAULT 0,
    FOREIGN KEY (ID_House) REFERENCES Houses (ID),
    FOREIGN KEY (GameCharacter_ID) REFERENCES ListGameCharacter (ID)
);
