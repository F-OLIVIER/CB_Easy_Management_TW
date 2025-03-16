// Fichier annexe
import { msgChanDiscord, reponseUserInteraction, verif_perm_channel } from "./Constant.js";
import { interactionsCache } from "./Main.js";
import { adressdb, siteInternet } from "./config.js";
import { initial_msgreactgvg } from "./Embed_gvg.js";
import { createUserOneDiscord } from "./FuncData.js";
import { loadTranslations } from "./language.js";
import { logToFile } from "./log.js";

// Module nodejs et npm
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function config_1_language(interaction) {
  const translate = await loadTranslations("global");

  const options = Object.values(translate.list_language).map((language) => ({
    label: language.name,
    value: language.id,
  }));

  const selectMenu = new StringSelectMenuBuilder().setCustomId("config_language").setPlaceholder("Select your language").addOptions(options);
  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: "<@" + interaction.user.id + ">, select Discord bot language",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

export async function config_2_avertissement(interaction) {
  await interaction.deferUpdate();

  // Récupération de la valeur et initialisation du cache
  const userId = interaction.user.id;
  const language = interaction.values[0];
  const server = interaction.guildId;

  if (server == null) {
    const translate = await loadTranslations("global");
    await reponseUserInteraction(interaction, translate.noperm);
    logToFile(`Erreur server = null (config_2_avertissement) : ${translate.noperm}`);
    return;
  }
  // Initialisation du cache pour l'utilisateur
  interactionsCache.set(userId, {
    House_name: "",
    House_logo: interaction.guild.iconURL(),
    Langage: language,
    ID_Server: server,
    ID_Group_Users: "",
    ID_Group_Officier: "",
    ID_Chan_GvG: "",
    ID_Chan_Gestion: "",
    ID_Chan_Users: "",
    ID_MessageGvG: "",
  });

  const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("config_avertissement").setLabel("Suite").setStyle(ButtonStyle.Primary));
  const translate = await loadTranslations(language);
  // Suppression de l'intéraction précédente
  await interaction.deleteReply();
  await interaction.followUp({
    content: "<@" + userId + ">\n" + translate.config.avertissement + "\n" + siteInternet + "/description",
    flags: MessageFlags.Ephemeral,
    components: [buttons],
  });
  return;
}

export async function config_3_ID_Chan_GvG(interaction) {
  let houseData = interactionsCache.get(interaction.user.id);
  const translate = await loadTranslations(houseData.Langage);
  return await list_discord_channels(interaction, translate.config.ID_Chan_GvG, "config_3_ID_Chan_GvG");
}

