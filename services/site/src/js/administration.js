import { communBlock, confirmwindows, createHTMLElement, fetchServer, fetchlogout, removeHTMLTags } from "./useful.js";
import { showNotification } from "./notification.js";
import { loadTranslate } from "./translate.js";
import { adressAPI } from "./config.js";

export async function administration() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("CheckAppAdmin/?house=" + currenthouse);
    if (data.Gestion.Logged && data.Gestion.Admin) {
      const translate = await loadTranslate(data.UserInfo.Language);
      containerAppAdmin(data, translate);
    } else {
      fetchlogout();
    }
  }
}

let checkedRadioValue_Unit_maitrise = "";
function containerAppAdmin(data, translate) {
  communBlock(data, translate);

  const subContainer = createHTMLElement("div", "subContainerbotEtat");

  // -----------------------------------------------
  // ----------------- Statistique -----------------
  // -----------------------------------------------
  if (data.Statistique) {
    let divstatdb = createHTMLElement("div", "divstatdb");

    let stathouses = createHTMLElement("div", "stathouses");

    // Title
    let stathouse = createHTMLElement("div", "stathouse");

    let statname = createHTMLElement("div", "statname");
    statname.textContent = "Maison";
    stathouse.appendChild(statname);

    let statusers = createHTMLElement("div", "statusers");
    statusers.textContent = "Utilisateurs";
    stathouse.appendChild(statusers);

    let statlanguage = createHTMLElement("div", "statlanguage");
    statlanguage.textContent = "Langue";
    stathouse.appendChild(statlanguage);

    stathouses.appendChild(stathouse);

    for (let index = 0; index < data.Statistique.Houses.length; index++) {
      const house = data.Statistique.Houses[index];
      let stathouse = createHTMLElement("div", "stathouse");

      let statname = createHTMLElement("div", "statname");
      statname.textContent = house.House_name;
      stathouse.appendChild(statname);

      let statusers = createHTMLElement("div", "statusers");
      statusers.textContent = house.Discord;
      stathouse.appendChild(statusers);

      let statlanguage = createHTMLElement("div", "statlanguage");
      statlanguage.textContent = house.Language;
      stathouse.appendChild(statlanguage);

      stathouses.appendChild(stathouse);
    }
    divstatdb.appendChild(stathouses);

    let stattable = createHTMLElement("div", "stattable");
    stattable.textContent = `Nombre de tables : ${data.Statistique.Nb_Table}`;
    divstatdb.appendChild(stattable);

    subContainer.appendChild(divstatdb);
  }

  // -----------------------------------------------
  // -------------- Ajouter une unité --------------
  // -----------------------------------------------
  let divNewUnit = createHTMLElement("div", "divNewUnit");
  let titleNewUnit = createHTMLElement("div", "titleNewUnit");
  titleNewUnit.textContent = "Create one new unit";
  divNewUnit.appendChild(titleNewUnit);

  let formNewUnit = document.createElement("form");
  formNewUnit.id = "formNewUnit";
  formNewUnit.className = "newUnit";
  formNewUnit.method = "POST";
  formNewUnit.enctype = "multipart/form-data";
  // Unit_name.EN
  let input_Unit_nameEN = createHTMLElement("input", "nameNewUnitEN");
  input_Unit_nameEN.placeholder = "Name unit (English)";
  input_Unit_nameEN.required = true;
  formNewUnit.appendChild(input_Unit_nameEN);
  // Unit_name.FR
  let input_Unit_nameFR = createHTMLElement("input", "nameNewUnitFR");
  input_Unit_nameFR.placeholder = "Name unit (French)";
  input_Unit_nameFR.required = true;
  formNewUnit.appendChild(input_Unit_nameFR);

  // Unit_influence
  let input_Unit_influence = createHTMLElement("input", "influNewUnit");
  input_Unit_influence.type = "number";
  input_Unit_influence.required = true;
  input_Unit_influence.placeholder = "Influence unit";
  formNewUnit.appendChild(input_Unit_influence);
  // Unit_lvlMax
  let input_Unit_lvlMax = createHTMLElement("input", "lvlMaxNewUnit");
  input_Unit_lvlMax.type = "number";
  input_Unit_lvlMax.required = true;
  input_Unit_lvlMax.placeholder = "Level max unit";
  formNewUnit.appendChild(input_Unit_lvlMax);
  // Unit_tier
  let input_Unit_tier = createHTMLElement("select", "tierNewUnit");
  input_Unit_tier.required = true;
  let title_option_Unit_tier = ["Tier unit", "T2", "T3", "T4", "T5"];
  let option_Unit_tier = ["", "T2", "T3", "T4", "T5"];
  for (let i = 0; i < option_Unit_tier.length; i++) {
    let option = document.createElement("option");
    option.value = option_Unit_tier[i];
    option.text = title_option_Unit_tier[i];
    input_Unit_tier.appendChild(option);
  }
  formNewUnit.appendChild(input_Unit_tier);
  // Unit_type
  let input_Unit_type = createHTMLElement("select", "typeNewUnit");
  input_Unit_type.required = true;
  // Valeur vide :
  let defaultoption = document.createElement("option");
  defaultoption.value = "";
  defaultoption.text = "Type unit";
  input_Unit_type.appendChild(defaultoption);
  for (let i = 0; i < data.Gestion.ListUnitType.length; i++) {
    let option = document.createElement("option");
    option.value = data.Gestion.ListUnitType[i].fr;
    option.text = data.Gestion.ListUnitType[i][data.UserInfo.Language];
    input_Unit_type.appendChild(option);
  }
  formNewUnit.appendChild(input_Unit_type);

  // Maitrise d'unité
  let input_Unit_maitrise = createHTMLElement("fieldset", "maitriseUnit");
  let legend = document.createElement("legend");
  legend.textContent = " Maîtrise d'unité ";
  input_Unit_maitrise.appendChild(legend);

  const containFieldset = [
    ["Présente", "1"],
    ["Absente", "0"],
  ];
  containFieldset.forEach((name) => {
    const divfieldset = document.createElement("div");

    const radio = document.createElement("input");
    radio.setAttribute("type", "radio");
    radio.setAttribute("id", name[0]);
    radio.setAttribute("name", "drone");
    radio.setAttribute("value", name[1]);
    if (name[1] === "0") {
      radio.setAttribute("checked", "checked");
    }
    divfieldset.appendChild(radio);

    const label = document.createElement("label");
    label.setAttribute("for", name[0]);
    label.textContent = name[0];
    divfieldset.appendChild(label);

    radio.addEventListener("change", function () {
      checkedRadioValue_Unit_maitrise = radio.value;
    });

    input_Unit_maitrise.appendChild(divfieldset);
  });
  formNewUnit.appendChild(input_Unit_maitrise);

  // Unit_img
  let input_Unit_img = createHTMLElement("input", "imgNewUnit");
  input_Unit_img.required = true;
  input_Unit_img.type = "file";
  input_Unit_img.lang = "fr";
  input_Unit_img.accept = ".jpg, .jpeg, .png,";
  formNewUnit.appendChild(input_Unit_img);

  // button
  let buttonNewUnit = createHTMLElement("button", "buttonNewUnit");
  buttonNewUnit.textContent = "Add unit";
  buttonNewUnit.type = "submit";
  formNewUnit.appendChild(buttonNewUnit);

  divNewUnit.appendChild(formNewUnit);
  subContainer.appendChild(divNewUnit);

  // -----------------------------------------------
  // ------------- Modifier une unité --------------
  // -----------------------------------------------
  let divChangeUnit = createHTMLElement("div", "divChangeUnit");
  let titleChangeUnit = document.createElement("div");
  titleChangeUnit.className = "titleChangeUnit";
  titleChangeUnit.textContent = "Modify unit";
  divChangeUnit.appendChild(titleChangeUnit);

  let formChangeUnit = createHTMLElement("form", "formchangeUnit");
  formChangeUnit.enctype = "multipart/form-data";
  let selectChangeUnit = createHTMLElement("select", "selectChangeUnit");
  let defaultChangeUnit = document.createElement("option");
  defaultChangeUnit.value = "";
  defaultChangeUnit.text = "Select";
  selectChangeUnit.appendChild(defaultChangeUnit);

  let optgroupT5Infanterie = document.createElement("optgroup");
  optgroupT5Infanterie.label = `${translate.create_group.create_group.selectmenu.t5} - ${data.Gestion.ListUnitType[0][data.UserInfo.Language]}`;
  let optgroupT5Distant = document.createElement("optgroup");
  optgroupT5Distant.label = `${translate.create_group.create_group.selectmenu.t5} - ${data.Gestion.ListUnitType[1][data.UserInfo.Language]}`;
  let optgroupT5Cav = document.createElement("optgroup");
  optgroupT5Cav.label = `${translate.create_group.create_group.selectmenu.t5} - ${data.Gestion.ListUnitType[2][data.UserInfo.Language]}`;

  let optgroupT4Infanterie = document.createElement("optgroup");
  optgroupT4Infanterie.label = `${translate.create_group.create_group.selectmenu.t4} - ${data.Gestion.ListUnitType[0][data.UserInfo.Language]}`;
  let optgroupT4Distant = document.createElement("optgroup");
  optgroupT4Distant.label = `${translate.create_group.create_group.selectmenu.t4} - ${data.Gestion.ListUnitType[1][data.UserInfo.Language]}`;
  let optgroupT4Cav = document.createElement("optgroup");
  optgroupT4Cav.label = `${translate.create_group.create_group.selectmenu.t4} - ${data.Gestion.ListUnitType[2][data.UserInfo.Language]}`;

  let optgroupT3Infanterie = document.createElement("optgroup");
  optgroupT3Infanterie.label = `${translate.create_group.create_group.selectmenu.t3} - ${data.Gestion.ListUnitType[0][data.UserInfo.Language]}`;
  let optgroupT3Distant = document.createElement("optgroup");
  optgroupT3Distant.label = `${translate.create_group.create_group.selectmenu.t3} - ${data.Gestion.ListUnitType[1][data.UserInfo.Language]}`;
  let optgroupT3Cav = document.createElement("optgroup");
  optgroupT3Cav.label = `${translate.create_group.create_group.selectmenu.t3} - ${data.Gestion.ListUnitType[2][data.UserInfo.Language]}`;

  let optgroupT2Infanterie = document.createElement("optgroup");
  optgroupT2Infanterie.label = `${translate.create_group.create_group.selectmenu.t2} - ${data.Gestion.ListUnitType[0][data.UserInfo.Language]}`;
  let optgroupT2Distant = document.createElement("optgroup");
  optgroupT2Distant.label = `${translate.create_group.create_group.selectmenu.t2} - ${data.Gestion.ListUnitType[1][data.UserInfo.Language]}`;
  let optgroupT2Cav = document.createElement("optgroup");
  optgroupT2Cav.label = `${translate.create_group.create_group.selectmenu.t2} - ${data.Gestion.ListUnitType[2][data.UserInfo.Language]}`;

  for (let i = 0; i < data.ListUnit.length; i++) {
    const currentUnit = data.ListUnit[i];

    let option = document.createElement("option");
    option.value = currentUnit.Unit_name[data.UserInfo.Language];
    option.text = currentUnit.Unit_name.fr;

    if (currentUnit.Unit_tier === "T5") {
      if (currentUnit.Unit_type.fr === "Infanterie") {
        optgroupT5Infanterie.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Distant") {
        optgroupT5Distant.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Cavalerie") {
        optgroupT5Cav.appendChild(option);
      }
    } else if (currentUnit.Unit_tier === "T4") {
      if (currentUnit.Unit_type.fr === "Infanterie") {
        optgroupT4Infanterie.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Distant") {
        optgroupT4Distant.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Cavalerie") {
        optgroupT4Cav.appendChild(option);
      }
    } else if (currentUnit.Unit_tier === "T3") {
      if (currentUnit.Unit_type.fr === "Infanterie") {
        optgroupT3Infanterie.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Distant") {
        optgroupT3Distant.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Cavalerie") {
        optgroupT3Cav.appendChild(option);
      }
    } else if (currentUnit.Unit_tier === "T2") {
      if (currentUnit.Unit_type.fr === "Infanterie") {
        optgroupT2Infanterie.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Distant") {
        optgroupT2Distant.appendChild(option);
      } else if (currentUnit.Unit_type.fr === "Cavalerie") {
        optgroupT2Cav.appendChild(option);
      }
    }
  }

  // T5
  selectChangeUnit.appendChild(optgroupT5Infanterie);
  selectChangeUnit.appendChild(optgroupT5Distant);
  selectChangeUnit.appendChild(optgroupT5Cav);
  // T4
  selectChangeUnit.appendChild(optgroupT4Infanterie);
  selectChangeUnit.appendChild(optgroupT4Distant);
  selectChangeUnit.appendChild(optgroupT4Cav);
  // T3
  selectChangeUnit.appendChild(optgroupT3Infanterie);
  selectChangeUnit.appendChild(optgroupT3Distant);
  selectChangeUnit.appendChild(optgroupT3Cav);
  // T2
  selectChangeUnit.appendChild(optgroupT2Infanterie);
  selectChangeUnit.appendChild(optgroupT2Distant);
  selectChangeUnit.appendChild(optgroupT2Cav);

  formChangeUnit.appendChild(selectChangeUnit);
  divChangeUnit.appendChild(formChangeUnit);
  subContainer.appendChild(divChangeUnit);

  // -----------------------------------------------
  // --------- Ajouter une nouvelle classe ---------
  // -----------------------------------------------
  let divNewclass = createHTMLElement("div", "divNewclass");
  let titleNewclass = createHTMLElement("div", "titleNewclass");
  titleNewclass.textContent = "Add a new weapon";
  divNewclass.appendChild(titleNewclass);

  let formNewclass = document.createElement("form");
  formNewclass.id = "formNewclass";
  formNewclass.className = "formNewclass";
  // class_name
  let input_class_name_en = createHTMLElement("input", "nameNewclassEN");
  input_class_name_en.placeholder = "Name new weapon (English)";
  input_class_name_en.required = true;
  formNewclass.appendChild(input_class_name_en);
  let input_class_name_fr = createHTMLElement("input", "nameNewclassFR");
  input_class_name_fr.placeholder = "Name new weapon (French)";
  input_class_name_fr.required = true;
  formNewclass.appendChild(input_class_name_fr);

  let buttonNewclass = createHTMLElement("button", "buttonNewclass");
  buttonNewclass.textContent = "Add a new weapon";
  buttonNewclass.type = "submit";
  formNewclass.appendChild(buttonNewclass);

  divNewclass.appendChild(formNewclass);
  subContainer.appendChild(divNewclass);

  // -----------------------------------------------
  // -------- Message d'information Discord --------
  // -----------------------------------------------
  if (data.Statistique) {
    let divinformationDiscord = createHTMLElement("div", "divinformationDiscord");
    let titleinformationDiscord = createHTMLElement("div", "titleinformationDiscord");
    titleinformationDiscord.textContent = "Send information Discord";
    divinformationDiscord.appendChild(titleinformationDiscord);

    let forminformationDiscord = document.createElement("form");
    forminformationDiscord.id = "forminformationDiscord";
    forminformationDiscord.className = "forminformationDiscord";
    // informationDiscord
    let input_informationDiscord_en = createHTMLElement("textarea", "informationDiscordEN");
    input_informationDiscord_en.placeholder = "Information Discord (English)";
    input_informationDiscord_en.required = true;
    forminformationDiscord.appendChild(input_informationDiscord_en);
    let input_informationDiscord_fr = createHTMLElement("textarea", "informationDiscordFR");
    input_informationDiscord_fr.placeholder = "Information Discord (French)";
    input_informationDiscord_fr.required = true;
    forminformationDiscord.appendChild(input_informationDiscord_fr);

    let buttoninformationDiscord = createHTMLElement("button", "buttoninformationDiscord");
    buttoninformationDiscord.textContent = "Send information Discord all houses";
    buttoninformationDiscord.type = "submit";
    forminformationDiscord.appendChild(buttoninformationDiscord);

    divinformationDiscord.appendChild(forminformationDiscord);
    subContainer.appendChild(divinformationDiscord);

    // -----------------------------------------------
    // --------- Message privée Discord (DM) ---------
    // -----------------------------------------------
    let divDmDiscord = createHTMLElement("div", "divinformationDiscord");
    let titleDmDiscord = createHTMLElement("div", "titleinformationDiscord");
    titleDmDiscord.textContent = "Send Dm Discord";
    divDmDiscord.appendChild(titleDmDiscord);

    let formDmDiscord = document.createElement("form");
    formDmDiscord.id = "formDmDiscord";
    formDmDiscord.className = "formDmDiscord";
    // DmDiscord
    let inputDmDiscord = createHTMLElement("input", "inputDmDiscord");
    inputDmDiscord.placeholder = "ID User to send DM";
    inputDmDiscord.required = true;
    formDmDiscord.appendChild(inputDmDiscord);
    let input_DmDiscord_en = createHTMLElement("textarea", "DmDiscord");
    input_DmDiscord_en.placeholder = "Dm Discord (French or English ?)";
    input_DmDiscord_en.required = true;
    formDmDiscord.appendChild(input_DmDiscord_en);

    let buttonDmDiscord = createHTMLElement("button", "buttonDmDiscord");
    buttonDmDiscord.textContent = "Send Dm Discord";
    buttonDmDiscord.type = "submit";
    formDmDiscord.appendChild(buttonDmDiscord);

    divDmDiscord.appendChild(formDmDiscord);
    subContainer.appendChild(divDmDiscord);
  }

  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  Container.appendChild(subContainer);

  addEventOnAllButton(data.ListUnit, data.Gestion.ListUnitType, data.Statistique);

  if (data.Gestion.Notification.Notif) {
    showNotification(data.Gestion.Notification.content[data.UserInfo.Language], data.Gestion.Notification.Type);
  }
}

