import { communBlock, createHTMLElement, fetchServer, fetchlogout } from "./useful.js";
import { loadTranslate } from "./translate.js";

export async function stat() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("statGvG/?house=" + currenthouse);
    if (data.Gestion.Logged && data.Gestion.Officier) {
      const translate = await loadTranslate(data.UserInfo.Language);
      containerstat(data, translate);
    } else {
      fetchlogout();
    }
  }
}

function containerstat(data, translate) {
  communBlock(data, translate);

  let subContainerStat = createHTMLElement("div", "subContainerStat");

  let ListFilter = [
    ["sortuserbyname", "statname"],
    ["sortuserbyinflu", "statinfluence"],
    ["sortuserbylevel", "statlvl"],
    ["sortuserbyclass", "statclass"],
    ["sortuserbynbgvg", "statnbgvg"],
    ["sortuserbylastGvG", "statlastgvg"],
  ];
  let filter = createHTMLElement("div", "statfilter");
  // Titre
  let titlefilter = document.createElement("div");
  titlefilter.className = "titlefilter";
  titlefilter.textContent = translate.stat.filter.title;
  filter.appendChild(titlefilter);
  let buttonFilter = document.createElement("div");
  buttonFilter.className = "buttonFilter";
  let divline1 = document.createElement("div");
  divline1.className = "linefilter";
  let divline2 = document.createElement("div");
  divline2.className = "linefilter";

  // filtre par name
  let sortuserbyname = document.createElement("button");
  sortuserbyname.id = "sortuserbyname";
  sortuserbyname.value = 0;
  sortuserbyname.textContent = translate.stat.filter.name;
  divline1.appendChild(sortuserbyname);
  // filtre par influence
  let sortuserbyinflu = document.createElement("button");
  sortuserbyinflu.id = "sortuserbyinflu";
  sortuserbyinflu.value = 0;
  sortuserbyinflu.textContent = translate.stat.filter.influ;
  divline1.appendChild(sortuserbyinflu);
  // filtre par level
  let sortuserbylevel = document.createElement("button");
  sortuserbylevel.id = "sortuserbylevel";
  sortuserbylevel.value = 0;
  sortuserbylevel.textContent = translate.stat.filter.lvl;
  divline1.appendChild(sortuserbylevel);
  // filtre par classe d'arme
  let sortuserbyclass = document.createElement("button");
  sortuserbyclass.id = "sortuserbyclass";
  sortuserbyclass.value = 0;
  sortuserbyclass.textContent = translate.stat.filter.class;
  divline2.appendChild(sortuserbyclass);
  // filtre par classe d'arme
  let sortuserbynbgvg = document.createElement("button");
  sortuserbynbgvg.id = "sortuserbynbgvg";
  sortuserbynbgvg.value = 0;
  sortuserbynbgvg.textContent = translate.stat.filter.nbGvG;
  divline2.appendChild(sortuserbynbgvg);
  // filtre par Derniére GvG
  let sortuserbylastGvG = document.createElement("button");
  sortuserbylastGvG.id = "sortuserbylastGvG";
  sortuserbylastGvG.value = 0;
  sortuserbylastGvG.textContent = translate.stat.filter.lastGvG;
  divline2.appendChild(sortuserbylastGvG);

  buttonFilter.appendChild(divline1);
  buttonFilter.appendChild(divline2);
  filter.appendChild(buttonFilter);
  subContainerStat.appendChild(filter);

  // création des en-tête
  let titledivstat = document.createElement("div");
  titledivstat.classList.add("divTitleStat");
  titledivstat.classList.add("statuser");

  let titleconnected = createHTMLElement("div", "statconnected");
  titleconnected.textContent = "";
  titledivstat.appendChild(titleconnected);

  let titlename = createHTMLElement("div", "statname");
  titlename.textContent = translate.stat.title.name;
  titledivstat.appendChild(titlename);

  let titleclass = createHTMLElement("div", "statclass");
  titleclass.textContent = translate.stat.title.class;
  titledivstat.appendChild(titleclass);

  let titleinfluenceplayer = createHTMLElement("div", "statinfluence");
  titleinfluenceplayer.textContent = translate.stat.title.influ;
  titledivstat.appendChild(titleinfluenceplayer);

  let titlelvlplayer = createHTMLElement("div", "statlvl");
  titlelvlplayer.textContent = translate.stat.title.lvl;
  titledivstat.appendChild(titlelvlplayer);

  let titlenbGvGparticiped = createHTMLElement("div", "statnbgvg");
  titlenbGvGparticiped.textContent = translate.stat.title.nbGvG;
  titledivstat.appendChild(titlenbGvGparticiped);

  let titlelastGvGparticiped = createHTMLElement("div", "statlastgvg");
  titlelastGvGparticiped.textContent = translate.stat.title.lastGvG;
  titledivstat.appendChild(titlelastGvGparticiped);

  subContainerStat.appendChild(titledivstat);
  let subContainerStatForSort = createHTMLElement("div", "subContainerStatForSort");
  subContainerStat.appendChild(subContainerStatForSort);
  // Insere la liste des joueurs
  DisplayUsers(data.ListInscripted, data.UserInfo.Language, subContainerStatForSort);

  document.getElementById("Container").appendChild(subContainerStat);

  createFilterEventlistener(ListFilter);
}

