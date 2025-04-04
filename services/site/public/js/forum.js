import { communBlock, createHTMLElement, fetchServer, fetchlogout } from "./useful.js";
import { adressAPI } from "./config.js";
import { loadTranslate } from "./translate.js";
import { showNotification } from "./notification.js";

export async function forum() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("forum/?house=" + currenthouse);
    if (data.Gestion.Logged) {
      const translate = await loadTranslate(data.UserInfo.Language);
      containerforum(data, translate);
    } else {
      fetchlogout();
    }
  }
}

function containerforum(data, translate) {
  communBlock(data, translate);

  console.log("data : ", data);

  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let containerforum = createHTMLElement("div", "containerforum");

  // Encart description
  let descriptionForum = createHTMLElement("div", "descriptionForum");
  let titlesubcontainerForum = createHTMLElement("div", "titledescriptionForum");
  titlesubcontainerForum.textContent = "Espace forum multi-maisons";
  descriptionForum.appendChild(titlesubcontainerForum);
  let contentdescriptionForum = createHTMLElement("div", "contentdescriptionForum");
  contentdescriptionForum.textContent = "Description ici (utilité, etc...)";
  descriptionForum.appendChild(contentdescriptionForum);
  containerforum.appendChild(descriptionForum);

  // Div de création d'une publication
  let divCreatePost = createHTMLElement("div", "divCreatePost");
  let buttondivCreatePost = createHTMLElement("div", "buttondivCreatePost");
  buttondivCreatePost.textContent = "》 " + "Crée un nouveau post";
  divCreatePost.appendChild(buttondivCreatePost);
  divCreatePost.appendChild(createPost());
  containerforum.appendChild(divCreatePost);

  // Div pour afficher les posts existant
  let postsForum = createHTMLElement("div", "postsForum");
  let titlepostsForum = createHTMLElement("div", "titlepostsForum");
  titlepostsForum.textContent = "Post du Forum";
  postsForum.appendChild(titlepostsForum);
  let contentpostsForum = displayListPost(data.Forum, data.UserInfo.Language);
  postsForum.appendChild(contentpostsForum);
  containerforum.appendChild(postsForum);

  containerforum.appendChild(basemodal());

  Container.appendChild(containerforum);

  activateButton();

  if (data.Gestion.Notification.Notif) {
    showNotification(data.Gestion.Notification.content[data.UserInfo.Language], data.Gestion.Notification.Type);
  }
}

let timerThrottlebutton = 0;
function activateButton() {
  document.getElementById("buttondivCreatePost").addEventListener("click", () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      let encartNewpost = document.getElementById("encartCreatePost");
      if (encartNewpost.style.display == "none") {
        encartNewpost.style.display = "flex";
        document.getElementById("buttondivCreatePost").textContent = "》 " + "Masquer la création de post";
      } else {
        encartNewpost.style.display = "none";
        document.getElementById("buttondivCreatePost").textContent = "》 " + "Crée un nouveau post";
      }
    }
  });
}

// -------------------------------------------------------
// ------------------ Création d'un post -----------------
// -------------------------------------------------------
function createPost() {
  let encartCreatePost = createHTMLElement("div", "encartCreatePost");
  encartCreatePost.style.display = "none";

  let divtitlenewPost = createHTMLElement("div", "divtitlenewPost");
  let titlenewPost = createHTMLElement("div", "titlenewPost");
  titlenewPost.textContent = "Titre du post :";
  divtitlenewPost.appendChild(titlenewPost);
  let inputtitlenewPost = createHTMLElement("input", "inputtitlenewPost");
  inputtitlenewPost.type = "text";
  inputtitlenewPost.name = "TitlePost";
  divtitlenewPost.appendChild(inputtitlenewPost);
  encartCreatePost.appendChild(divtitlenewPost);

  let divTextarea = createHTMLElement("div", "divTextarea");
  encartCreatePost.appendChild(divTextarea);
  loadQuillAndInit();

  let buttonNewPost = createHTMLElement("button", "buttonNewPost");
  buttonNewPost.textContent = "Publier";
  encartCreatePost.appendChild(buttonNewPost);

  return encartCreatePost;
}

