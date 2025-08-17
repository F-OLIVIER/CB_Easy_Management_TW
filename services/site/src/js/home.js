import { loadModule } from "./config.js";
const { communBlock, createHTMLElement, fetchServer, fetchlogout } = await loadModule("useful.js");
const { loadTranslate } = await loadModule("translate.js");

export async function home() {
  const currenthouse = localStorage.getItem("user_house");
  const data = await fetchServer("home/?house=" + currenthouse);
  if (data.Gestion.Logged) {
    // set du language
    let language = localStorage.getItem("selectedLang") || "en";
    if (data.UserInfo.Language) {
      language = data.UserInfo.Language;
    }
    const translate = await loadTranslate(language);
    containerhome(data, translate);
  } else {
    fetchlogout();
  }
}

function containerhome(data, translate) {
  communBlock(data);

  // House data dans le stockage
  if (data.House.length == 1) {
    localStorage.setItem("user_house", data.House[0].Discord);
  }
  const house_selected = localStorage.getItem("user_house");

  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let containerhouses = createHTMLElement("div", "containerhouses");

  // Liste des maisons du joueurs
  let titlehouses = document.createElement("h1");
  if (data.House.length == 1) {
    titlehouses.textContent = translate.home.houses.one;
  } else {
    titlehouses.textContent = translate.home.houses.two;
  }
  containerhouses.appendChild(titlehouses);

  let listhouse = createHTMLElement("div", "listhouse");

  for (let index = 0; index < data.House.length; index++) {
    const current_house = data.House[index];
    let house = createHTMLElement("div", "house");

    // Image house
    let imghouse = document.createElement("img");
    imghouse.src = current_house.House_logo;
    house.appendChild(imghouse);

    // Zone textuel
    let zonetexthouse = createHTMLElement("div", "zonetexthouse");
    // Name house
    let namehouse = document.createElement("h2");
    namehouse.textContent = current_house.House_name;
    zonetexthouse.appendChild(namehouse);

    // Bouton de selection
    if (data.House.length > 1 && house_selected !== current_house.Discord) {
      let buttonselecthouse = createHTMLElement("button", "buttonselecthouse");
      buttonselecthouse.textContent = translate.home.houses.button;
      zonetexthouse.appendChild(buttonselecthouse);

      // Ajout de l'event listener
      buttonselecthouse.addEventListener("click", async () => {
        localStorage.setItem("user_house", current_house.Discord);
        home();
      });
    }

    house.appendChild(zonetexthouse);
    listhouse.appendChild(house);
    containerhouses.appendChild(listhouse);
  }
  Container.appendChild(containerhouses);

  if (data.House.length > 0 && house_selected !== null) {
    listLink(Container, data, translate);
  }
}

