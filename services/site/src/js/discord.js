import { adressAPI } from "./config.js";

// récupération des tokens
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [fragment.get("access_token"), fragment.get("token_type")];
let secretsUser = `${tokenType} ${accessToken}`;

// récupération des data sur l'api discord
fetch("https://discord.com/api/users/@me", {
  headers: {
    authorization: `${secretsUser}`,
  },
})
  .then((result) => result.json())
  .then(async (response) => {
    const { username, id } = response;
    // Envoie des informations au serveur
    try {
      const data = await checkid(id, username);
      // console.log("data discord.js : ", data);
      if (data && data.Gestion && data.Gestion.Notification) {
        localStorage.setItem("notif", JSON.stringify(data.Gestion.Notification));
      }
      window.location.href = data.Gestion.Redirect;
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  })
  .catch(console.error);

async function checkid(id, username) {
  // Récupération des informations saisies dans le formulaire
  const dataToSend = { id, username };

  const response = await fetch(adressAPI + "discord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  });

  if (!response.ok) {
    throw new Error(`Erreur de réseau: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