export function loadQuillAndInit() {
  // 1. Charger la CSS
  const quillCss = document.createElement("link");
  quillCss.rel = "stylesheet";
  quillCss.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
  document.head.appendChild(quillCss);

  // 2. Charger le script JS
  const quillScript = document.createElement("script");
  quillScript.src = "https://cdn.quilljs.com/1.3.6/quill.js";
  quillScript.onload = () => {
    initQuill();
  };
  document.body.appendChild(quillScript);
}

function initQuill() {
  const wrapper = document.getElementById("divTextarea");

  const editorContainer = document.createElement("div");
  editorContainer.id = "editor";

  wrapper.appendChild(editorContainer);

  const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Saisissez votre texte...",
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike", "code"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
        ["link", "image"],
        [{ header: 1 }, { header: 2 }],
        [{ indent: "-1" }, { indent: "+1" }],
      ],
    },
  });

  document.getElementById("buttonNewPost").addEventListener("click", async () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      const postTitle = document.getElementById("inputtitlenewPost").value;
      const postContent = quill.root.innerHTML;

      if (postTitle.trim() === "" || postContent.trim() === "") {
        showNotification("merci de completer tous les champs", "error");
        return;
      }

      if (postContent.includes("<script>") || postContent.includes("</script>")) {
        showNotification("Contenu interdit !!!", "error");
        return;
      }

      let dataToSend = {
        Title: postTitle,
        Content: postContent,
      };

      await sendPost(dataToSend);
    }
  });
}

async function sendPost(dataToSend) {
  const currenthouse = localStorage.getItem("user_house");

  const update = await fetch(adressAPI + "newpostforum/?house=" + currenthouse, {
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

  if (update.Gestion.Logged && update.Gestion.Admin) {
    if (update.Gestion.Notification.Notif == true && update.Gestion.Notification.Type == "error") {
      showNotification(update.Gestion.Notification.content[update.UserInfo.Language], update.Gestion.Notification.Type);
      return;
    }
    const translate = await loadTranslate(update.UserInfo.Language);
    containerforum(update, translate);
  } else {
    fetchlogout();
  }
}

// -------------------------------------------------------
// ----------------- Affichage des posts -----------------
// -------------------------------------------------------
function displayListPost(listPost, language) {
  let contentpostsForum = createHTMLElement("div", "contentpostsForum");
  for (let index = 0; index < listPost.length; index++) {
    const currentPost = listPost[index];
    console.log("currentPost : ", currentPost);

    let post = createHTMLElement("div", "post");

    let title = createHTMLElement("div", "titlepost");
    title.textContent = currentPost.Title;
    post.appendChild(title);

    let infoPost = createHTMLElement("div", "infopost");
    let date = createHTMLElement("div", "datepost");
    date.textContent = `Date : ${formatDate(currentPost.Date, language)}`;
    infoPost.appendChild(date);

    let author = createHTMLElement("div", "authorpost");
    author.textContent = `Auteur : ${currentPost.Author}`;
    infoPost.appendChild(author);

    post.appendChild(infoPost);
    contentpostsForum.appendChild(post);

    post.addEventListener("click", function () {
      const modal = document.getElementById("modalpost");
      modal.style.display = "flex";
      showmodal(currentPost);

      const closeBtn = document.getElementById("modalpostclose");
      closeBtn.addEventListener("click", function () {
        const modal = document.getElementById("modalpost");
        modal.style.display = "none";
      });
    });
  }
  return contentpostsForum;
}

function basemodal() {
  let modal = createHTMLElement("div", "modalpost");
  modal.style.display = "none";
  let modalContent = document.createElement("div");
  modalContent.className = "modalpost-content";
  let btnclose = createHTMLElement("span", "modalpostclose");
  btnclose.innerHTML = "&times;";
  modalContent.appendChild(btnclose);
  let titlepost = createHTMLElement("div", "modaltitlepost");
  modalContent.appendChild(titlepost);
  let contentpost = createHTMLElement("div", "modalcontentpost");
  modalContent.appendChild(contentpost);
  let commentspost = createHTMLElement("div", "modalcommentspost");
  modalContent.appendChild(commentspost);
  let buttondivCreateComment = createHTMLElement("div", "buttondivCreateComment");
  buttondivCreateComment.textContent = "》 " + "Crée un nouveau commentaire";
  modalContent.appendChild(buttondivCreateComment);
  let addcommentspost = createHTMLElement("div", "modaladdcommentspost");
  addcommentspost.style.display = "none";
  let divTextarea = createHTMLElement("div", "divTextareaComment");
  addcommentspost.appendChild(divTextarea);
  let buttonNewComment = createHTMLElement("button", "buttonNewComment");
  buttonNewComment.textContent = "Publier le commentaire";
  addcommentspost.appendChild(buttonNewComment);

  modalContent.appendChild(addcommentspost);
  modal.appendChild(modalContent);
  return modal;
}

function showmodal(post) {
  const titlepost = document.getElementById("modaltitlepost");
  titlepost.innerHTML = post.Title;
  const contentpost = document.getElementById("modalcontentpost");
  contentpost.innerHTML = post.Content;

  if (post.comments != null) {
    const commentspost = document.getElementById("modalcommentspost");
    commentspost.innerHTML = "";
    for (let index = 0; index < post.comments.length; index++) {
      const currentComment = post.comments[index];
    }
  }

  initQuillComment(post.ID);

  document.getElementById("buttondivCreateComment").addEventListener("click", () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      let encartNewComment = document.getElementById("modaladdcommentspost");
      if (encartNewComment.style.display == "none") {
        encartNewComment.style.display = "flex";
        document.getElementById("buttondivCreateComment").textContent = "》 " + "Masquer la création de commentaire";
      } else {
        encartNewComment.style.display = "none";
        document.getElementById("buttondivCreateComment").textContent = "》 " + "Crée un nouveau commentaire";
      }
    }
  });
}

