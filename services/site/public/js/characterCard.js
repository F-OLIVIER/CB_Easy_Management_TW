import { adressAPI } from "./config.js";
import { translate } from "./translate.js";
import { communBlock, createHTMLElement, fetchServer, fetchlogout } from "./useful.js";

export async function characterCard() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    containerCharacterCard(await fetchServer("charactercard/?house=" + currenthouse));
  }
}

function containerCharacterCard(data) {
  if (data.Gestion.Logged) {
    communBlock(data);

    let container = document.getElementById("Container");
    let subcontainer = createHTMLElement("div", "subcontainerProfile");

    let divError = createHTMLElement("div", "divError");
    divError.style.display = "none";
    subcontainer.appendChild(divError);

    let divMAJ = createHTMLElement("div", "divMAJ");

    let personnage = createHTMLElement("div", "personnage");
    let titlepersonnage = createHTMLElement("div", "titlepersonnage");
    titlepersonnage.textContent = translate[data.UserInfo.Language].characterCard.info_user.title;
    personnage.appendChild(titlepersonnage);

    // class
    let classeplay = document.createElement("div");
    classeplay.textContent = translate[data.UserInfo.Language].characterCard.info_user.classe.get + " : " + data.UserInfo.GameCharacter[data.UserInfo.Language];
    personnage.appendChild(classeplay);
    let changeClass = createHTMLElement("div", "changeInfo");
    let titlechangeClass = document.createElement("div");
    titlechangeClass.innerHTML = translate[data.UserInfo.Language].characterCard.info_user.classe.set + " : ";
    changeClass.appendChild(titlechangeClass);
    let selectchangeClass = createHTMLElement("select", "newClass");
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = translate[data.UserInfo.Language].characterCard.info_user.classe.new;
    selectchangeClass.appendChild(defaultOption);
    for (let i = 0; i < data.Gestion.ListClass.length; i++) {
      let option = document.createElement("option");
      option.value = data.Gestion.ListClass[i][data.UserInfo.Language];
      option.text = data.Gestion.ListClass[i][data.UserInfo.Language];
      selectchangeClass.appendChild(option);
    }

    changeClass.appendChild(selectchangeClass);
    personnage.appendChild(changeClass);

    // level
    let lvl = document.createElement("div");
    if (data.UserInfo.Lvl == 0) {
      lvl.textContent = translate[data.UserInfo.Language].characterCard.info_user.level.nodata;
    } else {
      lvl.textContent = translate[data.UserInfo.Language].characterCard.info_user.level.get + " : " + data.UserInfo.Lvl;
    }
    personnage.appendChild(lvl);
    let changelvl = createHTMLElement("div", "changeInfo");
    let titlechangelvl = document.createElement("div");
    titlechangelvl.innerHTML = translate[data.UserInfo.Language].characterCard.info_user.level.set + " : ";
    changelvl.appendChild(titlechangelvl);
    let inputlvl = createHTMLElement("input", "newlvl");
    inputlvl.placeholder = translate[data.UserInfo.Language].characterCard.info_user.level.new;
    inputlvl.type = "number";

    changelvl.appendChild(inputlvl);
    personnage.appendChild(changelvl);

    // influence
    let influence = document.createElement("div");
    influence.innerHTML = translate[data.UserInfo.Language].characterCard.info_user.influence.get + " : " + data.UserInfo.Influence;
    personnage.appendChild(influence);
    let changeInflu = createHTMLElement("div", "changeInfo");
    let titlechangeInflu = document.createElement("div");
    titlechangeInflu.innerHTML = translate[data.UserInfo.Language].characterCard.info_user.influence.set + " : ";
    changeInflu.appendChild(titlechangeInflu);
    let inputInflu = createHTMLElement("input", "newInflu");
    inputInflu.placeholder = translate[data.UserInfo.Language].characterCard.info_user.influence.new;
    inputInflu.type = "number";
    changeInflu.appendChild(inputInflu);
    personnage.appendChild(changeInflu);

    let buttonMAJpersonnage = createHTMLElement("button", "buttonMAJpersonnage");
    buttonMAJpersonnage.type = "submit";
    buttonMAJpersonnage.textContent = translate[data.UserInfo.Language].characterCard.info_user.button;
    personnage.appendChild(buttonMAJpersonnage);
    divMAJ.appendChild(personnage);

    // Information GvG
    let infoGvG = createHTMLElement("div", "infoGvG");
    let titleinfoGvG = createHTMLElement("div", "titleinfoGvG");
    titleinfoGvG.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.title;
    infoGvG.appendChild(titleinfoGvG);
    let etatInscripted = document.createElement("div");
    let listButton = createHTMLElement("div", "listButton");
    if (data.Gestion.BotActivate) {
      if (data.UserInfo.EtatInscription === 0 || data.UserInfo.EtatInscription === -1) {
        etatInscripted.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.inscripted.nodata;
        // button present
        let buttonPresent = createHTMLElement("button", "inscriptedPresent");
        buttonPresent.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.button.present;
        listButton.appendChild(buttonPresent);
        // button absent
        let buttonAbsent = createHTMLElement("button", "inscriptedAbsent");
        buttonAbsent.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.button.absent;
        listButton.appendChild(buttonAbsent);
      } else if (data.UserInfo.EtatInscription == 1) {
        etatInscripted.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.inscripted.present;
        // button absent
        let buttonAbsent = createHTMLElement("button", "inscriptedAbsent");
        buttonAbsent.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.button.absent;
        listButton.appendChild(buttonAbsent);
      } else if (data.UserInfo.EtatInscription == 3) {
        etatInscripted.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.inscripted.absent;
        // button present
        let buttonPresent = createHTMLElement("button", "inscriptedPresent");
        buttonPresent.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.button.present;
        listButton.appendChild(buttonPresent);
      }
    } else {
      etatInscripted.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.noinscription;
    }
    infoGvG.appendChild(etatInscripted);
    if (data.Gestion.BotActivate) {
      infoGvG.appendChild(listButton);
    }

    let nbGvG = document.createElement("div");
    nbGvG.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.nbGvG + " : " + data.UserInfo.NbGvGParticiped;
    infoGvG.appendChild(nbGvG);
    let lastGvG = document.createElement("div");
    if (data.UserInfo.DateLastGvG[data.UserInfo.Language] == "") {
      lastGvG.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.lastGvG.description + " : " + translate[data.UserInfo.Language].characterCard.info_GvG.lastGvG.nodata;
    } else {
      lastGvG.textContent = translate[data.UserInfo.Language].characterCard.info_GvG.lastGvG.description + " : " + data.UserInfo.DateLastGvG[data.UserInfo.Language];
    }
    infoGvG.appendChild(lastGvG);
    divMAJ.appendChild(infoGvG);
    subcontainer.appendChild(divMAJ);
    container.appendChild(subcontainer);

    document.getElementById("buttonMAJpersonnage").addEventListener("click", (event) => {
      event.preventDefault();
      majPersonnage();
    });
    if (data.Gestion.BotActivate) {
      if (document.getElementById("inscriptedPresent")) {
        document.getElementById("inscriptedPresent").addEventListener("click", () => {
          changeInscription(true);
        });
      }
      if (document.getElementById("inscriptedAbsent")) {
        document.getElementById("inscriptedAbsent").addEventListener("click", () => {
          changeInscription(false);
        });
      }
    }
  } else {
    fetchlogout();
  }
}

