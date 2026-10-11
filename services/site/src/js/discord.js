import { adressAPI } from "./config.js";

// récupération du jeton Discord (fragment de l'URL)
const fragment = new URLSearchParams(window.location.hash.slice(1));
const accessToken = fragment.get("access_token");
const expectedState = sessionStorage.getItem("discord_oauth_state");
sessionStorage.removeItem("discord_oauth_state");
// Le jeton ne doit pas rester dans l'historique
history.replaceState(null, "", window.location.pathname);

// Le serveur vérifie lui-même l'identité auprès de Discord : seul le jeton lui est transmis
(async () => {
  // state absent ou différent : connexion non initiée par cet onglet (CSRF de connexion)
  if (!accessToken || !expectedState || fragment.get("state") !== expectedState) {
    window.location.href = "/";
    return;
  }
  try {
    const data = await checkid(accessToken);
    if (data && data.Gestion && data.Gestion.Notification) {
      localStorage.setItem("notif", JSON.stringify(data.Gestion.Notification));
    }
    window.location.href = data.Gestion.Redirect;
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    window.location.href = "/";
  }
})();

async function checkid(accessToken) {
  const dataToSend = { access_token: accessToken };

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
