import { communBlock, createHTMLElement, fetchServer, fetchlogout } from "./useful.js";
import { loadTranslate } from "./translate.js";
import { adressAPI } from "./config.js";
import { showNotification } from "./notification.js";

export async function consulcaserne() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("consulcaserne/?house=" + currenthouse);
    if (data.Gestion.Logged && data.Gestion.Officier) {
      const translate = await loadTranslate(data.UserInfo.Language);

      containerconsulcaserne(data, translate);
    } else {
      fetchlogout();
    }
  }
}

let timerThrottlebutton = 0;
function containerconsulcaserne(data, translate) {
  communBlock(data, translate);

  let Container = document.getElementById("Container");
  Container.innerHTML = ``;
  let entetecaserne = createHTMLElement("div", "caserne");

  let selectusercaserne = createHTMLElement("div", "selectusercaserne");

  let title = document.createElement("div");
  title.textContent = translate.caserne.consulcaserne;
  selectusercaserne.appendChild(title);

  let selectusertosee = createHTMLElement("select", "selectusertosee");
  let defaultusertosee = document.createElement("option");
  defaultusertosee.value = "";
  defaultusertosee.text = translate.caserne.select;
  selectusertosee.appendChild(defaultusertosee);

  let options = [];
  for (let i = 0; i < data.ListInscripted.length; i++) {
    const currentUser = data.ListInscripted[i];
    let option = document.createElement("option");
    option.value = currentUser.ID;
    option.text = currentUser.Username;
    options.push(option);
  }
  // Trier les options par ordre alphabétique
  options.sort((a, b) => a.text.localeCompare(b.text));
  options.forEach((option) => selectusertosee.appendChild(option));

  selectusercaserne.appendChild(selectusertosee);
  entetecaserne.appendChild(selectusercaserne);
  Container.appendChild(entetecaserne);

  let caserne = createHTMLElement("div", "caserne");

  selectusercaserne.addEventListener("change", function () {
    caserne.innerHTML = "";

    let userSelected = document.getElementById("selectusertosee").value;

    for (let i = 0; i < data.ListInscripted.length; i++) {
      const currentUser = data.ListInscripted[i];

      if (currentUser.ID == userSelected) {
        let divInfanterie = createHTMLElement("div", "divInfanterie");
        let TitleDivInfanterie = document.createElement("div");
        TitleDivInfanterie.id = "titleInfanterie";
        TitleDivInfanterie.classList.add("titlelistUnit");
        TitleDivInfanterie.textContent = "》 " + data.Gestion.ListUnitType[0][data.UserInfo.Language];
        let listUnitInfanterie = document.createElement("div");
        listUnitInfanterie.classList.add("listUnit");
        listUnitInfanterie.style.display = "none";

        let divDistant = createHTMLElement("div", "divDistant");
        let TitleDivDistant = document.createElement("div");
        TitleDivDistant.id = "titleDistant";
        TitleDivDistant.classList.add("titlelistUnit");
        TitleDivDistant.textContent = "》 " + data.Gestion.ListUnitType[1][data.UserInfo.Language];
        let listUnitDistant = document.createElement("div");
        listUnitDistant.classList.add("listUnit");
        listUnitDistant.style.display = "none";

        let divCav = createHTMLElement("div", "divCav");
        let TitleDivCav = document.createElement("div");
        TitleDivCav.id = "titleCav";
        TitleDivCav.classList.add("titlelistUnit");
        TitleDivCav.textContent = "》 " + data.Gestion.ListUnitType[2][data.UserInfo.Language];
        let listUnitCav = document.createElement("div");
        listUnitCav.classList.add("listUnit");
        listUnitCav.style.display = "none";

        // ajout des unités dans un certain ordre
        addUnit(currentUser.UserCaserne, listUnitInfanterie, listUnitDistant, listUnitCav, "T5", translate, data.UserInfo.Language, translate);
        addUnit(currentUser.UserCaserne, listUnitInfanterie, listUnitDistant, listUnitCav, "T4", translate, data.UserInfo.Language, translate);
        addUnit(currentUser.UserCaserne, listUnitInfanterie, listUnitDistant, listUnitCav, "T3", translate, data.UserInfo.Language, translate);
        addUnit(currentUser.UserCaserne, listUnitInfanterie, listUnitDistant, listUnitCav, "T2", translate, data.UserInfo.Language, translate);

        divInfanterie.appendChild(TitleDivInfanterie);
        divInfanterie.appendChild(listUnitInfanterie);
        caserne.appendChild(divInfanterie);
        TitleDivInfanterie.addEventListener("click", function () {
          const now = new Date();
          if (now - timerThrottlebutton > 500) {
            timerThrottlebutton = now;
            if (listUnitInfanterie.style.display === "none") {
              listUnitInfanterie.style.display = "flex";
            } else {
              listUnitInfanterie.style.display = "none";
            }
          }
        });

        divDistant.appendChild(TitleDivDistant);
        divDistant.appendChild(listUnitDistant);
        caserne.appendChild(divDistant);
        TitleDivDistant.addEventListener("click", function () {
          const now = new Date();
          if (now - timerThrottlebutton > 500) {
            timerThrottlebutton = now;
            if (listUnitDistant.style.display === "none") {
              listUnitDistant.style.display = "flex";
            } else {
              listUnitDistant.style.display = "none";
            }
          }
        });

        divCav.appendChild(TitleDivCav);
        divCav.appendChild(listUnitCav);
        caserne.appendChild(divCav);
        TitleDivCav.addEventListener("click", function () {
          const now = new Date();
          if (now - timerThrottlebutton > 500) {
            timerThrottlebutton = now;
            if (listUnitCav.style.display === "none") {
              listUnitCav.style.display = "flex";
            } else {
              listUnitCav.style.display = "none";
            }
          }
        });

        let buttonMAJ = document.createElement("button");
        buttonMAJ.textContent = translate.caserne.buttonconsul;
        buttonMAJ.id = "MAJCaserne";
        buttonMAJ.className = "MAJCaserne";
        caserne.appendChild(buttonMAJ);

        MAJCaserne(currentUser.UserCaserne.length, currentUser.ID);
        break;
      }
    }
  });

  Container.appendChild(caserne);

  if (data.Gestion.Notification.Notif) {
    showNotification(data.Gestion.Notification.content[data.UserInfo.Language], data.Gestion.Notification.Type);
  }
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 50);
}

