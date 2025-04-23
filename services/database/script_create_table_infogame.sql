CREATE TABLE IF NOT EXISTS ListGameCharacter (
    ID INTEGER PRIMARY KEY,
    ClasseFR VARCHAR(50) NOT NULL,
    ClasseEN VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS ListTypeUnit (
    ID INTEGER PRIMARY KEY,
    TypeFR VARCHAR(25) NOT NULL,
    TypeEN VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS ListUnit (
    ID INTEGER PRIMARY KEY,
    UnitFR VARCHAR(50) NOT NULL,
    UnitEN VARCHAR(50) NOT NULL,
    InfuenceMax INTEGER NOT NULL,
    LvlMax INTEGER NOT NULL,
    Maitrise INTEGER DEFAULT 0, -- 0 (absence de maitrise), 1 (présence d 'une maitrise)
    TypeUnit INTEGER NOT NULL, -- Infanterie, Distant, Cavalerie
    ForceUnit VARCHAR(5) NOT NULL, -- T3, T4, T5
    Img VARCHAR(100) DEFAULT "",
    FOREIGN KEY (TypeUnit) REFERENCES ListTypeUnit (ID)
);