let timerThrottlebutton = 0;
function addEventOnAllButton(listUnit, ListUnitType, acces) {
  // Ajout d'une nouvelle unité
  document.getElementById("formNewUnit").addEventListener("submit", async (event) => {
    event.preventDefault();

    // fenetre de confirmation
    const userConfirmed = await confirmwindows("Confirm the creation of the new unit ?");
    if (userConfirmed) {
      const now = new Date();
      if (now - timerThrottlebutton > 500) {
        timerThrottlebutton = now;
        adminitrateBot("buttonNewUnit");
      }
    }
  });

  // Modification d'une unité existante
  let selectChangeUnit = document.getElementById("selectChangeUnit");
  selectChangeUnit.addEventListener("change", () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;
      let unitSelected;
      for (let i = 0; i < listUnit.length; i++) {
        if (selectChangeUnit.value === listUnit[i].Unit_name.fr) {
          unitSelected = listUnit[i];
          break;
        }
      }

      // suppression des anciens éléments si existant
      if (document.getElementById("changeUnitNameEN")) {
        document.getElementById("changeUnitNameEN").remove();
      }
      if (document.getElementById("changeUnitNameFR")) {
        document.getElementById("changeUnitNameFR").remove();
      }
      if (document.getElementById("changeUnitInfluence")) {
        document.getElementById("changeUnitInfluence").remove();
      }
      if (document.getElementById("changeUnitLvlMax")) {
        document.getElementById("changeUnitLvlMax").remove();
      }
      if (document.getElementById("changeUnitTier")) {
        document.getElementById("changeUnitTier").remove();
      }
      if (document.getElementById("changeUnitimg")) {
        document.getElementById("changeUnitimg").remove();
      }
      if (document.getElementById("buttonChangeUnit")) {
        document.getElementById("buttonChangeUnit").remove();
      }
      if (document.getElementById("changemaitriseUnit")) {
        document.getElementById("changemaitriseUnit").remove();
      }
      if (document.getElementById("changeUnitType")) {
        document.getElementById("changeUnitType").remove();
      }

      if (selectChangeUnit.value != "") {
        // Ajout des nouveaux éléments
        let formChangeUnit = document.getElementById("formchangeUnit");
        // name_unit
        let input_Unit_name_en = createHTMLElement("input", "changeUnitNameEN");
        input_Unit_name_en.type = "text";
        input_Unit_name_en.placeholder = "Name (english) : " + unitSelected.Unit_name.en;
        formChangeUnit.appendChild(input_Unit_name_en);
        let input_Unit_name_fr = createHTMLElement("input", "changeUnitNameFR");
        input_Unit_name_fr.type = "text";
        input_Unit_name_fr.placeholder = "Name (french) : " + unitSelected.Unit_name.fr;
        formChangeUnit.appendChild(input_Unit_name_fr);
        // Unit_influence
        let input_Unit_influence = createHTMLElement("input", "changeUnitInfluence");
        input_Unit_influence.type = "number";
        input_Unit_influence.placeholder = "Influence actuel : " + unitSelected.Unit_influence;
        formChangeUnit.appendChild(input_Unit_influence);
        // Unit_lvlMax
        let input_Unit_lvlMax = createHTMLElement("input", "changeUnitLvlMax");
        input_Unit_lvlMax.type = "number";
        input_Unit_lvlMax.placeholder = "Level max actuel : " + unitSelected.Unit_lvlMax;
        formChangeUnit.appendChild(input_Unit_lvlMax);

        // Maitrise d'unité
        if (unitSelected.Unit_maitrise === "0") {
          let input_Unit_maitrise = createHTMLElement("fieldset", "changemaitriseUnit");
          let legend = document.createElement("legend");
          legend.textContent = " Maîtrise d'unité ";
          input_Unit_maitrise.appendChild(legend);

          const divfieldset = document.createElement("div");
          const checkbox = document.createElement("input");
          checkbox.setAttribute("type", "checkbox");
          checkbox.setAttribute("name", "changeUnitMaitrise");
          checkbox.setAttribute("id", "changeUnitMaitrise");
          checkbox.setAttribute("value", "1");
          divfieldset.appendChild(checkbox);

          const label = document.createElement("label");
          label.setAttribute("for", "Ajouter à l'unité une maîtrise");
          label.textContent = "Ajouter à l'unité une maîtrise";
          divfieldset.appendChild(label);
          label.addEventListener("click", function () {
            const now = new Date();
            if (now - timerThrottlebutton > 500) {
              timerThrottlebutton = now;
              checkbox.checked = !checkbox.checked;
            }
          });

          input_Unit_maitrise.appendChild(divfieldset);
          formChangeUnit.appendChild(input_Unit_maitrise);
        }

        // Unit_Tier
        let input_Unit_tier = createHTMLElement("select", "changeUnitTier");
        let defaultoptiontier = document.createElement("option");
        defaultoptiontier.text = "Tier : " + unitSelected.Unit_tier;
        defaultoptiontier.value = "";
        input_Unit_tier.appendChild(defaultoptiontier);
        let option_Unit_tier = ["T3", "T4", "T5"];
        for (let i = 0; i < option_Unit_tier.length; i++) {
          if (unitSelected.Unit_tier != option_Unit_tier[i]) {
            let option = document.createElement("option");
            option.value = option_Unit_tier[i];
            option.text = option_Unit_tier[i];
            input_Unit_tier.appendChild(option);
          }
        }
        formChangeUnit.appendChild(input_Unit_tier);

        // Unit_type
        let input_Unit_type = createHTMLElement("select", "changeUnitType");
        const index = ListUnitType.findIndex((unit) => unit.fr === unitSelected.Unit_type.fr && unit.en === unitSelected.Unit_type.en);
        let defaultoptiontype = document.createElement("option");
        defaultoptiontype.text = "Type : " + ListUnitType[index].en;
        defaultoptiontype.value = "";
        input_Unit_type.appendChild(defaultoptiontype);
        for (let i = 0; i < ListUnitType.length; i++) {
          if (unitSelected.Unit_type != ListUnitType[i].fr) {
            let option = document.createElement("option");
            option.text = ListUnitType[i].en;
            option.value = ListUnitType[i].fr;
            input_Unit_type.appendChild(option);
          }
        }
        formChangeUnit.appendChild(input_Unit_type);

        // Unit_img
        let input_Unit_img = createHTMLElement("input", "changeUnitimg");
        input_Unit_img.type = "file";
        input_Unit_img.lang = "fr";
        input_Unit_img.accept = ".jpg, .jpeg, .png";
        formChangeUnit.appendChild(input_Unit_img);

        // button
        let buttonChangeUnit = createHTMLElement("button", "buttonChangeUnit");
        buttonChangeUnit.textContent = "Modifier l'unité";
        formChangeUnit.appendChild(buttonChangeUnit);

        let divChangeUnit = document.getElementById("divChangeUnit");
        divChangeUnit.appendChild(formChangeUnit);
      }

      document.getElementById("formchangeUnit").addEventListener("submit", async (event) => {
        event.preventDefault();
        // fenetre de confirmation
        const userConfirmed = await confirmwindows(`Confirm unit modification "${unitSelected.Unit_name.en}" ?`);
        if (userConfirmed) {
          const now = new Date();
          if (now - timerThrottlebutton > 500) {
            timerThrottlebutton = now;
            adminitrateBot("buttonChangeUnit");
          }
        }
      });
    }
  });

  // Ajouter une nouvelle arme (new class)
  document.getElementById("buttonNewclass").addEventListener("click", async (event) => {
    event.preventDefault();
    // fenetre de confirmation
    if (document.getElementById("nameNewclassEN").value.trim() !== "" && document.getElementById("nameNewclassFR").value.trim() !== "") {
      const userConfirmed = await confirmwindows(`Confirm the addition of the weapon "${document.getElementById("nameNewclassEN").value}" ?`);
      if (userConfirmed) {
        const now = new Date();
        if (now - timerThrottlebutton > 500) {
          timerThrottlebutton = now;
          adminitrateBot("buttonNewclass");
        }
      }
    } else {
      showNotification("Please complete all weapon fields.", "error");
    }
  });

  if (acces) {
    // Envoie d'une information Discord
    document.getElementById("forminformationDiscord").addEventListener("submit", async (event) => {
      event.preventDefault();
      // fenetre de confirmation
      if (document.getElementById("informationDiscordEN").value.trim() !== "" && document.getElementById("informationDiscordFR").value.trim() !== "") {
        const userConfirmed = await confirmwindows(`Confirm send information Discord ?`);
        if (userConfirmed) {
          const now = new Date();
          if (now - timerThrottlebutton > 500) {
            timerThrottlebutton = now;
            adminitrateBot("buttoninformationDiscord");
          }
        }
      } else {
        showNotification("Please complete all fields.", "error");
      }
    });

    // Envoie d'un DM Discord
    document.getElementById("formDmDiscord").addEventListener("submit", async (event) => {
      event.preventDefault();
      // fenetre de confirmation
      if (document.getElementById("inputDmDiscord").value.trim() !== "" && document.getElementById("DmDiscord").value.trim() !== "") {
        const userConfirmed = await confirmwindows(`Confirm send DM Discord ?`);
        if (userConfirmed) {
          const now = new Date();
          if (now - timerThrottlebutton > 500) {
            timerThrottlebutton = now;
            adminitrateBot("buttonDmDiscord");
          }
        }
      } else {
        showNotification("Please complete all fields.", "error");
      }
    });
  }
}