function MAJCaserne(nbunit, iduser) {
  var boutonMAJCaserne = document.getElementById("MAJCaserne");
  boutonMAJCaserne.addEventListener("click", function (event) {
    // event.preventDefault();
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;
      sendDataMAJCaserne(nbunit, iduser);
    }
  });
}

function addUnit(caserne, listUnitInfanterie, listUnitDistant, listUnitCav, tier, translate, Language) {
  for (let i = 0; i < caserne.length; i++) {
    const Currentunit = caserne[i];
    if (Currentunit.Unit_tier === tier) {
      let unit = document.createElement("div");
      unit.className = "unit";
      let img = document.createElement("img");
      img.src = Currentunit.Unit_img;
      img.alt = Currentunit.Unit_name[Language];
      unit.appendChild(img);
      let name = document.createElement("div");
      name.textContent = Currentunit.Unit_name[Language];
      unit.appendChild(name);
      let info = document.createElement("div");
      info.textContent = translate.caserne.influence + " : " + Currentunit.Unit_influence + " (" + Currentunit.Unit_tier + ")";
      unit.appendChild(info);

      // Doctrine d'influence
      const doctrine = createHTMLElement("div", "checkbox");
      const checkbox = createHTMLElement("input", `influence_unit_${Currentunit.Unit_id}`);
      checkbox.type = "checkbox";
      if (Currentunit.DoctrineInflu) {
        checkbox.checked = true;
      }
      // Label curseur (switch visuel)
      const sliderLabel = document.createElement("label");
      sliderLabel.className = "switch";
      const slider = document.createElement("span");
      slider.className = "slider";
      sliderLabel.appendChild(checkbox);
      sliderLabel.appendChild(slider);
      // Texte à côté du switch
      const textLabel = document.createElement("span");
      textLabel.className = "switch-text";
      textLabel.textContent = "Doctrine d'influence :";
      doctrine.appendChild(textLabel);
      doctrine.appendChild(sliderLabel);
      unit.appendChild(doctrine);

      let selecctlvl = document.createElement("select");
      selecctlvl.className = "selecctLevelCaserne";
      selecctlvl.name = "Unit" + Currentunit.Unit_id;
      selecctlvl.id = "lvl-unit" + Currentunit.Unit_id;
      let defaultoption = document.createElement("option");
      defaultoption.value = "";
      if (Currentunit.Unit_lvl == Currentunit.Unit_lvlMax) {
        defaultoption.text = translate.caserne.level + " " + Currentunit.Unit_lvl;
        selecctlvl.style.backgroundColor = "green";
      } else if (Currentunit.Unit_lvl != "0") {
        defaultoption.text = translate.caserne.level + " " + Currentunit.Unit_lvl;
        selecctlvl.style.backgroundColor = "orange";
      } else {
        defaultoption.text = translate.caserne.nodata;
        selecctlvl.style.backgroundColor = "red";
      }
      selecctlvl.style.borderRadius = "15px";
      selecctlvl.style.fontSize = "16px";
      selecctlvl.appendChild(defaultoption);
      if (Currentunit.Unit_lvl != "0") {
        let optionAbsent = document.createElement("option");
        optionAbsent.value = -1;
        optionAbsent.text = translate.caserne.nodata;
        optionAbsent.style.backgroundColor = "red";
        selecctlvl.appendChild(optionAbsent);
      }
      for (let j = 1; j <= Currentunit.Unit_lvlMax; j++) {
        if (j % 5 == 0 || j == Currentunit.Unit_lvlMax) {
          let option = document.createElement("option");
          option.value = j;
          option.text = translate.caserne.level + " " + j;
          if (j < Currentunit.Unit_lvlMax) {
            option.style.backgroundColor = "orange";
          } else {
            option.style.backgroundColor = "green";
          }

          selecctlvl.appendChild(option);
        }
      }
      unit.appendChild(selecctlvl);

      // Ajout de la maitrise
      if (Currentunit.Unit_maitrise === "1") {
        // presence d'une maitrise sur l'unité
        let selecctMaitrise = document.createElement("select");
        selecctMaitrise.className = "selecctMaitriseCaserne";
        selecctMaitrise.name = "Unit" + Currentunit.Unit_id;
        selecctMaitrise.id = "maitrise-unit" + Currentunit.Unit_id;
        selecctMaitrise.style.borderRadius = "15px";
        selecctMaitrise.style.fontSize = "16px";
        let defaultoption = document.createElement("option");
        selecctMaitrise.appendChild(defaultoption);

        for (let i = 0; i < translate.caserne.listoption_maitrise.length; i++) {
          const element = translate.caserne.listoption_maitrise[i];
          if (Currentunit.UserMaitrise == element[0]) {
            // ne maitrise pas
            defaultoption.text = element[1];
            defaultoption.value = element[0];
            defaultoption.style.backgroundColor = element[2];
            selecctMaitrise.style.backgroundColor = element[2];
          } else {
            if (i === 0 && Currentunit.UserMaitrise == "") {
              defaultoption.text = translate.caserne.listoption_maitrise[0][1];
              defaultoption.value = translate.caserne.listoption_maitrise[0][0];
              selecctMaitrise.style.backgroundColor = element[2];
            } else {
              let option = document.createElement("option");
              option.text = element[1];
              option.value = element[0];
              option.style.backgroundColor = element[2];
              selecctMaitrise.appendChild(option);
            }
          }
        }
        unit.appendChild(selecctMaitrise);
      }

      if (Currentunit.Unit_type.fr === "Infanterie") {
        listUnitInfanterie.appendChild(unit);
      } else if (Currentunit.Unit_type.fr === "Distant") {
        listUnitDistant.appendChild(unit);
      } else if (Currentunit.Unit_type.fr === "Cavalerie") {
        listUnitCav.appendChild(unit);
      }
    }
  }
}