function DisplayUsers(data, Language, div) {
  for (let i = 0; i < data.length; i++) {
    const currentUser = data[i];

    const divstat = createHTMLElement("div", "divstat");
    const statuser = createHTMLElement("div", "statuser");

    const name = createHTMLElement("div", "statname");
    name.textContent = currentUser.Username;
    statuser.appendChild(name);

    const classPlayer = createHTMLElement("div", "statclass");

    classPlayer.textContent = currentUser.GameCharacter[Language];
    statuser.appendChild(classPlayer);

    const influenceplayer = createHTMLElement("div", "statinfluence");
    influenceplayer.textContent = currentUser.Influence;
    statuser.appendChild(influenceplayer);

    const lvlplayer = createHTMLElement("div", "statlvl");
    lvlplayer.textContent = currentUser.Lvl;
    statuser.appendChild(lvlplayer);

    const nbGvGparticiped = createHTMLElement("div", "statnbgvg");
    nbGvGparticiped.textContent = currentUser.NbGvGParticiped + " / " + currentUser.NbTotalGvG;
    statuser.appendChild(nbGvGparticiped);

    const lastGvGparticiped = createHTMLElement("div", "statlastgvg");
    lastGvGparticiped.textContent = currentUser.DateLastGvG[Language];
    statuser.appendChild(lastGvGparticiped);
    divstat.appendChild(statuser);

    div.appendChild(divstat);
  }
}

function createFilterEventlistener(ListFilter) {
  ListFilter.forEach((sortButton) => {
    const button = document.getElementById(sortButton[0]);
    button.addEventListener("click", function () {
      const div = document.getElementById(sortButton[1]);
      sortBy(sortButton[1], div.value);
      if (div.value === 0) {
        div.value = 1;
      } else {
        div.value = 0;
      }
    });
  });
}

// Fonction de trie qui fonctionne pour tous
function sortBy(option = "", order) {
  const statsContainer = document.getElementById("subContainerStatForSort");
  const stats = statsContainer.children;
  // Convertir la collection d'éléments en un tableau pour pouvoir utiliser sort()
  const statsArray = Array.from(stats);

  // Trier les éléments pour le critère spécifié
  statsArray.sort(function (a, b) {
    let valueA = a.querySelector("." + option).textContent.toUpperCase();
    let valueB = b.querySelector("." + option).textContent.toUpperCase();

    // Convertir en nombre si possible
    if (!isNaN(valueA) && !isNaN(valueB)) {
      valueA = parseFloat(valueA);
      valueB = parseFloat(valueB);
    } else {
      // Vérifier si les valeurs sont des dates au format JJ/MM/AAAA
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
      if (datePattern.test(valueA) && datePattern.test(valueB)) {
        valueA = convertToDate(valueA);
        valueB = convertToDate(valueB);
      }
    }

    if (order == 0) {
      if (valueA < valueB) {
        return -1;
      } else if (valueA > valueB) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (valueA > valueB) {
        return -1;
      } else if (valueA < valueB) {
        return 1;
      } else {
        return 0;
      }
    }
  });

  // Effacer l'ancien contenu
  while (statsContainer.firstChild) {
    statsContainer.removeChild(statsContainer.firstChild);
  }

  // Afficher le nouveau contenu
  statsArray.forEach(function (stat) {
    statsContainer.appendChild(stat);
  });
}

// Fonction pour convertir une date au format JJ/MM/AAAA en objet Date
function convertToDate(dateString) {
  const [day, month, year] = dateString.split("/").map((part) => parseInt(part, 10));
  return new Date(year, month - 1, day);
}
