import { adressAPI, loadModule } from "./config.js";
const { communBlock, confirmwindows, createHTMLElement, fetchServer, fetchlogout } = await loadModule("useful.js");
const { showNotification } = await loadModule("notification.js");
const { loadTranslate } = await loadModule("translate.js");

let timerThrottlebutton = 0;

export async function settingbot() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("settingbot/?house=" + currenthouse);
    if (data.Gestion.Logged && data.Gestion.Officier) {
      const translate = await loadTranslate(data.UserInfo.Language);
      containerSettingbot(data, translate);
    } else {
      fetchlogout();
    }
  }
}

function containerSettingbot(data, translate) {
  communBlock(data, translate);

  let Container = document.getElementById("Container");
  Container.innerHTML = "";

  const subcontainer = createHTMLElement("div", "subcontainerSetting");
  let divSetting = createHTMLElement("div", "divSetting");
  let titleSetting = createHTMLElement("div", "titleSetting");
  titleSetting.textContent = "Paramétre du bot Discord";
  divSetting.appendChild(titleSetting);

  let formSetting = document.createElement("form");
  formSetting.id = "formSetting";
  formSetting.className = "formSetting";
  // Nom de la maison
  let House_name = createHTMLElement("div", "subsetting");
  let titleHouse_name = createHTMLElement("div", "titleHouse_name");
  titleHouse_name.textContent = translate.settingbot.name;
  House_name.appendChild(titleHouse_name);
  let input_settingname = createHTMLElement("input", "input_settingname");
  input_settingname.placeholder = data.Settingbot.House_name;
  House_name.appendChild(input_settingname);
  formSetting.appendChild(House_name);

  // Langage
  let House_Langage = createHTMLElement("div", "subsetting");
  let titleHouse_Langage = createHTMLElement("div", "titleHouse_Langage");
  titleHouse_Langage.textContent = translate.settingbot.Langage;
  House_Langage.appendChild(titleHouse_Langage);
  let selectHouseLangage = document.createElement("select");
  selectHouseLangage.id = "input_settingHouseLangage";
  selectHouseLangage.className = "input_settingHouseLangage";
  Object.values(translate.commun.Langage).forEach(([code, label]) => {
    let option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    if (code === data.Settingbot.Langage) {
      option.selected = true;
    }
    selectHouseLangage.appendChild(option);
  });
  House_Langage.appendChild(selectHouseLangage);
  formSetting.appendChild(House_Langage);

  formSetting.appendChild(separator());
  let explain = document.createElement("p");
  explain.innerHTML = `${translate.settingbot.tutoID} <a href="https://www.youtube.com/watch?v=KVLdpboY7bg" target="_blank">https://www.youtube.com/watch?v=KVLdpboY7bg</a>`;
  formSetting.appendChild(explain);

  // ID_Chan_GvG
  let ID_Chan_GvG = createHTMLElement("div", "subsetting");
  let titleID_Chan_GvG = createHTMLElement("div", "titleID_Chan_GvG");
  titleID_Chan_GvG.textContent = translate.settingbot.ID_Chan_GvG;
  ID_Chan_GvG.appendChild(titleID_Chan_GvG);
  let input_settingChanGvG = createHTMLElement("input", "input_settingChanGvG");
  input_settingChanGvG.placeholder = data.Settingbot.ID_Chan_GvG;
  ID_Chan_GvG.appendChild(input_settingChanGvG);
  formSetting.appendChild(ID_Chan_GvG);

  // ID_Chan_Users
  let ID_Chan_Users = createHTMLElement("div", "subsetting");
  let titleID_Chan_Users = createHTMLElement("div", "titleID_Chan_Users");
  titleID_Chan_Users.textContent = translate.settingbot.ID_Chan_Users;
  ID_Chan_Users.appendChild(titleID_Chan_Users);
  let input_settingChanUser = createHTMLElement("input", "input_settingChanUser");
  input_settingChanUser.placeholder = data.Settingbot.ID_Chan_Users;
  ID_Chan_Users.appendChild(input_settingChanUser);
  formSetting.appendChild(ID_Chan_Users);

  // ID_Chan_Gestion
  let ID_Chan_Gestion = createHTMLElement("div", "subsetting");
  let titleID_Chan_Gestion = createHTMLElement("div", "titleID_Chan_Gestion");
  titleID_Chan_Gestion.textContent = translate.settingbot.ID_Chan_Gestion;
  ID_Chan_Gestion.appendChild(titleID_Chan_Gestion);
  let input_settingchangestion = createHTMLElement("input", "input_settingchangestion");
  input_settingchangestion.placeholder = data.Settingbot.ID_Chan_Gestion;
  ID_Chan_Gestion.appendChild(input_settingchangestion);
  formSetting.appendChild(ID_Chan_Gestion);

  formSetting.appendChild(separator());
  let explain2 = document.createElement("p");
  explain2.innerHTML = explain.innerHTML;
  formSetting.appendChild(explain2);

  // ID_Group_Users
  let ID_Group_Users = createHTMLElement("div", "subsetting");
  let titleID_Group_Users = createHTMLElement("div", "titleID_Group_Users");
  titleID_Group_Users.textContent = translate.settingbot.ID_Group_Users;
  ID_Group_Users.appendChild(titleID_Group_Users);
  let input_settinggroupUser = createHTMLElement("input", "input_settinggroupUser");
  input_settinggroupUser.placeholder = data.Settingbot.ID_Group_Users;
  ID_Group_Users.appendChild(input_settinggroupUser);
  formSetting.appendChild(ID_Group_Users);

  // ID_Group_Officier
  let ID_Group_Officier = createHTMLElement("div", "subsetting");
  let titleID_Group_Officier = createHTMLElement("div", "titleID_Group_Officier");
  titleID_Group_Officier.textContent = translate.settingbot.ID_Group_Officier;
  ID_Group_Officier.appendChild(titleID_Group_Officier);
  let input_settinggroupOff = createHTMLElement("input", "input_settinggroupOff");
  input_settinggroupOff.placeholder = data.Settingbot.ID_Group_Officier;
  ID_Group_Officier.appendChild(input_settinggroupOff);
  formSetting.appendChild(ID_Group_Officier);

  formSetting.appendChild(separator());

  // Late
  let Late = createHTMLElement("div", "subsetting");
  let titleLate = document.createElement("div");
  titleLate.textContent = translate.settingbot.Late;
  Late.appendChild(titleLate);
  let switchLate = createHTMLElement("div", "switchLate");
  switchLate.textContent = data.Settingbot.Late === 1 ? "On" : "Off";
  switchLate.value = data.Settingbot.Late === 1 ? "On" : "Off";
  switchLate.style.backgroundColor = data.Settingbot.Late === 1 ? "#4CAF50" : "#f44336";
  Late.appendChild(switchLate);
  formSetting.appendChild(Late);

  let explainLate = document.createElement("p");
  explainLate.textContent = translate.settingbot.explainLate;
  formSetting.appendChild(explainLate);

  // Recall_GvG
  let Recall_GvG = createHTMLElement("div", "subsetting");
  let titleRecall_GvG = document.createElement("div");
  titleRecall_GvG.textContent = translate.settingbot.Recall_GvG;
  Recall_GvG.appendChild(titleRecall_GvG);
  let switchRecall_GvG = createHTMLElement("div", "switchRecall_GvG");
  switchRecall_GvG.textContent = data.Settingbot.Recall_GvG === 1 ? "On" : "Off";
  switchRecall_GvG.value = data.Settingbot.Recall_GvG === 1 ? "On" : "Off";
  switchRecall_GvG.style.backgroundColor = data.Settingbot.Recall_GvG === 1 ? "#4CAF50" : "#f44336";
  Recall_GvG.appendChild(switchRecall_GvG);
  formSetting.appendChild(Recall_GvG);

  let explainRecall_GvG = document.createElement("p");
  explainRecall_GvG.textContent = translate.settingbot.explainRecall_GvG;
  formSetting.appendChild(explainRecall_GvG);

  // Allumage
  let Allumage = createHTMLElement("div", "subsetting");
  let titleAllumage = document.createElement("div");
  titleAllumage.textContent = translate.settingbot.Allumage;
  Allumage.appendChild(titleAllumage);
  let switchAllumage = createHTMLElement("div", "switchAllumage");
  switchAllumage.textContent = data.Settingbot.Allumage === 0 ? "On" : "Off";
  switchAllumage.value = data.Settingbot.Allumage === 0 ? "On" : "Off";
  switchAllumage.style.backgroundColor = data.Settingbot.Allumage === 0 ? "#4CAF50" : "#f44336";
  Allumage.appendChild(switchAllumage);
  formSetting.appendChild(Allumage);

  let explainAllumage = document.createElement("p");
  explainAllumage.textContent = translate.settingbot.explainAllumage;
  formSetting.appendChild(explainAllumage);

  // Bouton de mise a jour
  let buttonUpdateSetting = createHTMLElement("button", "buttonUpdateSetting");
  buttonUpdateSetting.textContent = translate.settingbot.updateButton;
  buttonUpdateSetting.type = "submit";
  formSetting.appendChild(buttonUpdateSetting);

  divSetting.appendChild(formSetting);
  subcontainer.appendChild(divSetting);
  Container.appendChild(subcontainer);

  // EventListener
  setupSwitch(switchLate);
  setupSwitch(switchRecall_GvG);
  setupSwitch(switchAllumage);
  collectData(data.Settingbot, translate);

  if (data.Gestion.Notification.Notif) {
    showNotification(data.Gestion.Notification.content[data.UserInfo.Language], data.Gestion.Notification.Type);
  }
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 50);
}

