// fichier annexe
import { siteInternet, store_app_android, store_app_ios } from "./config.js";

// WARNING : Traduction dans database.js (requete sql qui select directement en fonction de la langue)

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

  global_config: {
    // Si la configuration n'a pas encore été faite
    botNotExist: `Impossible to use this command, you haven't configured the bot yet.
Use the \`/config\` command to configure the bot.

For more information, visit the website :
${siteInternet}`,
    noPermission: "You don't have the required permissions",
    noingroup: "Sorry, you are not in one Discord groups authorised to use Easy Management GvG bot.",
    config_exist: {
      1: `The configuration of this server already exists, only members of the <@&`,
      2: `> group or the owner of the Discord can use this command.`,
    },
  },

  website: `Link to the website associated with the bot:\n${siteInternet}`,
  
  // ███████ ███    ██  ██████  ██      ██ ███████ ██   ██
  // ██      ████   ██ ██       ██      ██ ██      ██   ██
  // █████   ██ ██  ██ ██   ███ ██      ██ ███████ ███████
  // ██      ██  ██ ██ ██    ██ ██      ██      ██ ██   ██
  // ███████ ██   ████  ██████  ███████ ██ ███████ ██   ██
  en: {
    yes: "yes",
    no: "no",

    help: `Bonjour brave héros,

    Je suis **Easy Management GvG**
    Mon rôle principal est de gérer les inscriptions aux guerre de territoire (GvG) pour le jeu **Conqueror's Blade**.
    Pour **s'inscrire au GvG**, il suffit de répondre "présent" ou ""absent" sur le message dédié au GvG. Je me charge de le changer après chaque guerre de territoire.
    
    **Voici la liste des commandes utilisateur**
    * \`/level\` permet de mettre à jour le niveau de ton héros.
    * \`/influence\`, permet de mettre à jour l'influence de ton héros.
    * \`/class\` permet de mettre à jour l'arme jouer de ton héros.
    * \`/data\` permet de voir les informations te concernant.
    * \`/guide\` permet d'avoir une liste de guides et tutoriels de Conqueror's Blade.
    * \`/site\` permet d'afficher le lien du site internet associé.
    * \`/smartphone\` permet de générer un token a usage unique pour se connecter à l'application téléphone.
    
    **Voici la liste des commande réservé au gestionnaire**
    * \`/config\` permet de configurer la maison
    * \`/bot_activation\` permet d'activé (option \`on\`) ou desactivé (option \`off\`) le message d'inscription au GvG afin d'éviter des ping inutile.
    * \`/reset_msg_gvg\` permet en cas de bug du reset du message d'inscription au GvG de le faire manuellement.

    Que la gloire soit dans ton sillage !`,

    config: {
      avertissement: `We're going to go through all the information needed for the bot to work properly.
Please read the explanations on the website before continuing, as you may need to make some Discord settings.
Link to explanations on the website: `,
      ID_Chan_GvG: `**Chan Discord where users will register.**`,
      ID_Chan_Gestion: `**Chan Discord or administration information messages will be displayed.**`,
      ID_Chan_Users: `**Chan Discord or information messages to the bot user will be displayed.**`,
      ID_Group_Users: `**Group who will have access to the website to fill in their details.**`,
      ID_Group_Officier: `**Group who will have access to the Discord bot administration.**`,
      House_name: "House name",
      Config_finish: `You've completed the configuration and can now take advantage of \`CB_Easy_Management_GvG\`!

Your users can go to the website to fill in their details and you'll be able to easily create your GvG groups.

Would you like me to send them a message in the user channel to let them know?`,
      Welcome_msg: `Hello everyone,
I'm pleased to meet you.
Let me introduce myself, I'm \`Easy_Management_GvG\` and your Discord managers have put me in charge of writing your legend!

__I have 2 main missions:__
- To collect your attendance figures for upcoming GvGs (which I'll do directly on this Discord)
- To collect your IG information. For example: barracks, level, etc. (something I'll do via the website or mobile app)

For more details, to get to know me and find out what I can do for you, you can use the \`/visit\` command.`,
      finish: "Congratulations :tada:\nInteraction complete, bot operational.",
    },

    gestion: {
      resetmanuelmsggvg: "has just manually reset the GvG registration message.",
      resetmsggvg: {
        ok: "GvG registration message reset.",
        notok: "Action impossible, GvG registration message is desactivated. Use `/bot_activation` command to activate it.",
      },
      updateBotActivation: "has just changed the registration status of the GvG registration message",
      botActivation: {
        ok: "Status of the registration message has been changed",
        notok: "Action impossible, GvG registration message is already in the desired state",
      },
    },

    visite: {},
    information: {
      UserJoinGroup: {
        1: "User",
        2: "has just been added to the group",
      },
      UserLeaveDiscord: "abandonne le combat, il/elle viens de quitter le Discord.\nGrrrr, je vais encore faire plein de rature sur le registre !!!",
      UserLeaveGroupDiscord: "à été retiré des groupes Discord autorisé.",
    },

    EmbedGuide: {
      link1: "",
      link2: "",
    },

    EmbedData: {
      nodata: "",
      description_lvl: "",
      lvl: "",
      description_classe: "",
      classe: "",
      description_influence: "",
      description_inscription_GvG: "",
      present: "",
      noinscrit: "",
      absent: "",
      never: "",
      player: "",
      stat: "",
      partiped_GvG: "",
      last_GvG: "",
      nolastGvG: "",
      pourcent_GvG: "",
    },

    EmbedGvG: {
      button_present: "",
      button_absent: "",
      description: "",
      description_nogvg: "",

      date: "",
      nbpresent: "",
      nbabsent: "",
      noinscrit: "",
    },
  },

  // ███████ ██████  ███████ ███    ██  ██████ ██   ██
  // ██      ██   ██ ██      ████   ██ ██      ██   ██
  // █████   ██████  █████   ██ ██  ██ ██      ███████
  // ██      ██   ██ ██      ██  ██ ██ ██      ██   ██
  // ██      ██   ██ ███████ ██   ████  ██████ ██   ██
  fr: {
    yes: "oui",
    no: "non",

    help: `Bonjour brave héros,

Je suis **Easy Management GvG**

Mon rôle principal est de gérer les inscriptions aux guerre de territoire (GvG) pour le jeu **Conqueror's Blade**.
Pour **s'inscrire au GvG**, il suffit de répondre "présent" ou "absent" sur le message dédié au GvG. Je me charge de le changer après chaque guerre de territoire.

**Voici la liste des commandes général**
* \`/config\` permet de configurer la maison (si la maison est déja crée, c'est une commande réservé au gestionnaire)
* \`/website\` permet d'afficher le lien du site internet associé.
* \`/guide\` permet d'avoir une liste de guides et tutoriels de Conqueror's Blade.

**Voici la liste des commandes utilisateur**
* \`/data\` permet de voir les informations te concernant.
* \`/class\` permet de mettre à jour l'arme de ton héros.
* \`/level\` permet de mettre à jour le level de ton héros.
* \`/influence\` permet de mettre à jour l'influence de ton héros.
* \`/smartphone\` permet de générer un token pour se connecter à l'application téléphone.

**Voici la liste des commandes réservé au gestionnaire**
* \`/bot_activation\` permet d'activé (option \`on\`) ou desactivé (option \`off\`) le message d'inscription au GvG afin d'éviter des ping inutile.
* \`/reset_msg_gvg\` permet en cas de bug du reset du message d'inscription au GvG de le faire manuellement.

Que la gloire soit dans ton sillage !`,

    config: {
      avertissement: `Nous allons passer en revue toutes les informations nécessaires au bon fonctionnement du bot.
Merci de lire les explications sur le site internet avant de continuer, car vous avez éventuellement des paramétrages Discord à effectuer.
Lien des explications sur le site internet : `,
      ID_Chan_GvG: `**Chan Discord ou les utilisateurs vont s'inscrire.**`,
      ID_Chan_Gestion: `**Chan Discord ou des messages d'information d'administration s'afficheront.**`,
      ID_Chan_Users: `**Chan Discord ou des messages d'information au utilisateur du bot s'afficheront.**`,
      ID_Group_Users: `**Groupe qui aura accès au site internet pour remplir leurs informations.**`,
      ID_Group_Officier: `**Groupe qui aura accès à de l'administration du bot Discord.**`,
      House_name: "Nom de la maison",
      Config_finish: `Vous avez terminé la configuration, vous pouvez à présent profiter de \`CB_Easy_Management_GvG\` !

Vos utilisateurs peuvent aller sur le site internet compléter leurs informations et vous allez pouvoir facilement créer vos groupes pour les GvG.

Souhaitez-vous que j'envoie un message dans le canal utilisateur pour les prévenir ?`,
      Welcome_msg: `Bonjour à tous,
Enchanté de faire votre connaissance
Je me présente, je suis \`Easy_Management_GvG\` et vos responsables Discord mon chargé d'écrire votre légende !

__J'ai 2 missions principales :__
- Collecter vos présences pour les prochaines GvG (chose que je ferais directement sur ce Discord)
- Collecter vos informations IG. Par exemple : caserne, niveau, etc. (chose que je ferais via le site internet ou l'application mobile)

Pour plus de détail, faire connaissance avec moi et connaître les possibilités que je peux vous apporter, vous pouvez utiliser la commande \`/visit\`.`,
      finish: "Félicitations :tada:\nInteraction terminée, bot opérationnel.",
    },

    gestion: {
      resetmanuelmsggvg: "viens d'effectuer un reset manuel du message d'inscription au GvG",
      resetmsggvg: {
        ok: "Re-initialisation du message d'inscription au GvG effectué.",
        notok: "Action impossible, le message d'inscription GvG est désactivé. Utilise la commande `/bot_activation` pour l'activer.",
      },
      updateBotActivation: "viens de changer l'état des inscriptions du message d'inscription au GvG.",
      botActivation: {
        ok: "L'etat du message d'inscription a bien été changé.",
        notok: "Action impossible, le message d'inscription au GvG est déja dans l'etat souhaité.",
      },
    },

    information: {
      UserJoinGroup: {
        1: "L'utilisateur <@",
        2: "> viens d'être ajouté.",
      },
      UserLeaveDiscord: "abandonne le combat, il/elle viens de quitter le Discord.\nGrrrr, je vais encore faire plein de rature sur le registre !!!",
      UserLeaveGroupDiscord: "à été retiré des groupes Discord autorisé.",
      lvl: "Votre nouveau level de héros est",
      influ: "Votre nouvelle influence de héros est de",
      class: {
        select: "Choisissez votre arme",
        confirm: "Votre arme à bien été mis à jour",
        err: "Erreur lors de la mise à jour de votre arme",
        delay: "Delais de réponse dépassé",
      },
      smartphone: {
        err: "Vous ne faites pas partie de la maison sur le jeu Conqueror's Blade !!!",
        ok: `:information_source: Votre Token (à usage unique) vous permet de vous connecter à l'application mobile, afin de pouvoir le copier facilement, il vous est envoyé dans un autre message (ci-dessous).
        :warning: Ce Token est associé à votre compte, ne le donner à personne sous aucun prétexte.
        Lien de l'application Android (Google Play Store) :\n<${store_app_android}>
        Lien de l'application iOS (Apple Store) :\n<${store_app_ios}>`
      }
    },

    EmbedGuide: {
      link1: "",
      link2: "",
    },

    EmbedData: {
      nodata: "Aucune donnée",
      description_lvl: "Niveau de héros",
      lvl: "non defini \nutilise /level pour le definir",
      description_classe: "Classe joué en GvG",
      classe: "non defini\nutilise /classe pour le definir",
      description_influence: "Influence de votre héros (700 + armure)",
      description_inscription_GvG: "inscription GvG",
      present: "Inscrit présent",
      noinscrit: "Non inscrit",
      absent: "Inscrit absent",
      never: "Jamais inscrit",
      player: "Joueur",
      stat: "Statistique GvG",
      partiped_GvG: "GvG participé",
      last_GvG: "Derniére gvg participé",
      nolastGvG: "Jamais",
      pourcent_GvG: "Presence",
    },

    EmbedGvG: {
      button_present: "Présent",
      button_absent: "Absent",
      description: "Veuillez indiquer votre présence pour la prochaine GvG.",
      description_nogvg: "La prochaine GvG sera une GvG d'entrainement (aussi appelée drill).\nPar conséquent, les inscriptions ne sont pas demandées.",

      date: "Date de la prochaine GvG",
      nbpresent: "Présent(s)",
      nbabsent: "Absent(s)",
      noinscrit: "Aucun",
    },
  },

  //  ██████  ████████ ██   ██ ███████ ██████      ██       █████  ███    ██  ██████  ██    ██  █████   ██████  ███████
  // ██    ██    ██    ██   ██ ██      ██   ██     ██      ██   ██ ████   ██ ██       ██    ██ ██   ██ ██       ██
  // ██    ██    ██    ███████ █████   ██████      ██      ███████ ██ ██  ██ ██   ███ ██    ██ ███████ ██   ███ █████
  // ██    ██    ██    ██   ██ ██      ██   ██     ██      ██   ██ ██  ██ ██ ██    ██ ██    ██ ██   ██ ██    ██ ██
  //  ██████     ██    ██   ██ ███████ ██   ██     ███████ ██   ██ ██   ████  ██████   ██████  ██   ██  ██████  ███████
};
