import { communBlock, createHTMLElement, fetchServer, fetchlogout } from "./useful.js";
import { loadTranslate } from "./translate.js";

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

  // Liste des maisons du joueurs
  let containerhouses = createHTMLElement("div", "containerhouses");
  let titlehouses = document.createElement("h1");
  if (data.House.length == 1) {
    titlehouses.textContent = translate.home.houses[1];
  } else {
    titlehouses.textContent = translate.home.houses[2];
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
      buttonselecthouse.addEventListener("click", () => {
        localStorage.setItem("user_house", current_house.Discord);
        containerhome(data);
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
  let linkCharacterCard = createHTMLElement("a", "no-style-link");
  linkCharacterCard.href = "/characterCard";
  // Image fiche personnage
  let imgCharacterCard = document.createElement("img");
  imgCharacterCard.src = "/img/charactercard.webp";
  linkCharacterCard.appendChild(imgCharacterCard);
  // Button fiche personnage
  let buttoncharacterCard = createHTMLElement("div", "buttoncharacterCard");
  buttoncharacterCard.textContent = translate.home.characterChard;
  linkCharacterCard.appendChild(buttoncharacterCard);
  subcontainerUser.appendChild(linkCharacterCard);

  // page caserne
  let linkCaserne = createHTMLElement("a", "no-style-link");
  linkCaserne.href = "/caserne";
  // Image caserne
  let imgcaserne = document.createElement("img");
  imgcaserne.src = "/img/caserne.webp";
  linkCaserne.appendChild(imgcaserne);
  // Button caserne
  let buttonCaserne = createHTMLElement("div", "buttonCaserne");
  buttonCaserne.textContent = translate.home.caserne;
  linkCaserne.appendChild(buttonCaserne);
  subcontainerUser.appendChild(linkCaserne);

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

    subContainer.appendChild(subcontainerOfficier);
  }

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
