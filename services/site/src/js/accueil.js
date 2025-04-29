import { communBlock_notconnected, createHTMLElement, lang_select } from "./useful.js";
import { loadTranslate } from "./translate.js";
import { showNotification } from "./notification.js";
import { LINK_INVITE_BOT } from "./config.js";

export async function accueil() {
  const language = localStorage.getItem("selectedLang") || "en";
  document.getElementById("lang-select").value = language;

  const translate = await loadTranslate(language);

  communBlock_notconnected(translate);
  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let containerAccueil = createHTMLElement("div", "containerAccueil");

  // Zone du logo
  let zone = createHTMLElement("div", "zone");

  // Texte entete
  let text = createHTMLElement("p", "text");
  text.innerHTML = translate.accueil.description;
  zone.appendChild(text);

  let listbutton = createHTMLElement("div", "listbuttonaccueil");

  // Lien page /description pour l'explication
  let buttondescription = document.createElement("a");
  buttondescription.id = "buttondescription";
  buttondescription.classList = "no-style-link ";
  buttondescription.href = "/description";
  buttondescription.textContent = translate.accueil.explain;
  listbutton.appendChild(buttondescription);

  // Lien d'invitation du bot discord
  let buttoninvitebot = document.createElement("a");
  buttoninvitebot.id = "buttoninvitebot";
  buttoninvitebot.classList = "no-style-link ";
  buttoninvitebot.target = "_blank"
  buttoninvitebot.href = LINK_INVITE_BOT;

  let imginvitebot = document.createElement("img");
  imginvitebot.src = "img/Logo_Discord.webp";
  buttoninvitebot.appendChild(imginvitebot);
  let textinvitebot = document.createElement("span");
  textinvitebot.textContent = translate.accueil.adddiscord;
  buttoninvitebot.appendChild(textinvitebot);
  listbutton.appendChild(buttoninvitebot);

  zone.appendChild(listbutton);
  containerAccueil.appendChild(zone);
  Container.appendChild(containerAccueil);

  const storedNotif = localStorage.getItem("notif");
  if (storedNotif) {
    const parsedNotif = JSON.parse(storedNotif);
    if (parsedNotif && parsedNotif.Notif) {
      const language = localStorage.getItem("selectedLang") || "en";
      showNotification(parsedNotif.content[language], parsedNotif.Type);
      localStorage.removeItem("notif");
    }
  }

  lang_select();

  // #############################################################
  // ###################### Badge beta Test ######################
  // #############################################################
  // const betaBadge = document.createElement("div");
  // betaBadge.id = "beta-badge";
  // betaBadge.textContent = "BETA TEST";

  // // Div d'information
  // const infoBox = document.createElement("div");
  // infoBox.id = "infoBox";
  // infoBox.style.opacity = "0"; // Caché par défaut
  // infoBox.style.transition = "opacity 0.5s ease-out";
  // if (language == "fr") {
  //   infoBox.innerHTML =
  //     "Jusqu'au 30 avril 2025, ce système est en phase de test.</br>Cela implique des bugs, suppression possible de la base de données ou autres instabilités.</br></br>Si vous souhaitez nous aider, n'hésitez pas à nous remonter des informations (bug ou amélioration possible).";
  // } else {
  //   infoBox.innerHTML =
  //     "Until 30 April 2025, this system is in a test phase.</br>This may involve bugs, possible deletion of the database or other instabilities.</br></br>If you would like to help us, please do not hesitate to send us information (bug or possible improvement).";
  // }
  // Container.appendChild(betaBadge);
  // Container.appendChild(infoBox);

  // // Afficher au survol
  // betaBadge.addEventListener("mouseenter", () => {
  //   infoBox.style.opacity = "1"; // Rendre visible avec une transition
  // });

  // // Cacher quand la souris quitte
  // betaBadge.addEventListener("mouseleave", () => {
  //   infoBox.style.opacity = "0"; // Rendre invisible
  // });
}