function listLink(Container, data, translate) {
  if (document.getElementById("subContainer")) {
    document.getElementById("subContainer").remove();
  }

  let subContainer = createHTMLElement("div", "subContainer");
  let subcontainerUser = createHTMLElement("div", "subcontainerUser");

  // page characterCard
  let divcharacterCard = createHTMLElement("div", "divcharacterCard");
  // Button fiche personnage
  let buttoncharacterCard = createHTMLElement("div", "buttoncharacterCard");
  buttoncharacterCard.textContent = translate.home.characterChard;
  // Lien
  let linkCharacterCard = createHTMLElement("a", "no-style-link");
  linkCharacterCard.classList.add("linkCharacterCard");
  linkCharacterCard.href = "/characterCard";
  buttoncharacterCard.appendChild(linkCharacterCard);
  divcharacterCard.appendChild(buttoncharacterCard);
  subcontainerUser.appendChild(divcharacterCard);

  // page caserne
  let divcaserne = createHTMLElement("div", "divcaserne");
  // Button caserne
  let buttonCaserne = createHTMLElement("div", "buttonCaserne");
  buttonCaserne.textContent = translate.home.caserne;
  // Lien
  let linkCaserne = createHTMLElement("a", "no-style-link");
  linkCaserne.classList.add("linkCaserne");
  linkCaserne.href = "/caserne";
  buttonCaserne.appendChild(linkCaserne);
  divcaserne.appendChild(buttonCaserne);
  subcontainerUser.appendChild(divcaserne);

  subContainer.appendChild(subcontainerUser);

  if (data.Gestion.Officier) {
    // si officier, affichage bouton création des groupes et bouton administration
    let subcontainerOfficier = createHTMLElement("div", "subcontainerOfficier");
    let titlesubcontainerOfficier = createHTMLElement("div", "titlesubcontainerOfficier");
    titlesubcontainerOfficier.textContent = translate.home.zone_gestion;
    subcontainerOfficier.appendChild(titlesubcontainerOfficier);

    // page création des groupes gvg
    let linkCreateGroup = createHTMLElement("a", "no-style-link");
    linkCreateGroup.href = "/creategroup";
    let buttonCreateGroup = createHTMLElement("div", "buttonCreateGroup");
    buttonCreateGroup.href = "/creategroup";
    buttonCreateGroup.textContent = translate.home.groupGvG;
    linkCreateGroup.appendChild(buttonCreateGroup);
    subcontainerOfficier.appendChild(linkCreateGroup);

    // page des statistiques
    let linkStat = createHTMLElement("a", "no-style-link");
    linkStat.href = "/stat";
    let buttonStat = createHTMLElement("div", "buttonStat");
    buttonStat.textContent = translate.home.stat;
    linkStat.appendChild(buttonStat);
    subcontainerOfficier.appendChild(linkStat);

    // page de consultation d'une caserne
    let linkconsulcaserne = createHTMLElement("a", "no-style-link");
    linkconsulcaserne.href = "/consulcaserne";
    let buttonconsulcaserne = createHTMLElement("div", "buttonconsulcaserne");
    buttonconsulcaserne.textContent = translate.home.caserne_other;
    linkconsulcaserne.appendChild(buttonconsulcaserne);
    subcontainerOfficier.appendChild(linkconsulcaserne);

    // page de paramétrage du bot
    let linksettingbot = createHTMLElement("a", "no-style-link");
    linksettingbot.href = "/settingbot";
    let buttonsettingbot = createHTMLElement("div", "buttonsettingbot");
    buttonsettingbot.textContent = translate.home.settingbot;
    linksettingbot.appendChild(buttonsettingbot);
    subcontainerOfficier.appendChild(linksettingbot);

    subContainer.appendChild(subcontainerOfficier);
  }

  // Forum
  let subcontainerForum = createHTMLElement("div", "subcontainerForum");
  let titlesubcontainerForum = createHTMLElement("div", "titlesubcontainerForum");
  titlesubcontainerForum.textContent = translate.home.commun_zone;
  subcontainerForum.appendChild(titlesubcontainerForum);

  // page d'Forumistration
  let linkAppForum = createHTMLElement("a", "no-style-link");
  linkAppForum.href = "/Appforum";
  let buttonAppForum = createHTMLElement("div", "buttonAppForum");
  buttonAppForum.href = "/Appforum";
  buttonAppForum.textContent = translate.home.forum;
  linkAppForum.appendChild(buttonAppForum);

  subcontainerForum.appendChild(linkAppForum);
  subContainer.appendChild(subcontainerForum);

  // Espace Admin
  if (data.Gestion.Admin) {
    let subcontainerAdmin = createHTMLElement("div", "subcontainerAdmin");
    let titlesubcontainerAdmin = createHTMLElement("div", "titlesubcontainerAdmin");
    titlesubcontainerAdmin.textContent = translate.home.zone_admin;
    subcontainerAdmin.appendChild(titlesubcontainerAdmin);

    // page d'administration
    let linkAppAdmin = createHTMLElement("a", "no-style-link");
    linkAppAdmin.href = "/AppAdmin";
    let buttonAppAdmin = createHTMLElement("div", "buttonAppAdmin");
    buttonAppAdmin.href = "/AppAdmin";
    buttonAppAdmin.textContent = translate.home.admin;
    linkAppAdmin.appendChild(buttonAppAdmin);

    subcontainerAdmin.appendChild(linkAppAdmin);
    subContainer.appendChild(subcontainerAdmin);
  }

  Container.appendChild(subContainer);
}
