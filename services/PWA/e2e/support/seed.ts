// Construction de la base de test, à l'identique de la production :
// - tables communes : scripts SQL de services/database (ceux qu'exécute le backend au démarrage) ;
// - tables d'une maison : mêmes requêtes que le bot Discord à la commande /config.
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DATABASE_SCRIPTS_DIR, OWNER_DISCORD_ID } from "./env";

export const HOUSE = {
  id: 1,
  serverId: "111111111111111111",
  name: "Maison Test",
};

export type Role = "member" | "officer" | "admin" | "owner";

interface SeedUser {
  id: number;
  name: string;
  discordId: string;
  role: "Membre" | "Officier";
  admin: 0 | 1;
  token: string | null;
  /** 0 non inscrit, 1 présent, 2 en retard, 3 absent */
  inscription: number;
  classId: number;
  lvl: number;
  influence: number;
}

/** Comptes de test, un par niveau de droits (+ un joueur sans session) */
export const USERS = {
  member: { id: 1, name: "Alice", discordId: "900000000000000001", role: "Membre", admin: 0, token: "token-member", inscription: 1, classId: 8, lvl: 1200, influence: 750 },
  officer: { id: 2, name: "Bob", discordId: "900000000000000002", role: "Officier", admin: 0, token: "token-officer", inscription: 1, classId: 6, lvl: 1500, influence: 800 },
  admin: { id: 3, name: "Carole", discordId: "900000000000000003", role: "Officier", admin: 1, token: "token-admin", inscription: 2, classId: 1, lvl: 900, influence: 700 },
  owner: { id: 4, name: "Owen", discordId: OWNER_DISCORD_ID, role: "Officier", admin: 1, token: "token-owner", inscription: 0, classId: 0, lvl: 0, influence: 700 },
  absent: { id: 5, name: "Damien", discordId: "900000000000000005", role: "Membre", admin: 0, token: null, inscription: 3, classId: 12, lvl: 300, influence: 700 },
} satisfies Record<string, SeedUser>;

/** Unités débloquées dans la caserne de chaque joueur inscrit : [ID d'unité, level] */
const BARRACKS: Record<number, [number, number][]> = {
  1: [[1, 30], [2, 20]],
  2: [[1, 15], [3, 30]],
  3: [[2, 30]],
};

export const FORUM = {
  active: { id: 1, title: "Bienvenue sur le forum" },
  pending: { id: 2, title: "Post en attente de validation" },
  xss: { id: 3, title: "Post piégé" },
};

function runScript(db: DatabaseSync, file: string): void {
  db.exec(fs.readFileSync(path.join(DATABASE_SCRIPTS_DIR, file), "utf8"));
}

