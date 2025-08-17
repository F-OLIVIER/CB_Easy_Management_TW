import { loadModule } from "./config.js";
const { communBlock_notconnected, lang_select } = await loadModule("useful.js");
const { loadTranslate } = await loadModule("translate.js");


export async function mention() {
  const language = localStorage.getItem("selectedLang") || "en";
  document.getElementById("lang-select").value = language;

  const translate = await loadTranslate(language);

  communBlock_notconnected(translate);
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

  function createParagraph(items) {
    const p = document.createElement("p");
    items.forEach((item) => {
      if (item === "") {
        p.appendChild(document.createElement("br"));
      } else {
        const div = document.createElement("div");
        div.innerHTML = `${item}`;
        p.appendChild(div);
      }
    });
    return p;
  }

  const introTitle = document.createElement("h2");
  introTitle.textContent = translate.mention.intro.title;
  contentDiv.appendChild(introTitle);

  contentDiv.appendChild(createParagraph(translate.mention.intro.content));
  contentDiv.appendChild(createList(translate.mention.listapp));

  const presentationTitle = document.createElement("h2");
  presentationTitle.textContent = translate.mention.presentation.title;
  contentDiv.appendChild(presentationTitle);

  const presentationParagraph = document.createElement("p");
  presentationParagraph.innerHTML = translate.mention.presentation.content;
  contentDiv.appendChild(presentationParagraph);

  const accesTitle = document.createElement("h2");
  accesTitle.textContent = translate.mention.acces.title;
  contentDiv.appendChild(accesTitle);

  contentDiv.appendChild(createParagraph(translate.mention.acces.content));

  const collectedInfoTitle = document.createElement("h2");
  collectedInfoTitle.textContent = translate.mention.collect.title;
  contentDiv.appendChild(collectedInfoTitle);

  const collectedInfoParagraph = document.createElement("p");
  collectedInfoParagraph.textContent = translate.mention.collect.content;
  contentDiv.appendChild(collectedInfoParagraph);

  contentDiv.appendChild(createList(translate.mention.collect.list));

  const cookiesTitle = document.createElement("h2");
  cookiesTitle.textContent = translate.mention.cookie.title;
  contentDiv.appendChild(cookiesTitle);

  const cookiesParagraph = document.createElement("p");
  cookiesParagraph.innerHTML = translate.mention.cookie.content;
  contentDiv.appendChild(cookiesParagraph);

  const usageTitle = document.createElement("h2");
  usageTitle.textContent = translate.mention.use.title;
  contentDiv.appendChild(usageTitle);

  const usageParagraph = document.createElement("p");
  usageParagraph.textContent = translate.mention.use.content;
  contentDiv.appendChild(usageParagraph);

  const storageTitle = document.createElement("h2");
  storageTitle.textContent = translate.mention.storage.title;
  contentDiv.appendChild(storageTitle);

  const storageParagraph = document.createElement("p");
  storageParagraph.innerHTML = translate.mention.storage.content;
  contentDiv.appendChild(storageParagraph);

  const protectionTitle = document.createElement("h2");
  protectionTitle.textContent = translate.mention.rgpd.title;
  contentDiv.appendChild(protectionTitle);

  const protectionParagraph = document.createElement("p");
  protectionParagraph.textContent = translate.mention.rgpd.content;
  contentDiv.appendChild(protectionParagraph);

  const sharingTitle = document.createElement("h2");
  sharingTitle.id = "author";
  sharingTitle.textContent = translate.mention.share.title;
  contentDiv.appendChild(sharingTitle);

  const sharingParagraph = document.createElement("p");
  sharingParagraph.textContent = translate.mention.share.content;
  contentDiv.appendChild(sharingParagraph);

  const creatorTitle = document.createElement("h2");
  creatorTitle.textContent = translate.mention.author.title;
  contentDiv.appendChild(creatorTitle);

  const creatorParagraph = document.createElement("p");
  creatorParagraph.innerHTML = translate.mention.author.content;
  contentDiv.appendChild(creatorParagraph);

  const rightsTitle = document.createElement("h2");
  rightsTitle.textContent = translate.mention.image_right.title;
  contentDiv.appendChild(rightsTitle);

  const rightsParagraph = document.createElement("p");
  rightsParagraph.innerHTML = translate.mention.image_right.content;
  contentDiv.appendChild(rightsParagraph);

  const hostTitle = document.createElement("h2");
  hostTitle.textContent = translate.mention.host.title;
  contentDiv.appendChild(hostTitle);

  const hostParagraph = document.createElement("p");
  hostParagraph.innerHTML = translate.mention.host.content;
  contentDiv.appendChild(hostParagraph);

  // Ajoutez le contenu au conteneur principal
  container.appendChild(contentDiv);

  lang_select();

  // Gestion de l'ancre - systéme chrome
  window.onload = function () {
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 1000); // Attendre que l'élément soit inséré
    }
  };

  // Gestion de l'ancre - systéme firefox
  const navEntries = performance.getEntriesByType("navigation");
  const isReload = navEntries.length > 0 ? navEntries[0].type === "reload" : false;
  if (!isReload) {
    document.location.reload(true);
  }
}
