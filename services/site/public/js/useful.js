import { adressAPI, cookieName, domain, LINK_DISCORD } from "./config.js";
import { loadTranslate } from "./translate.js";

export async function fetchServer(option) {
  try {
    if (!document.cookie.split(";").some((item) => item.trim().startsWith(cookieName + "="))) {
      window.location.href = "/";
      return;
    }

    const response = await fetch(adressAPI + option, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur de réseau: ${response.status}`);
    }

    const data = await response.json();
    // console.log("Data received (" + option + "):", data);
    return data;
  } catch (error) {
    console.error("Data recovery error:", error);
    throw error;
  }
}

export function lang_select() {
  document.getElementById("lang-select").addEventListener("change", function () {
    localStorage.setItem("selectedLang", this.value);
    window.location.reload();
  });
}

export function connected_lang_select() {
  document.getElementById("lang-select").addEventListener("change", function () {
    localStorage.setItem("selectedLang", this.value);

    const currenthouse = localStorage.getItem("user_house");

    fetch(adressAPI + "updatelanguage/?house=" + currenthouse, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Language: this.value,
      }),
    });

    window.location.reload();
  });
}

export async function communBlock_notconnected(translate = "") {
  if (translate == "") {
    const language = localStorage.getItem("selectedLang") || "en";
    translate = await loadTranslate(language);
  }
  createFooter(translate);

  let headerdivuser = document.getElementById("headerdivuser");
  headerdivuser.innerHTML = ``;

  let loginButton = createHTMLElement("button", "loginButton");
  loginButton.type = "submit";
  loginButton.textContent = "Login with Discord";

  // Lien vers l'authentification Discord
  loginButton.onclick = function () {
    window.location.href = LINK_DISCORD;
  };

  headerdivuser.appendChild(loginButton);
}

export async function communBlock(data, translate = "") {
  let language = localStorage.getItem("selectedLang") || "en";
  if (data.UserInfo.Language) {
    language = data.UserInfo.Language;
  }
  document.getElementById("lang-select").value = language;
  if (translate == "") {
    translate = await loadTranslate(language);
  }

  createFooter(translate);
  connected_lang_select();

  let linkhome = document.getElementById("logoheader");
  linkhome.href = "/home";
  linkhome.title = "Dashboard";

  let userConected = document.getElementById("user");
  userConected.innerHTML = ``;
  let divimguserConected = document.createElement("div");
  let imguserConected = document.createElement("img");
  imguserConected.src = data.UserInfo.Photo;
  divimguserConected.className = "userImg";
  divimguserConected.appendChild(imguserConected);
  userConected.appendChild(divimguserConected);

  let disconnect = document.getElementById("disconnect");
  disconnect.innerHTML = ``;
  let Username = document.createElement("div");
  Username.className = "UsernameBandeau";
  Username.textContent = data.UserInfo.Username;
  disconnect.appendChild(Username);

  let button = createHTMLElement("button", "DisconnectButton");
  button.type = "submit";
  button.textContent = translate.commun.disconnected;
  disconnect.appendChild(button);

  DisconnectedButton();
}

let timerThrottlebutton = 0;
function DisconnectedButton() {
  var DisconnectedButton = document.getElementById("DisconnectButton");

  // Fonction gestionnaire d'événements
  function DisconnectedButtonClick() {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;
      document.cookie = cookieName + "=; Max-Age=0; path=/; domain=" + domain + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      fetchlogout();
    }
  }
  DisconnectedButton.addEventListener("click", DisconnectedButtonClick);
}

export function createHTMLElement(type, name) {
  const div = document.createElement(type);
  div.id = name;
  div.className = name;
  return div;
}

export function fetchlogout() {
  fetch(adressAPI + "logout").catch((error) => {
    console.error("Data recovery error:", error);
  });
  window.location.href = "/";
}

// Fonction pour eviter les balises/injections
export function removeHTMLTags(input) {
  return input.replace(/</g, "").replace(/>/g, "");
}

export async function confirmwindows(message) {
  return new Promise((resolve) => {
    const confirm = document.createElement("div");
    confirm.className = "confirm";

    const confirmContent = document.createElement("div");
    confirmContent.className = "confirmContent";

    const confirmMessage = document.createElement("p");
    confirmMessage.textContent = message;
    confirmContent.appendChild(confirmMessage);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "confirmBtn";
    confirmBtn.textContent = "Oui";
    confirmContent.appendChild(confirmBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "cancelBtn";
    cancelBtn.textContent = "Annuler";
    confirmContent.appendChild(cancelBtn);

    confirm.appendChild(confirmContent);
    document.body.appendChild(confirm);

    confirmBtn.onclick = () => {
      confirm.remove();
      resolve(true);
    };

    cancelBtn.onclick = () => {
      confirm.remove();
      resolve(false);
    };
  });
}

function createFooter(translate) {
  if (!document.getElementById("footer")) {
    // Créer l'élément footer
    const footer = document.createElement("footer");
    footer.id = "footer";

    // Créer le conteneur du footer
    const footerContainer = document.createElement("div");
    footerContainer.className = "footer-container";

    translate.footer.sections.forEach((section) => {
      const footerSection = document.createElement("div");
      footerSection.className = "footer-section";

      const h4 = document.createElement("h4");
      h4.textContent = section.title;
      footerSection.appendChild(h4);

      footerSection.innerHTML += section.content;
      footerContainer.appendChild(footerSection);
    });

    // Créer la partie inférieure du footer
    const footerBottom = document.createElement("div");
    footerBottom.className = "footer-bottom";
    footerBottom.innerHTML = translate.footer.bottom;

    // Ajouter les éléments au footer
    footer.appendChild(footerContainer);
    footer.appendChild(footerBottom);

    // Ajouter le footer au document
    document.body.appendChild(footer);
  }
}
