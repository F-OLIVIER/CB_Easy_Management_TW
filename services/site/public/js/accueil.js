import { communBlock_notconnected, createHTMLElement, lang_select } from "./useful.js";
import { translate } from "./translate.js";

export function accueil() {
  const language = localStorage.getItem("selectedLang") || "en";
  document.getElementById("lang-select").value = language;

  communBlock_notconnected();
  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let containerAccueil = createHTMLElement("div", "containerAccueil");

  // Zone du logo
  let zone = createHTMLElement("div", "zone");

  // Texte entete
  let text = createHTMLElement("p", "text");
  text.innerHTML = translate[language].accueil.description;
  zone.appendChild(text);

  let listbutton = createHTMLElement("div", "listbuttonaccueil");

  // Lien page /description pour l'explication
  let buttondescription = document.createElement("a");
  buttondescription.id = "buttondescription";
  buttondescription.classList = "no-style-link ";
  buttondescription.href = "/description";
  buttondescription.textContent = translate[language].accueil.explain;
  listbutton.appendChild(buttondescription);

  // Lien d'invitation du bot discord
  let buttoninvitebot = document.createElement("a");
  buttoninvitebot.id = "buttoninvitebot";
  buttoninvitebot.classList = "no-style-link ";
  buttoninvitebot.href = "";

  let imginvitebot = document.createElement("img");
  imginvitebot.src = "img/Logo_Discord.webp";
  buttoninvitebot.appendChild(imginvitebot);
  let textinvitebot = document.createElement("span");
  textinvitebot.textContent = translate[language].accueil.adddiscord;
  buttoninvitebot.appendChild(textinvitebot);
  listbutton.appendChild(buttoninvitebot);

  zone.appendChild(listbutton);
  containerAccueil.appendChild(zone);
  Container.appendChild(containerAccueil);

  lang_select("/");
}