export function buildSeedDatabase(file: string): void {
  fs.rmSync(file, { force: true });
  // Comme le backend (go-sqlite3) : clés étrangères non appliquées (GameCharacter_ID = 0 = aucune arme)
  const db = new DatabaseSync(file, { enableForeignKeyConstraints: false });
  try {
    for (const script of [
      "script_create_table_gestion.sql",
      "script_create_table_infogame.sql",
      "script_create_table_forum.sql",
      "script_INSERT_ListTypeUnit.sql",
      "script_INSERT_ListGameCharacter.sql",
      "script_INSERT_ListUnit.sql",
    ]) {
      runScript(db, script);
    }

    db.prepare(
      `INSERT INTO Houses (ID, House_name, House_logo, Langage, ID_Server, ID_Group_Users, ID_Group_Officier,
                           ID_Chan_GvG, ID_Chan_Gestion, ID_Chan_Users, Late, Recall_GvG, Allumage, ID_MessageGvG)
       VALUES (?, ?, '', 'fr', ?, '200000000000000001', '200000000000000002',
               '300000000000000001', '300000000000000002', '300000000000000003', 1, 0, 0, '')`,
    ).run(HOUSE.id, HOUSE.name, HOUSE.serverId);

    // Tables de la maison (requêtes du bot, config_house.js)
    const unitIds = db.prepare("SELECT ID FROM ListUnit ORDER BY ID").all().map((row) => Number(row.ID));
    const columns = unitIds.map((id) => `Unit${id} INTEGER DEFAULT 0`).join(",\n");
    for (const table of ["Caserne", "CaserneMaitrise"]) {
      db.exec(`CREATE TABLE ${table}${HOUSE.id} (ID INTEGER PRIMARY KEY, User_ID INTEGER NOT NULL, ${columns}, FOREIGN KEY (User_ID) REFERENCES Users (ID));`);
    }
    for (const table of ["GroupGvG", "GroupTypeAtt", "GroupTypeDef"]) {
      db.exec(`CREATE TABLE ${table}${HOUSE.id} (
        ID INTEGER PRIMARY KEY, User_ID INTEGER NOT NULL, GroupNumber INTEGER NOT NULL,
        Unit1 VARCHAR(50) DEFAULT "", Unit2 VARCHAR(50) DEFAULT "", Unit3 VARCHAR(50) DEFAULT "", Unit4 VARCHAR(50) DEFAULT "",
        Comment VARCHAR(500) DEFAULT "", FOREIGN KEY (User_ID) REFERENCES Users (ID));`);
    }
    db.exec(`CREATE TABLE NameGroupGvG${HOUSE.id} (ID INTEGER PRIMARY KEY, GroupNumber INTEGER NOT NULL, NameGroup VARCHAR(150) NOT NULL);`);

    const insertUser = db.prepare(
      `INSERT INTO Users (ID, uuid, DateCookie, DiscordID, DiscordName, DiscordBaseName, DiscordRole, DiscordPhoto, ID_House,
                          GameCharacter_ID, Lvl, Influence, EtatInscription, NbGvGParticiped, NbTotalGvG,
                          DateLastGvGParticiped_FR, DateLastGvGParticiped_EN, userLangage, userAdmin)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, 4, ?, ?, 'fr', ?)`,
    );
    for (const user of Object.values(USERS) as SeedUser[]) {
      const participated = user.inscription ? 2 : 0;
      insertUser.run(
        user.id,
        user.token ?? "",
        user.token ? "2099-01-01 00:00:00" : "",
        user.discordId,
        user.name,
        user.name,
        user.role,
        HOUSE.id,
        user.classId,
        user.lvl,
        user.influence,
        user.inscription,
        participated,
        participated ? "16/08/2025" : "",
        participated ? "2025/08/16" : "",
        user.admin,
      );
    }

    for (const [userId, units] of Object.entries(BARRACKS)) {
      const sets = units.map(([unit]) => `Unit${unit}`);
      const placeholders = units.map(() => "?").join(", ");
      db.prepare(`INSERT INTO Caserne${HOUSE.id} (User_ID, ${sets.join(", ")}) VALUES (?, ${placeholders})`).run(Number(userId), ...units.map(([, lvl]) => lvl));
      db.prepare(`INSERT INTO CaserneMaitrise${HOUSE.id} (User_ID) VALUES (?)`).run(Number(userId));
    }

    const insertPost = db.prepare("INSERT INTO Forum (ID, Author, Date, Title, Content, Valid, Archive) VALUES (?, ?, '2026-10-01 18:30:00', ?, ?, ?, 0)");
    insertPost.run(FORUM.active.id, USERS.officer.id, FORUM.active.title, "<p>Premier message du forum.</p>", 1);
    insertPost.run(FORUM.pending.id, USERS.member.id, FORUM.pending.title, "<p>Ce post attend un administrateur.</p>", 0);
    insertPost.run(FORUM.xss.id, USERS.member.id, FORUM.xss.title, `<p>Bonjour</p><img src="x" onerror="window.__xss = true"><script>window.__xss = true</script><p class="toast toast--error" id="faux-message" style="position:fixed">Faux message</p>`, 1);
  } finally {
    db.close();
  }
}