function setupSwitch(element) {
  element.addEventListener("click", () => {
    const isOn = element.textContent === "On";
    element.textContent = isOn ? "Off" : "On";
    element.value = isOn ? "Off" : "On";
    element.style.backgroundColor = isOn ? "#f44336" : "#4CAF50";
  });
}

function collectData(dataOrigin, translate) {
  document.getElementById("formSetting").addEventListener("submit", async (event) => {
    event.preventDefault();
    // fenetre de confirmation
    const userConfirmed = await confirmwindows(translate.settingbot.confirm);
    if (userConfirmed) {
      const now = Date.now();
      if (now - timerThrottlebutton > 500) {
        timerThrottlebutton = now;

        const settingsData = {};
        let invalidFields = [];
        // Liste des champs ID Discord
        const discordIDFields = ["input_settingchangestion", "input_settingChanGvG", "input_settingChanUser", "input_settinggroupOff", "input_settinggroupUser"];
        document
          .getElementById("formSetting")
          .querySelectorAll("input, select, .switchLate, .switchRecall_GvG, .switchAllumage")
          .forEach((el) => {
            if (el.tagName === "INPUT") {
              settingsData[el.id] = el.value || el.placeholder;

              if (discordIDFields.includes(el.id) && !isValidDiscordID(settingsData[el.id])) {
                invalidFields.push(el.id);
              }
            } else if (el.tagName === "SELECT") {
              settingsData[el.id] = el.value;
            } else {
              // div switch
              settingsData[el.className] = el.value;
            }
          });

        if (invalidFields.length > 0) {
          showNotification(translate.settingbot.notif.idDiscord, "error");
          return;
        }

        // Envoi des données au backend
        const switchFields = ["Late", "Recall_GvG", "Allumage"];
        const fieldMap = {
          Late: "switchLate",
          Recall_GvG: "switchRecall_GvG",
          Allumage: "switchAllumage",
          House_name: "input_settingname",
          Langage: "input_settingHouseLangage",
          ID_Chan_Gestion: "input_settingchangestion",
          ID_Chan_GvG: "input_settingChanGvG",
          ID_Chan_Users: "input_settingChanUser",
          ID_Group_Officier: "input_settinggroupOff",
          ID_Group_Users: "input_settinggroupUser",
        };
        let dataToSend = {};

        for (let key in dataOrigin) {
          if (key != "House_logo") {
            const settingsKey = fieldMap[key] || key;
            const newValue = settingsData[settingsKey];

            if (switchFields.includes(key)) {
              const oneIsOn = key !== "Allumage"; // Allumage (0 = on), les autres (0 = off)
              const binaryValue = switchToBinary(newValue, oneIsOn);
              if (dataOrigin[key] != binaryValue) {
                dataToSend[key] = binaryValue;
              }
            } else {
              if (dataOrigin[key] != newValue) {
                dataToSend[key] = newValue;
              }
            }
          }
        }

        if (Object.keys(dataToSend).length === 0) {
          showNotification(translate.settingbot.notif.empty, "error");
          return;
        }

        sendData(dataToSend);
      }
    }
  });
}

function isValidDiscordID(value) {
  return /^\d{17,19}$/.test(value);
}

function switchToBinary(value, oneIsOn = true) {
  if (typeof value !== "string") return oneIsOn ? 0 : 1;
  const isOn = value.toLowerCase() === "on";
  return oneIsOn ? (isOn ? 1 : 0) : isOn ? 0 : 1;
}

async function sendData(dataToSend) {
  // console.log("dataToSend : ", dataToSend);
  const currenthouse = localStorage.getItem("user_house");

  const update = await fetch(adressAPI + "updatesettingbot/?house=" + currenthouse, {
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

  if (update.Gestion.Logged && update.Gestion.Officier) {
    // console.log("update : ", update);
    const translate = await loadTranslate(update.UserInfo.Language);
    containerSettingbot(update, translate);
  } else {
    fetchlogout();
  }
}

// Ligne séparatrice
function separator() {
  let separator = document.createElement("hr");
  separator.style.margin = "10px 0";
  return separator;
}