export async function config_4_ID_Chan_Gestion(interaction) {
  const userId = interaction.user.id;
  // Mise à jour du cache
  let houseData = interactionsCache.get(userId);
  houseData.ID_Chan_GvG = interaction.values[0];
  interactionsCache.set(userId, houseData);
  // Reponse à l'utilisateur
  const translate = await loadTranslations(houseData.Langage);
  // Vérification des permissions du channel
  const valid = await verif_perm_channel(houseData.ID_Chan_GvG);
  if (valid) {
    // Si le chan à les permissions continuer l'interaction
    return await list_discord_channels(interaction, translate.config.ID_Chan_Gestion, "config_4_ID_Chan_Gestion");
  } else {
    await interaction.deferUpdate();
    await interaction.deleteReply();
    await interaction.followUp({
      content: `<@${interaction.user.id}>\n${translate.config.noperm} <#${houseData.ID_Chan_GvG}>`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function config_5_ID_Chan_Users(interaction) {
  const userId = interaction.user.id;
  // Mise à jour du cache
  let houseData = interactionsCache.get(userId);
  houseData.ID_Chan_Gestion = interaction.values[0];
  interactionsCache.set(userId, houseData);
  // Reponse à l'utilisateur
  const translate = await loadTranslations(houseData.Langage);

  // Vérification des permissions du channel
  const valid = await verif_perm_channel(houseData.ID_Chan_Gestion);
  if (valid) {
    // Si le chan à les permissions continuer l'interaction
    return await list_discord_channels(interaction, translate.config.ID_Chan_Users, "config_5_ID_Chan_Users");
  } else {
    await interaction.deferUpdate();
    await interaction.deleteReply();
    await interaction.followUp({
      content: `<@${interaction.user.id}>\n${translate.config.noperm} <#${houseData.ID_Chan_Gestion}>`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function config_6_ID_Group_Users(interaction) {
  const userId = interaction.user.id;
  // Mise à jour du cache
  let houseData = interactionsCache.get(userId);
  houseData.ID_Chan_Users = interaction.values[0];
  interactionsCache.set(userId, houseData);
  // Reponse à l'utilisateur
  const translate = await loadTranslations(houseData.Langage);
  // Vérification des permissions du channel
  const valid = await verif_perm_channel(houseData.ID_Chan_Users);
  if (valid) {
    return await list_discord_roles(interaction, translate.config.ID_Group_Users, "config_6_ID_Group_Users");
  } else {
    await interaction.deferUpdate();
    await interaction.deleteReply();
    await interaction.followUp({
      content: `<@${interaction.user.id}>\n${translate.config.noperm} <#${houseData.ID_Chan_Users}>`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function config_7_ID_Group_Officier(interaction) {
  const userId = interaction.user.id;
  // Mise à jour du cache
  let houseData = interactionsCache.get(userId);
  houseData.ID_Group_Users = interaction.values[0];
  interactionsCache.set(userId, houseData);
  // Reponse à l'utilisateur
  const translate = await loadTranslations(houseData.Langage);
  return await list_discord_roles(interaction, translate.config.ID_Group_Officier, "config_7_ID_Group_Officier");
}

export async function config_8_name_house(interaction) {
  const userId = interaction.user.id;
  // Mise à jour du cache
  let houseData = interactionsCache.get(userId);
  houseData.ID_Group_Officier = interaction.values[0];
  interactionsCache.set(userId, houseData);
  const translate = await loadTranslations(houseData.Langage);
  // Modal pour récupérer le nom de la maison
  const modal = new ModalBuilder()
    .setTitle("Création d'un événement")
    .setCustomId("modalHouse_name")
    .setComponents(new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("House_name").setLabel(translate.config.House_name).setStyle(TextInputStyle.Short).setRequired(true)));
  await interaction.showModal(modal);
}

export async function config_finish(interaction) {
  await interaction.deferUpdate();
  const userId = interaction.user.id;
  // Récupération du cache utilisateur
  let houseData = interactionsCache.get(userId);
  houseData.House_name = interaction.fields.getTextInputValue("House_name");

  const exist_id_house = await get_ID_House(houseData);

  if (exist_id_house == 0) {
    // Création du message GvG initial
    houseData.ID_MessageGvG = await initial_msgreactgvg(houseData.Langage, houseData.ID_Chan_GvG, houseData.ID_Group_Users);
  } else {
    const db_houseData = await get_houseData(interaction.guildId);
    if (db_houseData.ID_Chan_GvG != houseData.ID_Chan_GvG) {
      houseData.ID_MessageGvG = await initial_msgreactgvg(houseData.Langage, houseData.ID_Chan_GvG, houseData.ID_Group_Users);
    } else {
      houseData.ID_MessageGvG = db_houseData.ID_Chan_GvG;
    }
  }

  if (houseData.ID_MessageGvG == 0) {
    return;
  } else if (houseData.ID_MessageGvG == -1) {
    const translate = await loadTranslations("global");
    await interaction.editReply({
      content: `<@${userId}>\n${translate.noperm} <#${houseData.ID_Chan_GvG}>`,
      components: [],
    });

    logToFile(`${translate.noperm} (channel ${houseData.ID_Chan_GvG})`);
    return;
  }

  // Mise à jour du cache
  interactionsCache.set(userId, houseData);

  // Création de la maison dans la db
  await config_house_db(houseData, exist_id_house);

  // Ajout des utilisateurs des groupes selectionné à la db
  await createUserOneDiscord(houseData.ID_Server);

  const translate = await loadTranslations(houseData.Langage);

  // Réponse à l'utilisateur
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_finish_yes")
      .setLabel("✅ " + translate.yes)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("config_finish_no")
      .setLabel("✖️ " + translate.no)
      .setStyle(ButtonStyle.Danger)
  );
  // Reponse à l'utilisateur
  await interaction.deleteReply();
  await interaction.followUp({
    content: "<@" + userId + ">\n" + translate.config.Config_finish.join("\n"),
    flags: MessageFlags.Ephemeral,
    components: [buttons],
  });
}

export async function config_finish_yes(interaction) {
  await interaction.deferUpdate();

  const userId = interaction.user.id;
  // Message de présentation au utilisateurs
  const houseData = interactionsCache.get(userId);
  const translate = await loadTranslations(houseData.Langage);
  msgChanDiscord(houseData.ID_Group_Users, houseData.ID_Chan_Users, translate.config.Welcome_msg.join("\n"));

  // Supression des bouttons
  await interaction.deleteReply();
  await interaction.followUp({
    content: "<@" + userId + ">\n" + translate.config.finish,
    flags: MessageFlags.Ephemeral,
  });
  // Suppression du cache utilisateur
  interactionsCache.delete(userId);
}

export async function config_finish_no(interaction) {
  await interaction.deferUpdate();

  const userId = interaction.user.id;
  const houseData = interactionsCache.get(userId);
  const translate = await loadTranslations(houseData.Langage);
  // Supression des bouttons
  await interaction.deleteReply();
  await interaction.followUp({
    content: "<@" + userId + ">\n" + translate.config.finish,
    flags: MessageFlags.Ephemeral,
  });
  // Suppression du cache utilisateur
  interactionsCache.delete(userId);
}

// -------------------------------------------------------------------
// ------------------------ Fonction commune -------------------------
// -------------------------------------------------------------------

// Affiche un menu de selection avec la liste des channels
export async function list_discord_channels(interaction, custom_content, custom_name) {
  await interaction.deferUpdate();

  const options = interaction.guild.channels.cache
    .filter(
      (channel) => channel.type === 0 // salons textuels uniquement
    )
    .map((channel) => ({
      label: channel.name,
      value: channel.id,
    }));

  const selectMenu = new StringSelectMenuBuilder().setCustomId(custom_name).setPlaceholder("Select channel").addOptions(options);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.deleteReply();
  await interaction.followUp({
    content: "<@" + interaction.user.id + ">\n" + custom_content,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

// Affiche un menu de selection avec la liste des roles discord
export async function list_discord_roles(interaction, custom_content, custom_role) {
  await interaction.deferUpdate();

  const options = interaction.guild.roles.cache
    .filter((role) => !role.managed) // Exclut les rôles des bots et des intégrations (gérés automatiquement)
    .map((role) => ({
      label: role.name,
      value: role.id,
    }));

  const selectMenu = new StringSelectMenuBuilder().setCustomId(custom_role).setPlaceholder("Discord role").addOptions(options);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.deleteReply();
  await interaction.followUp({
    content: "<@" + interaction.user.id + ">\n" + custom_content,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

// -------------------------------------------------------------------
// ---------------- Insertion Maison dans la database ----------------
// -------------------------------------------------------------------

async function config_house_db(houseData, exist_id_house) {
  // Ouvrir la base de données (par defaut en mode lecture/écriture)
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    if (exist_id_house == 0) {
      // Création de maison dans la table Houses
      const insertQuery_Houses = `INSERT INTO Houses 
        (House_name, House_logo, Langage, ID_Server, ID_Group_Users, ID_Group_Officier, ID_Chan_GvG, ID_Chan_Gestion, ID_Chan_Users, ID_MessageGvG) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const result_house = await db.run(insertQuery_Houses, [
        houseData.House_name,
        houseData.House_logo,
        houseData.Langage,
        houseData.ID_Server,
        houseData.ID_Group_Users,
        houseData.ID_Group_Officier,
        houseData.ID_Chan_GvG,
        houseData.ID_Chan_Gestion,
        houseData.ID_Chan_Users,
        houseData.ID_MessageGvG,
      ]);

      const insertedID = result_house.lastID; // Récupére l'ID de la ligne insérée

      // Création des tables
      await createCaserneTable(insertedID, db);
      await createGroupsTable(insertedID, db);
      logToFile(`Création de la maison ${houseData.House_name} (${houseData.ID_Server})`);
    } else {
      // Mise a jour des information de la maison
      const updateQuery_house = `UPDATE Houses SET
                                    House_name = ?, 
                                    House_logo = ?, 
                                    Langage = ?, 
                                    ID_Group_Users = ?, 
                                    ID_Group_Officier = ?, 
                                    ID_Chan_GvG = ?, 
                                    ID_Chan_Gestion = ?, 
                                    ID_Chan_Users = ?, 
                                    ID_MessageGvG = ?
                                  WHERE ID = ?;`;
      await db.run(updateQuery_house, [
        houseData.House_name,
        houseData.House_logo,
        houseData.Langage,
        houseData.ID_Group_Users,
        houseData.ID_Group_Officier,
        houseData.ID_Chan_GvG,
        houseData.ID_Chan_Gestion,
        houseData.ID_Chan_Users,
        houseData.ID_MessageGvG,
        exist_id_house,
      ]);
    }
  } finally {
    await db.close();
  }
}

async function createCaserneTable(insertedID, db) {
  try {
    // Récupérer la liste des unités depuis ListUnit
    const units = await db.all("SELECT ID FROM ListUnit");

    if (units.length === 0) {
      throw new Error("Aucune unité trouvée dans ListUnit.");
    }

    // Construction dynamique des colonnes des tables Caserne
    let columns = units.map((unit) => `Unit${unit.ID} INTEGER DEFAULT 0`).join(",\n    ");

    // Création de la table Caserne
    const createTableQuery_caserne_unit = `
      CREATE TABLE IF NOT EXISTS Caserne${insertedID} (
        ID INTEGER PRIMARY KEY,
        User_ID INTEGER NOT NULL,
        ${columns},
        FOREIGN KEY (User_ID) REFERENCES Users (ID)
      );
    `;

    // Création de la table CaserneMaitrise
    const createTableQuery_caserne_maitrise = `
    CREATE TABLE IF NOT EXISTS CaserneMaitrise${insertedID} (
      ID INTEGER PRIMARY KEY,
      User_ID INTEGER NOT NULL,
      ${columns},
      FOREIGN KEY (User_ID) REFERENCES Users (ID)
    );
  `;

    // Vérifier si la table existe déjà
    const tableExists = await db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='Caserne${insertedID}';
      `);

    if (!tableExists) {
      await db.run("BEGIN TRANSACTION;");
      try {
        await db.run(createTableQuery_caserne_unit);
        await db.run(createTableQuery_caserne_maitrise);

        // Ajouter un index pour accélérer les requêtes
        await db.run(`CREATE INDEX IF NOT EXISTS idx_caserne_${insertedID}_user ON Caserne${insertedID} (User_ID);`);
        await db.run("COMMIT;");
      } catch (err) {
        await db.run("ROLLBACK;");
        logToFile(`Erreur lors de la création de Caserne${insertedID} :\n${err.message}`, "errors_bot.log");
        throw err;
      }
    }
  } catch (err) {
    logToFile(`Erreur lors de la création des Casernes ${insertedID} :\n${err.message}`, "errors_bot.log");
    throw err;
  }
}

async function createGroupsTable(insertedID, db) {
  try {
    // Création des tables de la maison
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS GroupGvG${insertedID} (
        ID INTEGER PRIMARY KEY,
        User_ID INTEGER NOT NULL,
        GroupNumber INTEGER NOT NULL,
        Unit1 VARCHAR(50) DEFAULT "",
        Unit2 VARCHAR(50) DEFAULT "",
        Unit3 VARCHAR(50) DEFAULT "",
        Unit4 VARCHAR(50) DEFAULT "",
        FOREIGN KEY (User_ID) REFERENCES Users (ID)
      );`,
      `CREATE TABLE IF NOT EXISTS GroupTypeAtt${insertedID} (
        ID INTEGER PRIMARY KEY,
        User_ID INTEGER NOT NULL,
        GroupNumber INTEGER NOT NULL,
        Unit1 VARCHAR(50) DEFAULT "",
        Unit2 VARCHAR(50) DEFAULT "",
        Unit3 VARCHAR(50) DEFAULT "",
        Unit4 VARCHAR(50) DEFAULT "",
        FOREIGN KEY (User_ID) REFERENCES Users (ID)
      );`,
      `CREATE TABLE IF NOT EXISTS GroupTypeDef${insertedID} (
        ID INTEGER PRIMARY KEY,
        User_ID INTEGER NOT NULL,
        GroupNumber INTEGER NOT NULL,
        Unit1 VARCHAR(50) DEFAULT "",
        Unit2 VARCHAR(50) DEFAULT "",
        Unit3 VARCHAR(50) DEFAULT "",
        Unit4 VARCHAR(50) DEFAULT "",
        FOREIGN KEY (User_ID) REFERENCES Users (ID)
      );`,
      `CREATE TABLE IF NOT EXISTS NameGroupGvG${insertedID} (
        ID INTEGER PRIMARY KEY,
        GroupNumber INTEGER NOT NULL,
        NameGroup VARCHAR(150) NOT NULL
      );`,
    ];

    for (const query of tableQueries) {
      await db.run(query);
    }
  } catch (err) {
    logToFile(`Erreur lors de la création des tables group GvG pour la maison ${insertedID} :\n${err.message}`, "errors_bot.log");
    throw err;
  }
}

// houseData :  {
//     ID: 1
//     House_name: 'Nom Maison',
//     House_logo: 'https://cdn.discordapp.com/icons/674215425546125323/b56b1f27a7c977693bfde3aa9f2d0599.webp',
//     Langage: 'fr',
//     ID_Server: '674215425546125323',
//     ID_Group_Users: '1223899873196113991',
//     ID_Group_Officier: '1223899873196113991',
//     ID_Chan_GvG: '1111983569900929024',
//     ID_Chan_Gestion: '674275684364845057',
//     ID_Chan_Users: '674275684364845057',
//     Allumage: 0
//     ID_MessageGvG: '1342862281611939850'
//   }

export async function get_houseData(ID_Server) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const selectQuery = `
      SELECT ID, House_name, House_logo, Langage, ID_Server, ID_Group_Users, 
            ID_Group_Officier, ID_Chan_GvG, ID_Chan_Gestion, ID_Chan_Users, Allumage, ID_MessageGvG 
      FROM Houses 
      WHERE ID_Server = ?;
    `;

    const houseData = await db.get(selectQuery, [ID_Server]);
    await db.close();
    return houseData || null; // Retourne null si aucune maison trouvée
  } catch (err) {
    logToFile(`Erreur lors de la récupération des données dans get_house_by_server_id :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  }
}

export async function get_ID_House(ID_Server) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const selectQuery = `SELECT ID FROM Houses WHERE ID_Server = ?;`;
    const ID_House = await db.get(selectQuery, [ID_Server]);
    await db.close();
    return ID_House?.ID || 0; // Retourne 0 si aucune maison trouvée
  } catch (err) {
    logToFile(`Erreur lors de la récupération des données dans get_house_by_server_id :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  }
}

export async function list_ID_house() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const selectQuery = `SELECT ID_Server FROM Houses;`;
    const rows = await db.all(selectQuery);
    await db.close();
    return rows.map((row) => row.ID_Server);
  } catch (err) {
    logToFile(`Erreur lors de la récupération des ID_Houses (list_ID_house) :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  }
}

export async function deleteHouse(ID_Server) {
  const houseData = await get_houseData(ID_Server);

  if (!houseData) {
    return;
  }

  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    // Suppression des tables de la maison si elles existent
    const dropQueries = [
      `DROP TABLE IF EXISTS Caserne${houseData.ID};`,
      `DROP TABLE IF EXISTS CaserneMaitrise${houseData.ID};`,
      `DROP TABLE IF EXISTS GroupGvG${houseData.ID};`,
      `DROP TABLE IF EXISTS GroupTypeAtt${houseData.ID};`,
      `DROP TABLE IF EXISTS GroupTypeDef${houseData.ID};`,
      `DROP TABLE IF EXISTS NameGroupGvG${houseData.ID};`,
    ];

    for (const query of dropQueries) {
      await db.run(query);
    }

    // Suppression des utilisateurs et de la maison
    await db.run(`DELETE FROM Users WHERE ID_House = ?;`, [houseData.ID]);
    await db.run(`DELETE FROM Houses WHERE ID_Server = ?;`, [ID_Server]);

    logToFile(`Suppression des données pour la maison ${houseData.House_name} (${houseData.ID_Server}).`);
  } catch (err) {
    logToFile(`Erreur lors de la suppression de la House : ${houseData.House_name} (${houseData.ID_Server}).\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

export async function houseExist(ID_Server) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const selectQuery = `SELECT ID FROM Houses WHERE ID_Server = ?;`;
    const result = await db.get(selectQuery, [ID_Server]);
    await db.close();
    return result ? true : false; // Retourne true si une maison existe, sinon false
  } catch (err) {
    logToFile(`Erreur lors de la vérification de l'existence de la House :\n${err.message}`, "errors_bot.log");
    await db.close();
    return false; // En cas d'erreur, c'est que la maison n'existe pas
  }
}
