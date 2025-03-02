export const translate = {
  // Liste des langues prisent en charge
  list_language: {
    en: {
      id: "en",
      name: "English",
    },
    fr: {
      id: "fr",
      name: "Français",
    },
  },

  // ███████ ███    ██  ██████  ██      ██ ███████ ██   ██
  // ██      ████   ██ ██       ██      ██ ██      ██   ██
  // █████   ██ ██  ██ ██   ███ ██      ██ ███████ ███████
  // ██      ██  ██ ██ ██    ██ ██      ██      ██ ██   ██
  // ███████ ██   ████  ██████  ███████ ██ ███████ ██   ██
  en: {
    commun: {
      disconnected: "Disconnecting",
      no_unit: "Unit not unlocked",
      listoption_maitrise: [
        ["0", "Mastery not started", "red"],
        ["1", "Mastery in progress", "orange"],
        ["2", "Complete mastery", "green"],
      ],
    },

    descriptionSections: [
      {
        title: "Discord Bot",
        commands: [
          [
            "/config",
            `<span>Used to configure the bot for your server</span>
<span>• If the bot has never been configured: all users can use this command</span>
<span>• If the bot has an existing setting for the server, only members of the management group or the owner of the Discord server can change the setting</span>`,
          ],
          ["/visite", "The commands are explained by the bot"],
          ["/site", "Displays the link to the website associated with the bot"],
          ["/guide", "Displays help information about Conqueror's Blade"],
          ["/data", "Displays user information"],
          ["/class", "Update the weapon played with by your hero"],
          ["/level", "Update your hero's level"],
          ["/influence", "Update your hero's influence"],
          ["/smarthone", "Generates a connection token for the mobile application"],
          ["/reset_msg_gvg", "Manual reset of GvG registration reaction message (manager only)"],
          ["/bot_activation", "Activate or deactivate the GvG registration message (manager only)"],
        ],
        images: ["img/description/bot/slashcommand.png", "img/description/bot/message_gvg_on.png", "img/description/bot/message_gvg_off.png", "img/description/bot/commanddata.png"],
      },
      {
        title: "List of parameter Discord Bot need (command /config)",
        commands: [
          ["House name", `House name`],
          ["Language", "Language in which the Discord bot will send messages on Discord"],
          ["GvG registration message channel", "Chan Discord where users will register (message with reaction buttons)."],
          ["User channel", "Chan Discord or information messages to the bot user will be displayed (new unit added, etc.)."],
          ["User manager", "Chan Discord or administration information messages will be displayed (user leaves Discord and is deleted from the database)."],
          ["User group", "Group who will have access to the website to fill in their details (barrack, lvl, etc.)."],
          ["User manager", "Group who will have access to the Discord bot administration."],
        ],
      },
      {
        title: "Website",
        commands: [
          ["Private (user connected)", "<span>Home (dashboard)</span><span>Character card</span><span>Barracks"],
          ["Private (manager group)", "<span>Creating groups</span><span>Statistics</span><span>Managing user barracks</span>"],
        ],
        images: [
          "img/description/site/dashboard1.png",
          "img/description/site/dashboard2.png",
          "img/description/site/charactercard.png",
          "img/description/site/caserne.png",
          "img/description/site/groupgvg1.png",
        ],
      },
      {
        title: "Mobile Application",
        commands: [["Private (user connected)", "<span>Login page</span><span>GvG registration page</span><span>Character card</span><span>Barracks</span>"]],
        images: ["img/description/smartphone/flutter_01.png", "img/description/smartphone/flutter_02.png", "img/description/smartphone/flutter_03.png", "img/description/smartphone/flutter_04.png"],
      },
    ],

    accueil: {
      description: `What is Easy Management GvG?</br>
It's a territory war management system for the Conqueror's Blade game.</br>
This system is made up of 3 interconnected applications:</br>
un bot Discord, ce site internet et une application mobile.`,
      explain: "Description",
      adddiscord: "Add to Discord",
    },

    home: {
      houses: {
        1: "My house",
        2: "My houses",
        button: "Select",
      },
      characterChard: "My character card",
      caserne: "My barrack",
      zone_gestion: "Managers only",
      groupGvG: "Create GvG groups",
      stat: "Statistics",
      caserne_other: "Consult a barracks",
      zone_admin: "Administrators only",
      admin: "Administration page",
    },

    characterCard: {
      info_user: {
        title: "My hero's details",
        classe: {
          new: "Choose",
          get: "Current class",
          set: "Changing class",
        },
        level: {
          nodata: "Level never entered",
          new: "New level",
          get: "Current level",
          set: "Changing level",
        },
        influence: {
          new: "New influence",
          get: "Current influence",
          set: "Changing influence",
        },
        button: "Update my character",
      },

      info_GvG: {
        title: "GvG information",
        inscripted: {
          nodata: "⁉️ You are not registered for the next GvG",
          present: "✅ Present from next GvG",
          absent: "❌ Absent from next GvG",
        },
        button: {
          present: "Register me present",
          absent: "Register me absent",
        },
        nbGvG: "Number of gvg participating",
        lastGvG: {
          nodata: "Never participated",
          description: "Last gvg participated",
        },
        noinscription: "No registration for GvGs at the moment",
      },

      error: {
        err_select: "All the update fields of your hero are empty !!!",
        err_lvl: "This level is not possible, please correct the value.",
        err_influ: "This influence is impossible, please correct the value.",
      },
    },

    caserne: {
      consulcaserne: "Select the barrack of the player you wish to see",
      select: "Select",
      buttonconsul: "Updating the barrack",
      avertissement: 'Remember to save your fire station by clicking on the "Updating my barrack" button at the bottom of the page.',
      infantry: "Infantry",
      distant: "Distant",
      cavalry: "Cavalry",
      button: "Updating my barrack",
      consulcaserne: "Select the barracks of the player you wish to see",
    },

    stat: {
      filter: {
        title: "Filter by :",
        name: "Username",
        class: "Class played",
        influ: "Influence",
        lvl: "Level",
        nbGvG: "GvG number",
        lastGvG: "Latest GvG",
      },

      title: {
        name: "Username",
        class: "Class played",
        influ: "Influence",
        lvl: "Level",
        nbGvG: "GvG participated/total",
        lastGvG: "Last GvG participated",
      },
    },

    create_group: {
      legend: {
        title: "Legend :",
        username : "username",
        influ: "influence <br> units / player",
        unit1: "unit 1",
        unit2: "unit 2",
        unit3: "unit 3",
        unit4: "unit 4",
        namegroup: "Group name",
      },
      select: "Select",
      list_users: {
        title: "》 List of registered users",
        listLegendplaced: ["✅ Player in a group", "❌ Player NOT in a group"],
        username: "username",
        influ: "player influence",
        class: "weapons class",
      },
      who_have_unit: {
        title: "》 Who's registered for the unit ?",
        who: "Choose a unit to see the list of players who have this unit",
        no_player: "No players have this unit",
      },
      create_group: {
        title: "》 Creating GvG groups",
        listLegend: ["🔴 Unit not mastered", "🟡 Unit being mastered", "🟢 Unit mastered"],
        add_group: "➕ Add a new group",
        save_group: "💾 Save groups",
        group_type: {
          title: "》 Groups type",
          description: `Save will overwrite the corresponding test group.</br>
                        When a sample group is loaded, unregistered players will not be displayed and the rows will remain empty.`,
          att: "Attack",
          def: "Defence",
          save: "Save the type group as a type",
          load: "Load type group",
        },
        delete: "Supprimer le joueur",
        selectmenu: {
            title: "Option de gestion",
            t5inf: "T5 - Infantry",
            t5dis: "T5 - Distant",
            t5cav: "T5 - Cavalry",
            t4inf: "T4 - Infantry",
            t4dis: "T4 - Distant",
            t4cav: "T4 - Cavalry",
            t3inf: "T3 - Infantry",
            t3dis: "T3 - Distant",
            t3cav: "T3 - Cavalry",
            delete: "Delete unit",
            other: "Consult an officer",
        },
      },
        preview: "Groups previews",
    },

    footer: {
      sections: [
        {
          title: "About us",
          content: "<p>The best system for managing your GvG<br>on Conqueror's Blade</p>",
        },
        {
          title: "Internal links",
          content: '<ul><li><a href="/">Home</a></li><li><a href="/mentionlegale">Legal information</a></li></ul>',
        },
        {
          title: "External links",
          content: '<ul><li><a href="https://www.conquerorsblade.com">Website Conqueror\'s Blade</a></li></ul>',
        },
        {
          title: "Contact",
          content: "<p>fabiendeveloppeur76@gmail.com</p>",
        },
      ],
      bottom: `<p>This site contains images and information about the game Conqueror's Blade. All rights to these elements belong to their respective owners.</br>We do not claim any rights over these contents, which are used for informational and illustrative purposes only.</p>
      <p>&copy; 2025 OLIVIER Fabien.</p>`,
    },
  },

  // ███████ ██████  ███████ ███    ██  ██████ ██   ██
  // ██      ██   ██ ██      ████   ██ ██      ██   ██
  // █████   ██████  █████   ██ ██  ██ ██      ███████
  // ██      ██   ██ ██      ██  ██ ██ ██      ██   ██
  // ██      ██   ██ ███████ ██   ████  ██████ ██   ██
  fr: {
    commun: {
      disconnected: "Se déconnecter",
      no_unit: "Unité non débloqué",
      listoption_maitrise: [
        ["0", "Maîtrise non démarré", "red"],
        ["1", "Maitrise en cours", "orange"],
        ["2", "Maitrise compléte", "green"],
      ],
    },

    descriptionSections: [
      {
        title: "Bot Discord",
        commands: [
          [
            "/config",
            `<span>Permet de configurer le bot pour votre serveur</span>
<span>• Si le bot n'a jamais été paramétré :  tous les utilisateur peuvent utiliser cet commande</span>
<span>• Si le bot a un paramétre existant pour le serveur, seul les membres du goupe de gestion ou le propriétaire du serveur Discord peuvent modifier la configuration</span>`,
          ],
          ["/visite", "Les commande sont expliqué par le bot"],
          ["/site", "Affiche le lien du site internet associé au bot"],
          ["/guide", "Affiche des informations d'aide sur Conqueror's Blade"],
          ["/data", "Affiche les informations de l'utilisateur"],
          ["/class", "Mettre à jour l'arme jouée avec votre héros"],
          ["/level", "Mettre à jour le level de votre héros"],
          ["/influence", "Mettre à jour l'influence de votre héros"],
          ["/smarthone", "Génère un token de connexion pour l'application mobile"],
          ["/reset_msg_gvg", "Reset manuel du message de réaction d'inscription GvG (gestionnaire uniquement)"],
          ["/bot_activation", "Active ou désactive le message d'inscription au GvG (gestionnaire uniquement)"],
        ],
        images: ["img/description/bot/slashcommand.png", "img/description/bot/message_gvg_on.png", "img/description/bot/message_gvg_off.png", "img/description/bot/commanddata.png"],
      },
      {
        title: "Liste des paramètres dont Discord Bot a besoin (commande /config)",
        commands: [
          ["Nom de la maison", `Nom de la maison`],
          ["Langue", "Langue dans lesquel le bot Discord enverra les messages sur Discord"],
          ["Channel du message d'inscription au GvG", "Chan Discord ou les utilisateurs vont s'inscrire (message avec les boutons de réaction)."],
          ["Channel utilisateur", "Chan Discord ou des messages d'information au utilisateur du bot s'afficheront (nouvelle unité ajoutée, etc.)."],
          ["Channel de gestion", "Chan Discord ou des messages d'information d'administration s'afficheront (utilisateur qui quitte le Discord et se retrouve supprimer de la base de données)."],
          ["Groupe utilisateur", "Groupe qui aura accès au site internet pour remplir leurs informations (caserne, lvl, etc.)."],
          ["Groupe de gestion", "Groupe qui aura accès à de l'administration du bot Discord (ils ont automatiquement les droits de Groupe utilisateur)."],
        ],
      },
      {
        title: "Site Internet",
        commands: [
          ["Privé (utilisateur connecté)", "<span>Home (tableau de bord)</span><span>Fiche personnage</span><span>Caserne"],
          ["Privé (groupe gestionnaire)", "<span>Création des groupes</span><span>Statistiques</span><span>Gestion des casernes utilisateur</span>"],
        ],
        images: [
          "img/description/site/dashboard1.png",
          "img/description/site/dashboard2.png",
          "img/description/site/charactercard.png",
          "img/description/site/caserne.png",
          "img/description/site/groupgvg1.png",
        ],
      },
      {
        title: "Application Mobile",
        commands: [["Privé (utilisateur connecté)", "<span>Page de connexion</span><span>Page d'inscription au GvG</span><span>Fiche personnage</span><span>Caserne</span>"]],
        images: ["img/description/smartphone/flutter_01.png", "img/description/smartphone/flutter_02.png", "img/description/smartphone/flutter_03.png", "img/description/smartphone/flutter_04.png"],
      },
    ],

    accueil: {
      description: `Easy Management GvG, c'est quoi ?</br>
C'est un systéme de gestion des guerres de territoire pour le jeu Conqueror's Blade</br>
Ce systéme ce compose de 3 applications interconnecté ensemble :</br>
un bot Discord, ce site internet et une application mobile.`,
      explain: "Description",
      adddiscord: "Ajouter à Discord",
    },

    home: {
      houses: {
        1: "Ma Maison",
        2: "Mes Maisons",
        button: "Selectionner",
      },
      characterChard: "Ma fiche personnage",
      caserne: "Ma caserne",
      zone_gestion: "Réservé aux gestionnaires",
      groupGvG: "Créer les groupes GvG",
      stat: "Statistique",
      caserne_other: "Consulter une caserne",
      zone_admin: "Réservé aux administrateurs",
      admin: "Page d'administration",
    },

    characterCard: {
      info_user: {
        title: "Informations de mon héros",
        classe: {
          new: "Choisissez",
          get: "Classe actuel",
          set: "Changer de classe",
        },
        level: {
          nodata: "Level jamais saisie",
          new: "Nouveau level",
          get: "Level actuel",
          set: "Changer de level",
        },
        influence: {
          new: "Nouvelle influence",
          get: "Influence actuel",
          set: "Changer l'influence",
        },
        button: "Mettre à jour mon personnage",
      },

      info_GvG: {
        title: "Informations GvG",
        inscripted: {
          nodata: "⁉️ Vous n'éte pas inscrit pour la prochaine GvG",
          present: "✅ Inscrit présent pour la prochaine GvG",
          absent: "❌ Inscrit absent pour la prochaine GvG",
        },
        button: {
          present: "M'inscrire présent",
          absent: "M'inscrire absent",
        },
        nbGvG: "Nombre de gvg participé",
        lastGvG: {
          nodata: "Jamais participé",
          description: "Derniére gvg participé",
        },
        noinscription: "Pas d'inscription pour les GvG actuellement",
      },

      error: {
        err_select: "Tous les champs de mise à jour de votre héros sont vide !!!",
        err_lvl: "Ce level est impossible, veuillez corriger la valeur.",
        err_influ: "Cet influence est impossible, veuillez corriger la valeur.",
      },
    },

    caserne: {
      consulcaserne: "Selectionner la caserne du joueur que vous souhaitez voir",
      select: "Choisissez",
      buttonconsul: "Mettre à jour la caserne",
      avertissement: 'Pensez à sauvegarder votre caserne en cliquant sur le bouton "Mettre à jour ma caserne" en bas de page',
      infantry: "Infanterie",
      distant: "Distant",
      cavalry: "Cavalerie",
      button: "Mettre à jour ma caserne",
      consulcaserne: "Selectionner la caserne du joueur que vous souhaitez voir",
    },

    stat: {
      filter: {
        title: "Filtrer par :",
        name: "Pseudo",
        class: "Classe joué",
        influ: "Influence",
        lvl: "Level",
        nbGvG: "Nb GvG",
        lastGvG: "Derniére GvG",
      },

      title: {
        name: "Pseudo",
        class: "Classe joué",
        influ: "Influence",
        lvl: "Level",
        nbGvG: "GvG participé/total",
        lastGvG: "Dernière GvG participé",
      },
    },

    create_group: {
      legend: {
        title: "Légende :",
        username : "pseudo",
        influ: "influence <br> unités / joueur",
        unit1: "unité 1",
        unit2: "unité 2",
        unit3: "unité 3",
        unit4: "unité 4",
        namegroup: "Nom du groupe",
      },
      select: "Choisissez",
      list_users: {
        title: "》 Liste des inscrits",
        listLegendplaced: ["✅ Joueur placé dans un groupe", "❌ Joueur NON placé dans un groupe"],
        username: "pseudo",
        influ: "influence joueur",
        class: "classe d'arme",
      },
      who_have_unit: {
        title: "》 Qui à l'unité parmis les inscrits ?",
        who: "Choississez une unité pour connaitre la liste des joueurs qui ont cet unité",
        no_player: "Aucun joueurs n'a cet unité",
      },
      create_group: {
        title: "》 Création des groupes GvG",
        listLegend: ["🔴 Unité non maitrisé", "🟡 Unité en cour de maitrise", "🟢 Unité maitrisé"],
        add_group: "➕ Ajouter un groupe",
        save_group: "💾 Sauvegarder les groupes",
        group_type: {
          title: "》 Groupes type",
          description: `Sauvegarder va écraser le groupe type correspondant.</br>
                        Lors du chargement d'un groupe type, les joueurs non inscrits ne seront pas affichés et les lignes resteront vides.`,
          att: "Attaque",
          def: "Défense",
          save: "Sauvegarder le groupe type en tant que type",
          load: "Charger le groupe type",
        },
        delete: "Supprimer le joueur",
        selectmenu: {
            title: "Option de gestion",
            t5inf: "T5 - Infanterie",
            t5dis: "T5 - Distant",
            t5cav: "T5 - Cavalerie",
            t4inf: "T4 - Infanterie",
            t4dis: "T4 - Distant",
            t4cav: "T4 - Cavalerie",
            t3inf: "T3 - Infanterie",
            t3dis: "T3 - Distant",
            t3cav: "T3 - Cavalerie",
            delete: "Supprimer l'unité",
            other: "Consulter un officier",
        },
      },
        preview: "Prévisualisations des groupes",
    },

    footer: {
      sections: [
        {
          title: "À propos",
          content: "<p>Le meilleur systéme pour gérer vos GvG<br>sur Conqueror's Blade</p>",
        },
        {
          title: "Liens interne",
          content: '<ul><li><a href="/">Accueil</a></li><li><a href="/mentionlegale">Mentions légales</a></li></ul>',
        },
        {
          title: "Liens externe",
          content: '<ul><li><a href="https://www.conquerorsblade.com">Site Conqueror\'s Blade</a></li></ul>',
        },
        {
          title: "Contact",
          content: "<p>fabiendeveloppeur76@gmail.com</p>",
        },
      ],
      bottom: `<p>Ce site contient des images et des informations sur le jeu Conqueror's Blade. Tous les droits relatifs à ces éléments appartiennent à leurs propriétaires respectifs.</br>Nous ne revendiquons aucun droit sur ces contenus, qui sont utilisés uniquement à des fins informatives et illustratives.</p>
      <p>&copy; 2025 OLIVIER Fabien.</p>`,
    },
  },
};
