import { adressAPI } from "./config.js";
import { communBlock, confirmwindows, createHTMLElement, fetchServer, fetchlogout, removeHTMLTags } from "./useful.js";

export async function administration() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    containerAppAdmin(await fetchServer("CheckAppAdmin/?house=" + currenthouse));
  }
}

let checkedRadioValue_Unit_maitrise = "";
function containerAppAdmin(data) {
  if (data.Gestion.Logged && data.Gestion.Admin) {
    communBlock(data);

    const subContainer = createHTMLElement("div", "subContainerbotEtat");

    // -----------------------------------------------
    // -------------- Ajouter une unité --------------
    // -----------------------------------------------
    let divErrorAddUnit = document.createElement("div");
    divErrorAddUnit.id = "divErrorAddUnit";
    divErrorAddUnit.className = "divError";
    divErrorAddUnit.style.display = "none";
    subContainer.appendChild(divErrorAddUnit);

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
    input_Unit_nameEN.required;
    formNewUnit.appendChild(input_Unit_nameEN);
    // Unit_name.FR
    let input_Unit_nameFR = createHTMLElement("input", "nameNewUnitFR");
    input_Unit_nameFR.placeholder = "Name unit (French)";
    input_Unit_nameFR.required;
    formNewUnit.appendChild(input_Unit_nameFR);

    // Unit_influence
    let input_Unit_influence = createHTMLElement("input", "influNewUnit");
    input_Unit_influence.type = "number";
    input_Unit_influence.required;
    input_Unit_influence.placeholder = "Influence unit";
    formNewUnit.appendChild(input_Unit_influence);
    // Unit_lvlMax
    let input_Unit_lvlMax = createHTMLElement("input", "lvlMaxNewUnit");
    input_Unit_lvlMax.type = "number";
    input_Unit_lvlMax.required;
    input_Unit_lvlMax.placeholder = "Level max unit";
    formNewUnit.appendChild(input_Unit_lvlMax);
    // Unit_tier
    let input_Unit_tier = createHTMLElement("select", "tierNewUnit");
    input_Unit_tier.required;
    let title_option_Unit_tier = ["Tier unit", "T3", "T4", "T5"];
    let option_Unit_tier = ["", "T3", "T4", "T5"];
    for (let i = 0; i < option_Unit_tier.length; i++) {
      let option = document.createElement("option");
      option.value = option_Unit_tier[i];
      option.text = title_option_Unit_tier[i];
      input_Unit_tier.appendChild(option);
    }
    formNewUnit.appendChild(input_Unit_tier);
    // Unit_type
    let input_Unit_type = createHTMLElement("select", "typeNewUnit");
    input_Unit_type.required;
    let titleOption_Unit_type = ["Type unit", "Infantry", "Distant", "Cavalry"];
    let option_Unit_type = ["", "Infanterie", "Distant", "Cavalerie"];
    for (let i = 0; i < option_Unit_type.length; i++) {
      let option = document.createElement("option");
      option.value = option_Unit_type[i];
      option.text = titleOption_Unit_type[i];
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
    input_Unit_img.required;
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
    let divErrorChangeUnit = document.createElement("div");
    divErrorChangeUnit.id = "divErrorChangeUnit";
    divErrorChangeUnit.className = "divError";
    divErrorChangeUnit.style.display = "none";
    subContainer.appendChild(divErrorChangeUnit);

    let divChangeUnit = createHTMLElement("div", "divChangeUnit");
    let titleChangeUnit = document.createElement("div");
    titleChangeUnit.className = "titleChangeUnit";
    titleChangeUnit.textContent = "Modify unit";
    divChangeUnit.appendChild(titleChangeUnit);

    let formChangeUnit = createHTMLElement("form", "formchangeUnit");
    formChangeUnit.enctype = "multipart/form-data";
    formChangeUnit.method = "POST";
    let selectChangeUnit = createHTMLElement("select", "selectChangeUnit");
    let defaultChangeUnit = document.createElement("option");
    defaultChangeUnit.value = "";
    defaultChangeUnit.text = "Select";
    selectChangeUnit.appendChild(defaultChangeUnit);
    for (let i = 0; i < data.ListUnit.length; i++) {
      const currentUnit = data.ListUnit[i];

      let option = document.createElement("option");
      option.value = currentUnit.Unit_name[data.UserInfo.Language];
      option.text = currentUnit.Unit_name.fr;
      selectChangeUnit.appendChild(option);
    }
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
    formNewclass.method = "POST";
    // class_name
    let input_class_name_en = createHTMLElement("input", "nameNewclassEN");
    input_class_name_en.placeholder = "Name new weapon (English)";
    input_class_name_en.required;
    formNewclass.appendChild(input_class_name_en);
    let input_class_name_fr = createHTMLElement("input", "nameNewclassFR");
    input_class_name_fr.placeholder = "Name new weapon (French)";
    input_class_name_fr.required;
    formNewclass.appendChild(input_class_name_fr);

    let buttonNewclass = createHTMLElement("button", "buttonNewclass");
    buttonNewclass.textContent = "Add a new weapon";
    buttonNewclass.type = "submit";
    formNewclass.appendChild(buttonNewclass);

    divNewclass.appendChild(formNewclass);
    subContainer.appendChild(divNewclass);

    let Container = document.getElementById("Container");
    Container.innerHTML = "";
    Container.appendChild(subContainer);

    addEventOnAllButton(data.ListUnit);
  } else {
    fetchlogout();
  }
}

let timerThrottlebutton = 0;
function addEventOnAllButton(listUnit) {
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
        let defaultoptiontype = document.createElement("option");
        defaultoptiontype.text = "Type : " + unitSelected.Unit_type;
        defaultoptiontype.value = "";
        input_Unit_type.appendChild(defaultoptiontype);
        let option_Unit_type_EN = ["Infantry", "Distant", "Cavalry"];
        let option_Unit_type_value = ["Infanterie", "Distant", "Cavalerie"];
        for (let i = 0; i < option_Unit_type_value.length; i++) {
          if (unitSelected.Unit_type != option_Unit_type_value[i]) {
            let option = document.createElement("option");
            option.text = option_Unit_type_EN[i];
            option.value = option_Unit_type_value[i];
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
        buttonChangeUnit.type = "submit";
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
    if (document.getElementById("nameNewclassEN").value !== "" && document.getElementById("nameNewclassFR").value !== "") {
      const userConfirmed = await confirmwindows(`Confirm the addition of the weapon "${document.getElementById("nameNewclassEN").value}" ?`);
      if (userConfirmed) {
        const now = new Date();
        if (now - timerThrottlebutton > 500) {
          timerThrottlebutton = now;
          adminitrateBot("buttonNewclass");
        }
      }
    } else {
      alert("Please complete all fields to create the new weapon.");
    }
  });
}

// option et le name du button cliquer
async function adminitrateBot(option) {
  let dataToSend = {
    newWeapon: {}
  };

  if (option === "buttonNewclass") {
    dataToSend.newWeapon.en = document.getElementById("nameNewclassEN").value;
    dataToSend.newWeapon.fr = document.getElementById("nameNewclassFR").value;
    sendData(dataToSend);
  } else {
    let formData = new FormData();

    // create Unit
    if (option === "buttonNewUnit") {
      let createUnit = {
        Unit_name: {}
      };
      const inputvalue_name_en = document.getElementById("nameNewUnitEN").value;
      createUnit.Unit_name.en = removeHTMLTags(inputvalue_name_en);
      const inputvalue_name_fr = document.getElementById("nameNewUnitFR").value;
      createUnit.Unit_name.fr = removeHTMLTags(inputvalue_name_fr);
      createUnit.Unit_influence = document.getElementById("influNewUnit").value;
      if (dataToSend.Unit_influence > 500) {
        alert("Impossible influence.");
        return;
      }
      createUnit.Unit_lvlMax = document.getElementById("lvlMaxNewUnit").value;
      if (dataToSend.Unit_lvlMax > 50) {
        alert("Max unit level impossible.");
        return;
      }
      createUnit.Unit_tier = document.getElementById("tierNewUnit").value;
      createUnit.Unit_type = document.getElementById("typeNewUnit").value;
      if (checkedRadioValue_Unit_maitrise) {
        createUnit.Unit_maitrise = "1";
      } else {
        createUnit.Unit_maitrise = "0";
      }

      dataToSend.createUnit = createUnit;
      formData.append("data", JSON.stringify(dataToSend));

      let input_new_img = document.getElementById("imgNewUnit");
      if (input_new_img.files && input_new_img.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          var image = new Image();
          image.src = e.target.result;
          formData.append("image", input_new_img.files[0]);

          if (createUnit.Unit_name === "" || createUnit.Unit_influence === "" || createUnit.Unit_lvlMax === "" || createUnit.Unit_tier === "" || createUnit.Unit_type === "") {
            let divError = document.getElementById("divErrorAddUnit");
            divError.textContent = "Please complete all fields to create the new unit";
            divError.style.display = "block";
          } else if (createUnit.Unit_influence < 0 || createUnit.Unit_influence > 500 || createUnit.Unit_lvlMax < 0 || createUnit.Unit_lvlMax > 50) {
            let divError = document.getElementById("divErrorAddUnit");
            divError.textContent = "Problem entering data in a field to create a new unit";
            divError.style.display = "block";
          } else {
            sendFormData(formData);
            window.location.href = "/AppAdmin";
          }
        };
        // Démarrer la lecture du fichier
        reader.readAsDataURL(input_new_img.files[0]);
      } else {
        let divError = document.getElementById("divErrorAddUnit");
        divError.textContent = "Please fill in all the fields and add the image to create the new unit.";
        divError.style.display = "block";
      }
    }

    // change Unit
    if (option === "buttonChangeUnit") {
      let changeUnit = {
        Unit_name: {},
        New_unit_name: {}
      };
      // changeUnit.Unit_name = removeHTMLTags(document.getElementById('selectChangeUnit').value);
      const inputvalue_name = document.getElementById("selectChangeUnit").value;
      changeUnit.Unit_name.fr = removeHTMLTags(inputvalue_name);
      // nouveau nom d'unité
      changeUnit.New_unit_name.en = removeHTMLTags(document.getElementById("changeUnitNameEN").value);
      changeUnit.New_unit_name.fr = removeHTMLTags(document.getElementById("changeUnitNameFR").value);

      // influence unit
      changeUnit.Unit_influence = document.getElementById("changeUnitInfluence").value;
      if (changeUnit.Unit_influence > 500 || changeUnit.Unit_influence < 0) {
        alert("Impossible influence.");
        return;
      }
      changeUnit.Unit_lvlMax = document.getElementById("changeUnitLvlMax").value;
      if (changeUnit.Unit_lvlMax > 50 || changeUnit.Unit_lvlMax < 0) {
        alert("Max unit level impossible.");
        return;
      }
      changeUnit.Unit_tier = document.getElementById("changeUnitTier").value;

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
        var reader = new FileReader();

        reader.onload = function (e) {
          let image = new Image();
          image.src = e.target.result;
          formData.append("image", input_change_img.files[0]);
          sendFormData(formData);
          window.location.href = "/AppAdmin";
        };
        reader.readAsDataURL(input_change_img.files[0]);
      } else if (changeUnit.New_unit_name.en == "" && changeUnit.New_unit_name.fr == "" && changeUnit.Unit_influence == "" && changeUnit.Unit_lvlMax == "" && changeUnit.Unit_tier == "" && !checkboxChangeUnitMaitrise.checked) {
        let divErrorChangeUnit = document.getElementById("divErrorChangeUnit");
        divErrorChangeUnit.textContent = "Please complete at least one field or upload an image to update the unit " + changeUnit.Unit_name;
        divErrorChangeUnit.style.display = "block";
      } else {
        // si send des data uniquement
        sendFormData(formData);
        window.location.href = "/AppAdmin";
      }
    }
  }
}

function sendData(dataToSend) {
  // console.log('dataToSend : ', dataToSend);
  const currenthouse = localStorage.getItem("user_house");

  fetch(adressAPI + "UpdateAdmin/?house=" + currenthouse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  }).catch((error) => {
    console.error("Erreur avec les données:", error);
  });

  // rechargement de page aprés modification
  window.location.href = "/AppAdmin";
}

function sendFormData(formData) {
  const currenthouse = localStorage.getItem("user_house");

  // console.log('formData : ', formData);
  fetch(adressAPI + "adminitrateBot/?house=" + currenthouse, {
    method: "POST",
    body: formData,
  }).catch((error) => {
    console.error("Erreur lors de l'envoi de l'image et des données:", error);
  });
}