async function sendDataMAJCaserne(nbunit, iduser) {
  // récupération de toutes les valeurs
  let listNewLvlUnitCaserne = [];
  for (let i = 0; i < nbunit; i++) {
    var selectElement = document.getElementById("lvl-unit" + (i + 1));
    let majUnit = [];
    majUnit.push("Unit" + (i + 1));
    majUnit.push(selectElement.value);

    if (document.getElementById("maitrise-unit" + (i + 1))) {
      var selectMaitrise = document.getElementById("maitrise-unit" + (i + 1));
      majUnit.push(selectMaitrise.value);
    } else {
      majUnit.push("");
    }

    const doctrineInflu = document.getElementById("influence_unit_" + (i + 1));
    majUnit.push(doctrineInflu && doctrineInflu.checked ? "0" : "1");

    listNewLvlUnitCaserne.push(majUnit);
  }

  const dataToSend = {
    iduser: iduser.toString(),
    listNewLvlUnitCaserne: listNewLvlUnitCaserne,
  };
  // console.log("dataToSend", dataToSend);

  const currenthouse = localStorage.getItem("user_house");

  const update = await fetch(adressAPI + "majspecificcaserne/?house=" + currenthouse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur de réseau: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
    });

  if (update.Gestion.Logged && update.Gestion.Officier) {
    const translate = await loadTranslate(update.UserInfo.Language);
    containerconsulcaserne(update, translate);
  } else {
    fetchlogout();
  }
}
