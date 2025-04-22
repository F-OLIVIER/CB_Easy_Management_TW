import { adressAPI } from "./config.js";

// récupération des tokens
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [
  fragment.get("access_token"),
  fragment.get("token_type"),
];
let secretsUser = `${tokenType} ${accessToken}`;

// récupération des data sur l'api discord
fetch("https://discord.com/api/users/@me", {
  headers: {
    authorization: `${secretsUser}`,
  },
})
  .then((result) => result.json())
  .then((response) => {
    const { username, id } = response;
    // envoie des informations au serveur
    checkid(id, username);
  })
  .catch(console.error);

function checkid(id, username) {
  // récupération des informations saisie dans le formulaire
  const dataToSend = { id, username };

  fetch(adressAPI + "discordapp", {
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
    .then((data) => {
      if (typeof data === "object") {
        // console.log("Data received (Register):", data);
        containerforcode(data.Gestion);
      } else {
        throw new Error("Réponse invalide du serveur (non-JSON)");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
    });
}

function containerforcode(data) {
  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let subContainer = document.createElement("div");
  subContainer.className = "subContainerApp";

  // Titre
  let title = document.createElement("h2");
  title.className = "titleApp";
  title.textContent =
    "Voici votre code d'authentification pour l'application mobile `Easy Management TW`";
  subContainer.appendChild(title);

  // Code d'autorisation
  let codeDisplay = document.createElement("div");
  codeDisplay.className = "codeDisplayApp";
  if (data.Logged) {
    codeDisplay.textContent = data.CodeApp;

    // Ajout de l'événement de copie
    codeDisplay.style.cursor = "pointer";
    codeDisplay.title = "Cliquez pour copier";
    codeDisplay.addEventListener("click", () => {
      navigator.clipboard
        .writeText(data.CodeApp)
        .then(() => {
          alert("Code copié dans le presse-papiers !");
        })
        .catch((err) => {
          alert("Échec de la copie : " + err);
        });
    });
  } else {
    codeDisplay.textContent = "Aucun code : non autorisé";
  }
  subContainer.appendChild(codeDisplay);

  // Fin
  let textend = document.createElement("p");
  textend.className = "textendApp";
  textend.textContent =
    "Une fois le code copier dans l'application, vous pouvez fermer cet page";
  subContainer.appendChild(textend);

  Container.appendChild(subContainer);
}