function majPersonnage() {
  let dataToSend = {
    GameCharacter: {},
  };

  dataToSend.GameCharacter.fr = document.getElementById("newClass").value;
  dataToSend.Lvl = document.getElementById("newlvl").value;
  if (dataToSend.Lvl !== "" && (dataToSend.Lvl > 10000 || dataToSend.Lvl < 0)) {
    alert(translate[data.UserInfo.Language].characterCard.error.err_lvl);
    return;
  }
  dataToSend.Influence = document.getElementById("newInflu").value;
  if (dataToSend.Influence !== "" && (dataToSend.Influence > 1200 || dataToSend.Influence < 700)) {
    alert(translate[data.UserInfo.Language].characterCard.error.err_influ);
    return;
  }

  if (dataToSend.Influence === "" && dataToSend.Lvl === "" && dataToSend.GameCharacter.fr === "") {
    let divError = document.getElementById("divError");
    divError.textContent = translate[data.UserInfo.Language].characterCard.error.err_select;
    divError.style.display = "block";
  } else {
    fetchData(dataToSend);
  }
}

function changeInscription(incripted) {
  let dataToSend = {};
  if (incripted) {
    dataToSend.EtatInscription = 1; // present
  } else {
    dataToSend.EtatInscription = 3; // absent
  }
  fetchData(dataToSend);
}

async function fetchData(dataToSend) {
  const currenthouse = localStorage.getItem("user_house");

  await fetch(adressAPI + "updateCharacterCard/?house=" + currenthouse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  }).catch((error) => {
    console.error("Erreur lors de la récupération des données:", error);
  });

  window.location.href = "/characterCard";
}
