import { communBlock_notconnected } from "./useful.js";
import { translate } from "./translate.js";

export function mention() {
  communBlock_notconnected();
  // Sélectionnez le conteneur principal
  const container = document.getElementById("Container");

  // Créez le contenu principal
  const contentDiv = document.createElement("div");
  contentDiv.className = "mention";

  // Fonction pour créer une liste à partir d'un tableau d'éléments
  function createList(items) {
    const ul = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item}</strong>`;
      ul.appendChild(li);
    });
    return ul;
  }

  // Ajoutez le contenu au div
  const introTitle = document.createElement("h2");
  introTitle.textContent = "Introduction";
  contentDiv.appendChild(introTitle);

  const introParagraph = document.createElement("p");
  introParagraph.textContent = `Cette politique de confidentialité explique comment nous collectons, utilisons, et protégeons vos informations lorsque vous utilisez l'une des 3 applications.
Les 3 applications sont :`;
  contentDiv.appendChild(introParagraph);

  contentDiv.appendChild(createList(["Un bot Discord", "Ce site internet", "Une application mobile"]));

  const authTitle = document.createElement("h2");
  authTitle.textContent = "Identification utilisé dans l'application";
  contentDiv.appendChild(authTitle);

  const authParagraph = document.createElement("p");
  authParagraph.textContent = `Un système d'authentification non-personnelle (c'est-à-dire qui ne permet pas de vous identifier) est utilisé pour vous connecter et utiliser nos applications. Il est associé à votre identifiant unique Discord.`;
  contentDiv.appendChild(authParagraph);

  const collectedInfoTitle = document.createElement("h2");
  collectedInfoTitle.textContent = "Informations collectées";
  contentDiv.appendChild(collectedInfoTitle);

  const collectedInfoParagraph = document.createElement("p");
  collectedInfoParagraph.textContent = "Nous ne collectons aucune information personnel, les informations collecté sont les suivantes :";
  contentDiv.appendChild(collectedInfoParagraph);

  contentDiv.appendChild(
    createList([
      "Informations personnelles : Aucune collecte d'information",
      "Informations d'utilisation : Aucune collecte d'information",
      "Informations de localisation : Aucune collecte d'information",
      "Informations Discord : Votre identifiant, username, photo de profil et les roles discord",
      "Informations de contenu du jeu Conqueror's Blade : les informations des unités (level, maitrise) de votre caserne IG (in game / en jeu) ainsi que de votre héros (level, classe joué, infuence) et de votre présence à la prochaine guerre de territoire",
    ])
  );

  const cookiesTitle = document.createElement("h2");
  cookiesTitle.textContent = "Cookies";
  contentDiv.appendChild(cookiesTitle);

  const cookiesParagraph = document.createElement("p");
  cookiesParagraph.innerHTML = `Le site internet utilise uniquement un cookie de fonctionnement (Cookies strictement nécessaires).
Il n'y a aucun Cookies de performance, Cookies de fonctionnalité ou Cookies de ciblage marketing.`;
  contentDiv.appendChild(cookiesParagraph);

  const usageTitle = document.createElement("h2");
  usageTitle.textContent = "Utilisation des informations";
  contentDiv.appendChild(usageTitle);

  const usageParagraph = document.createElement("p");
  usageParagraph.textContent = "Les informations collectées sont utilisées pour préparer les guerres de territoire (gestion des groupes par exemple).";
  contentDiv.appendChild(usageParagraph);

  const protectionTitle = document.createElement("h2");
  protectionTitle.textContent = "Protection des données";
  contentDiv.appendChild(protectionTitle);

  const protectionParagraph = document.createElement("p");
  protectionParagraph.textContent = `Nous prenons la sécurité de vos données très au sérieux. Nous utilisons des mesures de sécurité standards pour protéger vos informations contre tout accès non autorisé, altération ou divulgation.`;
  contentDiv.appendChild(protectionParagraph);

  const sharingTitle = document.createElement("h2");
  sharingTitle.textContent = "Partage des informations";
  contentDiv.appendChild(sharingTitle);

  const sharingParagraph = document.createElement("p");
  sharingParagraph.textContent = "Nous ne vendons ni ne partageons les informations avec aucun tiers.";
  contentDiv.appendChild(sharingParagraph);

  const creatorTitle = document.createElement("h2");
  creatorTitle.textContent = "Créateur du site";
  contentDiv.appendChild(creatorTitle);

  const creatorParagraph = document.createElement("p");
  creatorParagraph.innerHTML = `Le site internet à été crée et est maintenu par un particulier (OLIVIER Fabien).</br>
Adresse : 76100 Rouen</br>
Email: fabiendeveloppeur76@gmail.com`;
  contentDiv.appendChild(creatorParagraph);

  const rightsTitle = document.createElement("h2");
  rightsTitle.textContent = "Avis sur les droits des contenus de Conqueror's Blade";
  contentDiv.appendChild(rightsTitle);

  const rightsParagraph = document.createElement("p");
  rightsParagraph.textContent = `Les images, logos et autres contenus présents sur ce site appartiennent à leurs propriétaires respectifs. Nous ne revendiquons aucun droit sur ces éléments et ils sont utilisés uniquement à des fins informatives ou illustratives.
Si vous êtes le détenteur des droits d’un contenu et souhaitez qu’il soit modifié ou supprimé, veuillez nous contacter à fabiendeveloppeur76@gmail.com. Nous nous engageons à prendre les mesures nécessaires dans les plus brefs délais.`;
  contentDiv.appendChild(rightsParagraph);

  const hostTitle = document.createElement("h2");
  hostTitle.textContent = "Hébergeur";
  contentDiv.appendChild(hostTitle);

  const hostParagraph = document.createElement("p");
  hostParagraph.innerHTML = `Le site internet ainsi que le bot Discord sont héberger chez SAS PulseHeberg.</br>
Adresse: 9, Boulevard de Strasbourg, 83000 Toulon</br>
Téléphone: +33 (0)4 22 14 13 60</br>
Email: contact@pulseheberg.com</br>
Site internet: <a href="https://pulseheberg.com" target="_blank">https://pulseheberg.com</a>`;
  contentDiv.appendChild(hostParagraph);

  // Ajoutez le contenu au conteneur principal
  container.appendChild(contentDiv);
}