function formatDate(dateStr, language) {
  // Convertir la chaîne en format ISO
  const isoDateStr = dateStr.replace(" ", "T");
  const date = new Date(isoDateStr);

  if (language === "fr") {
    // Format français : DD/MM/YYYY HHhMM
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}h${minutes}`;
  } else {
    // Format anglais : YYYY/MM/DD HH:MM am/pm en 12h
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    if (hours === 0) hours = 12; // Gérer minuit et midi
    const hoursStr = hours.toString().padStart(2, "0");
    return `${year}/${month}/${day} ${hoursStr}:${minutes} ${period}`;
  }
}

// -------------------------------------------------------
// ----------------- Commentaire de post -----------------
// -------------------------------------------------------
function initQuillComment(id) {
  const wrapper = document.getElementById("divTextareaComment");
  const editorContainer = document.createElement("div");
  editorContainer.id = "editorcomment";
  wrapper.appendChild(editorContainer);

  const quill = new Quill("#editorcomment", {
    theme: "snow",
    placeholder: "Saisissez votre texte...",
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike", "code"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
        ["link", "image"],
        [{ header: 1 }, { header: 2 }],
        [{ indent: "-1" }, { indent: "+1" }],
      ],
    },
  });

  document.getElementById("buttonNewComment").addEventListener("click", async () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      const postContent = quill.root.innerHTML;
      if (postContent.includes("<script>") || postContent.includes("</script>")) {
        showNotification("Contenu interdit !!!", "error");
        return;
      }

      console.log("Contenu : ", postContent);
      let dataToSend = {
        ID: id,
        Content: postContent,
      };

      await sendComment(dataToSend);
    }
  });
}

async function sendComment(dataToSend) {
  const currenthouse = localStorage.getItem("user_house");

  const update = await fetch(adressAPI + "newcommentforum/?house=" + currenthouse, {
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

  if (update.Gestion.Logged && update.Gestion.Admin) {
    if (update.Gestion.Notification.Notif == true && update.Gestion.Notification.Type == "error") {
      showNotification(update.Gestion.Notification.content[update.UserInfo.Language], update.Gestion.Notification.Type);
      return;
    }
    const translate = await loadTranslate(update.UserInfo.Language);
    containerforum(update, translate);
  } else {
    fetchlogout();
  }
}
