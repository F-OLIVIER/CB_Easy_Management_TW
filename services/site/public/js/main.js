import { cookieName } from "./config.js";
import { administration } from "./administration.js";
import { characterCard } from "./characterCard.js";
import { consulcaserne } from "./consulcaserne.js";
import { creategroup } from "./creategroup.js";
import { viewgroup } from "./viewGroup.js";
import { caserne } from "./caserne.js";
import { home } from "./home.js";
import { stat } from "./stat.js";
import { accueil } from "./accueil.js";
import { description } from "./description.js";
import { mention } from "./mentionlegale.js";

let path = window.location.pathname;
switch (path) {
  case "/":
    // Accueil
    if (document.cookie.split(";").some((item) => item.trim().startsWith(cookieName + "="))) {
      window.location.href = "/home";
    } else {
      accueil();
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

  default:
    window.location.href = "/";
    break;
}
