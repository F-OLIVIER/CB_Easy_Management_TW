import { communBlock, createHTMLElement, fetchServer, fetchlogout } from "./useful.js";
import { loadTranslate } from "./translate.js";

export async function viewgroup() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("creategroup/?house=" + currenthouse);
    if (data.Gestion.Logged && data.Gestion.Officier) {
      const translate = await loadTranslate(data.UserInfo.Language);
      containerviewGroup(data, translate);
    } else {
      fetchlogout();
    }
  }
}

let timerThrottlebutton = 0;
function containerviewGroup(data, translate) {
  communBlock(data, translate);

  let container = document.getElementById("Container");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  let divForImg = document.createElement("div");
  divForImg.className = "divForImg";

  // création des en-tête
  let titledivuser = document.createElement("div");
  titledivuser.classList.add("titledivuser");
  titledivuser.classList.add("divuser");

  let titlename = createHTMLElement("div", "viewtitlename");
  titlename.textContent = translate.view_group.player;
  titledivuser.appendChild(titlename);

  let titleclass = createHTMLElement("div", "titleclass");
  titleclass.textContent = translate.view_group.class;
  titledivuser.appendChild(titleclass);

  let divnameunit = document.createElement("div");
  divnameunit.className = "divnameunit";

  let titleunit1 = document.createElement("div");
  titleunit1.textContent = translate.view_group.unit1;
  divnameunit.appendChild(titleunit1);

  let titleunit2 = document.createElement("div");
  titleunit2.textContent = translate.view_group.unit2;
  divnameunit.appendChild(titleunit2);

  let titleunit3 = document.createElement("div");
  titleunit3.textContent = translate.view_group.unit3;
  divnameunit.appendChild(titleunit3);

  let titleunit4 = document.createElement("div");
  titleunit4.textContent = translate.view_group.unit4;
  divnameunit.appendChild(titleunit4);
  titledivuser.appendChild(divnameunit);

  let containerGroupe = createHTMLElement("div", "containerGroupe");
  let viewgroup = createHTMLElement("div", "viewgroup");
  viewgroup.appendChild(titledivuser);

  // compte le nombre de groupe existant
  let groupNumberMax = 0;
  for (let i = 0; i < data.GroupGvG.length; i++) {
    if (data.GroupGvG[i].GroupNumber > groupNumberMax) {
      groupNumberMax = data.GroupGvG[i].GroupNumber;
    }
  }

  let groupNumber = 1;
  for (let k = 0; k < groupNumberMax; k++) {
    // récupération des utilisateurs present dans le groupe
    const currentGroupe = usersInGroup(data, groupNumber);
    const groupName = "viewgroup" + groupNumber;

    let divGroup = document.createElement("div");
    divGroup.classList.add("divViewGroup");
    divGroup.classList.add(groupName);

    // Nom du groupe
    const divnameUserGroup = createHTMLElement("div", "divnamegroup" + groupNumber);
    divnameUserGroup.classList.add("divnamegroup");

    const nameUserGroup = createHTMLElement("div", "namegroup" + groupNumber);
    nameUserGroup.classList.add("namegroup");
    if (data.NameGroupGvG[groupNumber]) {
      nameUserGroup.textContent = `${translate.view_group.group} ${data.NameGroupGvG[groupNumber]}`;
    } else {
      nameUserGroup.textContent = `${translate.view_group.group} n°${groupNumber}`;
    }
    divGroup.appendChild(nameUserGroup);

    for (let j = 0; j < currentGroupe.length; j++) {
      const currentPlayer = currentGroupe[j];

      let divuser = document.createElement("div");
      divuser.classList.add(groupName);
      divuser.classList.add("divuserviewgroup");

      // pseudo player
      let name = createHTMLElement("div", "viewusername");
      name.textContent = currentPlayer.Username;
      divuser.appendChild(name);

      // classe player
      let classplayer = createHTMLElement("div", "classplayer");
      classplayer.textContent = currentPlayer.class[data.UserInfo.Language];
      divuser.appendChild(classplayer);

      // Unité du joueur
      let divlistUnit = createHTMLElement("div", "viewdivlistUnit");
      let unit1 = createHTMLElement("div", "unit1");
      if (currentPlayer.Unit1 === "Consulter un officier") {
        unit1.textContent = translate.view_group.off;
        unit1.classList.add("consultOff");
      } else {
        unit1.textContent = currentPlayer.Unit1;
      }
      divlistUnit.appendChild(unit1);
      let unit2 = createHTMLElement("div", "unit2");
      if (currentPlayer.Unit2 === "Consulter un officier") {
        unit2.textContent = translate.view_group.off;
        unit2.classList.add("consultOff");
      } else {
        unit2.textContent = currentPlayer.Unit2;
      }
      divlistUnit.appendChild(unit2);
      let unit3 = createHTMLElement("div", "unit3");
      if (currentPlayer.Unit3 === "Consulter un officier") {
        unit3.textContent = translate.view_group.off;
        unit3.classList.add("consultOff");
      } else {
        unit3.textContent = currentPlayer.Unit3;
      }
      divlistUnit.appendChild(unit3);
      let unit4 = createHTMLElement("div", "unit4");
      if (currentPlayer.Unit4 === "Consulter un officier") {
        unit4.textContent = translate.view_group.off;
        unit4.classList.add("consultOff");
      } else {
        unit4.textContent = currentPlayer.Unit4;
      }
      divlistUnit.appendChild(unit4);

      // ne pas afficher les lignes vide
      if (currentPlayer.Username != "") {
        divuser.appendChild(divlistUnit);
        divGroup.appendChild(divuser);
      }
    }
    viewgroup.appendChild(divGroup);
    groupNumber += 1;
  }

  containerGroupe.appendChild(viewgroup);

  // bouton pour télécharger l'image des groupes
  let script = document.createElement("script");
  script.src = "https://html2canvas.hertzen.com/dist/html2canvas.js";
  document.head.appendChild(script);

  let buttonDownloadGroup = createHTMLElement("div", "buttonDownloadGroup");
  buttonDownloadGroup.textContent = translate.view_group.download;
  containerGroupe.appendChild(buttonDownloadGroup);

  buttonDownloadGroup.addEventListener("click", function () {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      // Sauvegarde des dimensions originales
      let originalWidth = viewgroup.style.width;
      let originalHeight = viewgroup.style.height;

      // Récupérer la taille réelle du contenu
      let rect = viewgroup.getBoundingClientRect();
      let computedStyle = window.getComputedStyle(viewgroup);
      let paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
      let paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

      let newWidth = Math.max(rect.width + paddingX, 800); // Largeur minimale de 800px
      let newHeight = Math.max(rect.height + paddingY, 500); // Hauteur minimale de 500px

      // Appliquer la taille dynamique avant la capture
      viewgroup.style.width = newWidth + "px";
      viewgroup.style.height = newHeight + "px";

      // Générer l'image avec une meilleure résolution
      html2canvas(viewgroup, {
        scale: 2, // Double la résolution pour plus de netteté
        allowTaint: true,
        useCORS: true,
      }).then(function (canvas) {
        // Réinitialiser la taille après la capture
        viewgroup.style.width = originalWidth;
        viewgroup.style.height = originalHeight;

        // Télécharger l'image
        let link = document.createElement("a");
        document.body.appendChild(link);
        const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
        link.download = `${date}_groupGvG.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95); // JPEG haute qualité
        link.target = "_blank";
        link.click();
      });
    }
  });

  // bouton pour revenir à l'édition des groupes
  let buttonEditGroup = createHTMLElement("div", "buttonEditGroup");
  buttonEditGroup.textContent = translate.view_group.back;
  containerGroupe.appendChild(buttonEditGroup);
  buttonEditGroup.addEventListener("click", function () {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;
      window.location.href = "/creategroup";
    }
  });

  container.appendChild(containerGroupe);
}

function usersInGroup(data, groupNumber) {
  let usersInGroup = [];
  for (let i = 0; i < data.GroupGvG.length; i++) {
    let currentUser = data.GroupGvG[i];
    if (groupNumber == currentUser.GroupNumber) {
      for (let j = 0; j < data.ListInscripted.length; j++) {
        const userInscripted = data.ListInscripted[j];
        if (userInscripted.ID === currentUser.User_ID) {
          currentUser.influence = userInscripted.Influence;
          currentUser.class = userInscripted.GameCharacter;
          currentUser.influUnit = influenceUnit(currentUser, userInscripted.UserCaserne);
        }
      }
      usersInGroup.push(currentUser);
    }
  }

  for (let i = usersInGroup.length; i < 5; i++) {
    const noUser = {
      Username: "",
      GroupNumber: groupNumber,
      Unit1: "",
      Unit2: "",
      Unit3: "",
      Unit4: "",
      influence: "",
      influUnit: "",
      class: "",
    };
    usersInGroup.push(noUser);
  }
  return usersInGroup;
}

function influenceUnit(currentUser, caserne) {
  let unitValues = 0;
  if (caserne !== null) {
    for (let i = 0; i < caserne.length; i++) {
      let nameCurrentUnit = caserne[i].Unit_name;
      if (nameCurrentUnit === currentUser.Unit1 || nameCurrentUnit === currentUser.Unit2 || nameCurrentUnit === currentUser.Unit3 || nameCurrentUnit === currentUser.Unit4) {
        unitValues += parseInt(caserne[i].Unit_influence, 10);
      }
    }
  }

  return unitValues;
}