// option et le name du button cliquer
async function adminitrateBot(option) {
  let dataToSend = {};

  if (option === "buttonNewclass") {
    dataToSend.newWeapon = {};
    dataToSend.informationDiscord = false;
    dataToSend.newWeapon.en = document.getElementById("nameNewclassEN").value.trim();
    dataToSend.newWeapon.fr = document.getElementById("nameNewclassFR").value.trim();
    if (dataToSend.newWeapon.en == "" || dataToSend.newWeapon.fr == "") {
      showNotification("Please complete all weapon fields.", "error");
      return;
    }
    sendData(dataToSend);
  } else if (option === "buttoninformationDiscord") {
    dataToSend.newWeapon = {};
    dataToSend.informationDiscord = true;
    dataToSend.newWeapon.en = document.getElementById("informationDiscordEN").value.trim();
    dataToSend.newWeapon.fr = document.getElementById("informationDiscordFR").value.trim();
    if (dataToSend.newWeapon.en == "" || dataToSend.newWeapon.fr == "") {
      showNotification("Please complete all information fields.", "error");
      return;
    }
    sendData(dataToSend);
  } else if (option === "buttonDmDiscord") {
    dataToSend.newWeapon = {};
    dataToSend.dmDiscord = true;
    dataToSend.newWeapon.en = document.getElementById("inputDmDiscord").value.trim();
    dataToSend.newWeapon.fr = document.getElementById("DmDiscord").value.trim();
    if (dataToSend.newWeapon.en == "" || dataToSend.newWeapon.fr == "") {
      showNotification("Please complete all information fields.", "error");
      return;
    }
    sendData(dataToSend);
  } else {
    let formData = new FormData();

    // create Unit
    if (option === "buttonNewUnit") {
      let createUnit = {
        Unit_name: {},
        Unit_type: {},
      };
      const inputvalue_name_en = document.getElementById("nameNewUnitEN").value;
      createUnit.Unit_name.en = removeHTMLTags(inputvalue_name_en);
      const inputvalue_name_fr = document.getElementById("nameNewUnitFR").value;
      createUnit.Unit_name.fr = removeHTMLTags(inputvalue_name_fr);
      createUnit.Unit_influence = document.getElementById("influNewUnit").value;
      if (dataToSend.Unit_influence > 500) {
        showNotification("Impossible influence.", "error");
        return;
      }
      createUnit.Unit_lvlMax = document.getElementById("lvlMaxNewUnit").value;
      if (dataToSend.Unit_lvlMax > 50) {
        showNotification("Max unit level impossible.", "error");
        return;
      }
      createUnit.Unit_tier = document.getElementById("tierNewUnit").value;
      createUnit.Unit_type.fr = document.getElementById("typeNewUnit").value;
      if (checkedRadioValue_Unit_maitrise) {
        createUnit.Unit_maitrise = "1";
      } else {
        createUnit.Unit_maitrise = "0";
      }

      dataToSend.createUnit = createUnit;
      formData.append("data", JSON.stringify(dataToSend));

      let input_new_img = document.getElementById("imgNewUnit");
      if (input_new_img.files && input_new_img.files[0]) {
        let file = input_new_img.files[0];
        let fileName = file.name;

        // Vérification du nom de fichier : autorise lettres, chiffres, -, _, .
        let validFileName = /^[a-zA-Z0-9_.-]+$/.test(fileName);
        if (!validFileName) {
          showNotification("The image file name must not contain special characters.", "error");
          return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
          var image = new Image();
          image.src = e.target.result;
          formData.append("image", input_new_img.files[0]);

          if (createUnit.Unit_name === "" || createUnit.Unit_influence === "" || createUnit.Unit_lvlMax === "" || createUnit.Unit_tier === "" || createUnit.Unit_type === "") {
            showNotification("Please complete all fields to create the new unit", "error");
          } else if (createUnit.Unit_influence < 0 || createUnit.Unit_influence > 500 || createUnit.Unit_lvlMax < 0 || createUnit.Unit_lvlMax > 50) {
            showNotification("Problem entering data in a field to create a new unit", "error");
          } else {
            sendFormData(formData);
          }
        };
        // Démarrer la lecture du fichier
        reader.readAsDataURL(input_new_img.files[0]);
      } else {
        showNotification("Please fill in all the fields and add the image to create the new unit.", "error");
      }
    }

    // change Unit
    if (option === "buttonChangeUnit") {
      let changeUnit = {
        Unit_name: {},
        New_unit_name: {},
        Unit_type: {},
      };
      // changeUnit.Unit_name = removeHTMLTags(document.getElementById('selectChangeUnit').value);
      const inputvalue_name = document.getElementById("selectChangeUnit").value;
      changeUnit.Unit_name.fr = removeHTMLTags(inputvalue_name);
      // nouveau nom d'unité
      changeUnit.New_unit_name.en = removeHTMLTags(document.getElementById("changeUnitNameEN").value);
      changeUnit.New_unit_name.fr = removeHTMLTags(document.getElementById("changeUnitNameFR").value);

      // Tier de l'unité
      changeUnit.Unit_tier = document.getElementById("changeUnitTier").value;

      // Type de l'unité
      changeUnit.Unit_type.fr = document.getElementById("changeUnitType").value;

      // influence unit
      changeUnit.Unit_influence = document.getElementById("changeUnitInfluence").value;
      if (changeUnit.Unit_influence > 500 || changeUnit.Unit_influence < 0) {
        showNotification("Impossible influence.", "error");
        return;
      }
      changeUnit.Unit_lvlMax = document.getElementById("changeUnitLvlMax").value;
      if (changeUnit.Unit_lvlMax > 50 || changeUnit.Unit_lvlMax < 0) {
        showNotification("Max unit level impossible.", "error");
        return;
      }

      const checkboxChangeUnitMaitrise = document.getElementById("changeUnitMaitrise");
      if (checkboxChangeUnitMaitrise != null && checkboxChangeUnitMaitrise.checked) {
        changeUnit.Unit_maitrise = checkboxChangeUnitMaitrise.value;
      } else {
        changeUnit.Unit_maitrise = "";
      }

      dataToSend.changeUnit = changeUnit;
      formData.append("data", JSON.stringify(dataToSend));

      let input_change_img = document.getElementById("changeUnitimg");
      if (input_change_img.files && input_change_img.files[0]) {
        let file = input_change_img.files[0];
        let fileName = file.name;

        // Vérification du nom de fichier : autorise lettres, chiffres, -, _, .
        let validFileName = /^[a-zA-Z0-9_.-]+$/.test(fileName);
        if (!validFileName) {
          showNotification("The image file name must not contain special characters.", "error");
          return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
          let image = new Image();
          image.src = e.target.result;
          formData.append("image", input_change_img.files[0]);
          sendFormData(formData);
        };
        reader.readAsDataURL(input_change_img.files[0]);
      } else if (
        changeUnit.New_unit_name.en == "" &&
        changeUnit.New_unit_name.fr == "" &&
        changeUnit.Unit_influence == "" &&
        changeUnit.Unit_lvlMax == "" &&
        changeUnit.Unit_tier == "" &&
        changeUnit.Unit_type.fr == "" &&
        !checkboxChangeUnitMaitrise.checked
      ) {
        showNotification("Please complete at least one field or upload an image to update the unit " + changeUnit.Unit_name, "error");
      } else {
        // si send des data uniquement
        sendFormData(formData);
      }
    }
  }
}

async function sendData(dataToSend) {
  // console.log('dataToSend : ', dataToSend);
  const currenthouse = localStorage.getItem("user_house");

  const update = await fetch(adressAPI + "UpdateAdmin/?house=" + currenthouse, {
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
      console.error("Erreur avec les données:", error);
    });

  if (update.Gestion.Logged && update.Gestion.Admin) {
    const translate = await loadTranslate(update.UserInfo.Language);
    containerAppAdmin(update, translate);
  } else {
    fetchlogout();
  }
}

async function sendFormData(formData) {
  const currenthouse = localStorage.getItem("user_house");

  // console.log('formData : ', formData);
  const update = await fetch(adressAPI + "adminitrateBot/?house=" + currenthouse, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur de réseau: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi de l'image et des données:", error);
    });

  // console.log("update :", update);
  if (update.Gestion.Logged && update.Gestion.Admin) {
    const translate = await loadTranslate(update.UserInfo.Language);
    containerAppAdmin(update, translate);
  } else {
    fetchlogout();
  }
}
