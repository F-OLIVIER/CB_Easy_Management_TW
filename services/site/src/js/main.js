import { cookieName, versionJS } from "./config.js";
async function loadModule(name) {
    return await import(`./${name}${versionJS}`);
}
const { administration } = await loadModule("administration.js");
const { characterCard } = await loadModule("characterCard.js");
const { consulcaserne } = await loadModule("consulcaserne.js");
const { creategroup } = await loadModule("creategroup.js");
const { description } = await loadModule("description.js");
const { settingbot } = await loadModule("settingbot.js");
const { mention } = await loadModule("mentionlegale.js");
const { viewgroup } = await loadModule("viewGroup.js");
const { caserne } = await loadModule("caserne.js");
const { accueil } = await loadModule("accueil.js");
const { forum } = await loadModule("forum.js");
const { stat } = await loadModule("stat.js");
const { home } = await loadModule("home.js");

let path = window.location.pathname;
switch (path) {
  case "/":
    // Accueil
    if (document.cookie.split(";").some((item) => item.trim().startsWith(cookieName + "="))) {
      window.location.href = "/home";
    } else {
      accueil({});
    }
    break;

  case "/mentionlegale":
    mention();
    break;

  case "/description":
    description();
    break;

  case "/discord":
    // page géré de façon externe
    break;

  case "/home":
    // Home connected
    home();
    break;

  case "/caserne":
    caserne();
    break;

  case "/creategroup":
    creategroup("creategroup");
    break;
  case "/chargergrouptypeatt":
    creategroup("chargergrouptypeatt");
    break;
  case "/chargergrouptypedef":
    creategroup("chargergrouptypedef");
    break;

  case "/viewGroup":
    viewgroup();
    break;

  case "/characterCard":
    characterCard();
    break;

  case "/AppAdmin":
    administration();
    break;

  case "/stat":
    stat();
    break;

  case "/consulcaserne":
    consulcaserne();
    break;

  case "/settingbot":
    settingbot();
    break;

  case "/Appforum":
    forum();
    break;

  default:
    window.location.href = "/";
    break;
}
