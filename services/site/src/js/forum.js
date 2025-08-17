import { adressAPI, loadModule } from "./config.js";
const { communBlock, createHTMLElement, fetchServer, fetchlogout } = await loadModule("useful.js");
const { showNotification } = await loadModule("notification.js");
const { loadTranslate } = await loadModule("translate.js");

export async function forum() {
  const currenthouse = localStorage.getItem("user_house");
  if ((currenthouse == "") | (currenthouse == null) | (currenthouse == undefined)) {
    window.location.href = "/home";
  } else {
    const data = await fetchServer("forum/?house=" + currenthouse);
    // console.log("data : ", data);
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

  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let containerforum = createHTMLElement("div", "containerforum");

  containerforum.appendChild(basemodal(translate));

  // Encart régles forum
  let descriptionForum = createHTMLElement("div", "descriptionForum");
  let titlesubcontainerForum = createHTMLElement("div", "titledescriptionForum");
  titlesubcontainerForum.textContent = translate.forum.title;
  descriptionForum.appendChild(titlesubcontainerForum);
  let contentdescriptionForum = createHTMLElement("div", "contentdescriptionForum");
  contentdescriptionForum.innerHTML = translate.forum.description;
  descriptionForum.appendChild(contentdescriptionForum);
  let buttonreglesforum = createHTMLElement("div", "buttonreglesforum");
  buttonreglesforum.textContent = "》 " + translate.forum.regle.display;
  descriptionForum.appendChild(buttonreglesforum);
  let contentReglesForum = reglesForum(translate.forum.regle.description);
  contentReglesForum.style.display = "none";
  descriptionForum.appendChild(contentReglesForum);
  containerforum.appendChild(descriptionForum);

  // Création d'une publication
  let divCreatePost = createHTMLElement("div", "divCreatePost");
  let buttondivCreatePost = createHTMLElement("div", "buttondivCreatePost");
  buttondivCreatePost.textContent = "》 " + translate.forum.create.display;
  divCreatePost.appendChild(buttondivCreatePost);
  divCreatePost.appendChild(createPost(translate));
  containerforum.appendChild(divCreatePost);

  // Posts actif
  let postsForum = createHTMLElement("div", "postsForum");
  let titlepostsForum = createHTMLElement("div", "titlepostsForum");
  titlepostsForum.textContent = translate.forum.actif;
  postsForum.appendChild(titlepostsForum);
  let contentpostsForum = displayListPost(data.Gestion.Admin, data.Forum, data.UserInfo.Language, true, false, translate);
  postsForum.appendChild(contentpostsForum);
  containerforum.appendChild(postsForum);

  // Posts à valider
  if (data.Gestion.Admin) {
    let validpostsForum = createHTMLElement("div", "validpostsForum");
    let validtitlepostsForum = createHTMLElement("div", "validtitlepostsForum");
    validtitlepostsForum.textContent = translate.forum.valid.title;
    validpostsForum.appendChild(validtitlepostsForum);
    let validcontentpostsForum = displayListPost(data.Gestion.Admin, data.Forum, data.UserInfo.Language, false, false, translate);
    validpostsForum.appendChild(validcontentpostsForum);
    containerforum.appendChild(validpostsForum);
  }

  // Posts archivé
  let archivepostsForum = createHTMLElement("div", "archivepostsForum");
  let buttondivArchivePost = createHTMLElement("div", "buttondivArchivePost");
  buttondivArchivePost.textContent = "》 " + translate.forum.archive.display;
  archivepostsForum.appendChild(buttondivArchivePost);

  let divArchivePost = createHTMLElement("div", "divArchivePost");
  divArchivePost.style.display = "none";
  let archivecontentpostsForum = displayListPost(data.Gestion.Admin, data.Forum, data.UserInfo.Language, true, true, translate);
  divArchivePost.appendChild(archivecontentpostsForum);
  archivepostsForum.appendChild(divArchivePost);

  containerforum.appendChild(archivepostsForum);

  Container.appendChild(containerforum);

  activateButton(translate);

  if (data.Gestion.Notification.Notif) {
    showNotification(data.Gestion.Notification.content[data.UserInfo.Language], data.Gestion.Notification.Type);
  }
}

function reglesForum(description) {
  let contentReglesForum = createHTMLElement("div", "contentReglesForum");

  let currentList = null;

  for (const item of description) {
    if (!item.includes("<li>")) {
      const title = document.createElement("h3");
      title.textContent = item;
      contentReglesForum.appendChild(title);

      currentList = document.createElement("ul");
      contentReglesForum.appendChild(currentList);
    } else {
      const temp = document.createElement("div");
      temp.innerHTML = item;
      const li = temp.firstChild;
      if (currentList) currentList.appendChild(li);
    }
  }

  return contentReglesForum;
}

let timerThrottlebutton = 0;
function activateButton(translate) {
  document.getElementById("buttonreglesforum").addEventListener("click", () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      let contentReglesForum = document.getElementById("contentReglesForum");
      if (contentReglesForum.style.display == "none") {
        contentReglesForum.style.display = "flex";
        document.getElementById("buttonreglesforum").textContent = "》 " + translate.forum.regle.hide;
      } else {
        contentReglesForum.style.display = "none";
        document.getElementById("buttonreglesforum").textContent = "》 " + translate.forum.regle.display;
      }
    }
  });

  document.getElementById("buttondivCreatePost").addEventListener("click", () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      let encartNewpost = document.getElementById("encartCreatePost");
      if (encartNewpost.style.display == "none") {
        encartNewpost.style.display = "flex";
        document.getElementById("buttondivCreatePost").textContent = "》 " + translate.forum.create.hide;
      } else {
        encartNewpost.style.display = "none";
        document.getElementById("buttondivCreatePost").textContent = "》 " + translate.forum.create.display;
      }
    }
  });

  document.getElementById("buttondivArchivePost").addEventListener("click", () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      let divArchivePost = document.getElementById("divArchivePost");
      if (divArchivePost.style.display == "none") {
        divArchivePost.style.display = "flex";
        document.getElementById("buttondivArchivePost").textContent = "》 " + translate.forum.archive.hide;
      } else {
        divArchivePost.style.display = "none";
        document.getElementById("buttondivArchivePost").textContent = "》 " + translate.forum.archive.display;
      }
    }
  });
}

// -------------------------------------------------------
// ------------------ Création d'un post -----------------
// -------------------------------------------------------
function createPost(translate) {
  let encartCreatePost = createHTMLElement("div", "encartCreatePost");
  encartCreatePost.style.display = "none";

  let divtitlenewPost = createHTMLElement("div", "divtitlenewPost");
  let titlenewPost = createHTMLElement("div", "titlenewPost");
  titlenewPost.textContent = translate.forum.create.title + " : ";
  divtitlenewPost.appendChild(titlenewPost);
  let inputtitlenewPost = createHTMLElement("input", "inputtitlenewPost");
  inputtitlenewPost.type = "text";
  inputtitlenewPost.name = "TitlePost";
  divtitlenewPost.appendChild(inputtitlenewPost);
  encartCreatePost.appendChild(divtitlenewPost);

  let divTextarea = createHTMLElement("div", "divTextarea");
  encartCreatePost.appendChild(divTextarea);
  loadQuillAndInit(translate);

  let buttonNewPost = createHTMLElement("button", "buttonNewPost");
  buttonNewPost.textContent = translate.forum.create.button;
  encartCreatePost.appendChild(buttonNewPost);

  return encartCreatePost;
}

export function loadQuillAndInit(translate) {
  // 1. Charger la CSS
  const quillCss = document.createElement("link");
  quillCss.rel = "stylesheet";
  quillCss.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
  document.head.appendChild(quillCss);

  // 2. Charger le script JS
  const quillScript = document.createElement("script");
  quillScript.src = "https://cdn.quilljs.com/1.3.6/quill.js";
  quillScript.onload = () => {
    // Initialisation de Quill se fait après le chargement du DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initQuill(translate);
      });
    } else {
      initQuill(translate);
    }
  };
  document.body.appendChild(quillScript);
}

function initQuill(translate) {
  const wrapper = document.getElementById("divTextarea");

  const editorContainer = document.createElement("div");
  editorContainer.id = "editor";

  wrapper.appendChild(editorContainer);

  const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: translate.forum.create.placeholder,
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["link", "image"],
        [{ header: 1 }, { header: 2 }],
      ],
    },
  });

  document.getElementById("buttonNewPost").addEventListener("click", async () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      const postTitle = document.getElementById("inputtitlenewPost").value;
      const postContent = quill.root.innerHTML;

      const isEmptyHtml = (html) => {
        // Quill retourne par defaut des balise "<p></p>" quand vide
        return html.replace(/<[^>]*>/g, "").trim() === "";
      };

      if (isEmptyHtml(postTitle) || isEmptyHtml(postContent)) {
        showNotification(translate.forum.error.notext, "error");
        return;
      }

      if (postContent.includes("<script>") || postContent.includes("</script>")) {
        showNotification(translate.forum.error.prohibe, "error");
        return;
      }

      let dataToSend = {
        Title: postTitle,
        Content: postContent,
      };

      await sendData("newpostforum", dataToSend);
    }
  });
}

// -------------------------------------------------------
// ----------------- Affichage des posts -----------------
// -------------------------------------------------------
function displayListPost(admin, listPost, language, optionvalidation, optionarchivage, translate) {
  let contentpostsForum = createHTMLElement("div", "contentpostsForum");
  if (listPost == null) return contentpostsForum;

  for (let index = 0; index < listPost.length; index++) {
    const currentPost = listPost[index];
    if (currentPost.Valid == optionvalidation && currentPost.Archive == optionarchivage) {
      let post = createHTMLElement("div", "post");

      let title = createHTMLElement("div", "titlepost");
      title.textContent = currentPost.Title;
      post.appendChild(title);

      let infoPost = createHTMLElement("div", "infopost");
      let date = createHTMLElement("div", "datepost");
      date.textContent = `${translate.forum.post.date} : ${formatDate(currentPost.Date, language)}`;
      infoPost.appendChild(date);

      let author = createHTMLElement("div", "authorpost");
      author.textContent = `${translate.forum.post.author} : ${currentPost.Author}`;
      infoPost.appendChild(author);

      post.appendChild(infoPost);
      contentpostsForum.appendChild(post);

      post.addEventListener("click", function () {
        const modal = document.getElementById("modalpost");
        modal.style.display = "flex";
        const commentClickListener = showmodal(currentPost, admin, language, translate);

        const closeBtn = document.getElementById("modalpostclose");
        closeBtn.addEventListener("click", function () {
          const modal = document.getElementById("modalpost");
          modal.style.display = "none";

          document.getElementById("modaladdcommentspost").style.display = "none";
          if (currentPost.Valid && !currentPost.Archive) {
            document.getElementById("buttondivCreateComment").style.display = "none";
            document.getElementById("buttondivCreateComment").textContent = "》 " + translate.forum.comment.display;
          } else {
            document.getElementById("buttondivCreateComment").style.display = "flex";
          }

          document.getElementById("buttonNewComment").removeEventListener("click", commentClickListener);

          // Supprimer l'éditeur comment s'il existe
          const oldEditor = document.getElementById("editorcomment");
          if (oldEditor) {
            // Supprimer aussi la toolbar si elle existe juste avant
            if (oldEditor.previousSibling && oldEditor.previousSibling.classList.contains("ql-toolbar")) {
              oldEditor.previousSibling.remove();
            }
            oldEditor.remove();
          }
        });
      });
    }
  }
  return contentpostsForum;
}

function basemodal(translate) {
  let modal = createHTMLElement("div", "modalpost");
  modal.style.display = "none";
  let modalContent = document.createElement("div");
  modalContent.className = "modalpost-content";
  let titlepost = createHTMLElement("div", "modaltitlepost");
  modalContent.appendChild(titlepost);
  let contentpost = createHTMLElement("div", "modalcontentpost");
  let content = createHTMLElement("div", "modallinecontentpost");
  contentpost.appendChild(content);
  let author = createHTMLElement("div", "modallinecontentpostauthor");
  contentpost.appendChild(author);
  modalContent.appendChild(contentpost);
  let encartbutton = createHTMLElement("div", "modalencartbutton");
  modalContent.appendChild(encartbutton);
  let commentspost = createHTMLElement("div", "modalcommentspost");
  modalContent.appendChild(commentspost);
  let buttondivCreateComment = createHTMLElement("div", "buttondivCreateComment");
  buttondivCreateComment.textContent = "》 " + translate.forum.comment.display;
  modalContent.appendChild(buttondivCreateComment);
  let addcommentspost = createHTMLElement("div", "modaladdcommentspost");
  addcommentspost.style.display = "none";
  let divTextarea = createHTMLElement("div", "divTextareaComment");
  addcommentspost.appendChild(divTextarea);
  let buttonNewComment = createHTMLElement("button", "buttonNewComment");
  buttonNewComment.textContent = translate.forum.comment.button;
  addcommentspost.appendChild(buttonNewComment);
  modalContent.appendChild(addcommentspost);

  modal.appendChild(modalContent);

  let btnclose = createHTMLElement("span", "modalpostclose");
  btnclose.innerHTML = "&times;";
  modal.appendChild(btnclose);

  return modal;
}

function showmodal(post, admin, language, translate) {
  const titlepost = document.getElementById("modaltitlepost");
  titlepost.innerHTML = post.Title;
  const contentpost = document.getElementById("modallinecontentpost");
  contentpost.innerHTML = post.Content;
  const author = document.getElementById("modallinecontentpostauthor");
  author.innerHTML = `${translate.forum.post.on} ${formatDate(post.Date, language)} ${translate.forum.post.by} ${post.Author}`;
  const commentspost = document.getElementById("modalcommentspost");
  commentspost.innerHTML = "";

  if (post.Comments != undefined) {
    for (let index = 0; index < post.Comments.length; index++) {
      const currentComment = post.Comments[index];
      let comment = createHTMLElement("div", "modalcontentcomment");
      let contentcurrentcomment = createHTMLElement("div", "modallinecontentcomment");
      contentcurrentcomment.innerHTML = currentComment.Content;
      comment.appendChild(contentcurrentcomment);
      let authorcurrentcomment = createHTMLElement("div", "modallinecontentcommentauthor");
      authorcurrentcomment.textContent = `${translate.forum.post.on} ${formatDate(currentComment.Date, language)} ${translate.forum.post.by} ${currentComment.Author}`;
      comment.appendChild(authorcurrentcomment);
      commentspost.appendChild(comment);
    }
  }

  // Supprimer l'ancien éditeur s'il existe
  const oldEditor = document.getElementById("editorcomment");
  if (oldEditor) {
    // Supprimer aussi la toolbar si elle existe juste avant
    if (oldEditor.previousSibling && oldEditor.previousSibling.classList.contains("ql-toolbar")) {
      oldEditor.previousSibling.remove();
    }
    oldEditor.remove();
  }

  showButton(post.ID, admin, post.Valid, post.Archive, translate);
  let commentClickListener;

  if (!post.Archive && post.Valid) {
    document.getElementById("buttondivCreateComment").style.display = "flex";
    commentClickListener = initQuillComment(post.ID);

    document.getElementById("buttondivCreateComment").addEventListener("click", () => {
      const now = new Date();
      if (now - timerThrottlebutton > 500) {
        timerThrottlebutton = now;

        let encartNewComment = document.getElementById("modaladdcommentspost");
        if (encartNewComment.style.display == "none") {
          encartNewComment.style.display = "flex";
          document.getElementById("buttondivCreateComment").textContent = "》 " + translate.forum.comment.hide;
        } else {
          encartNewComment.style.display = "none";
          document.getElementById("buttondivCreateComment").textContent = "》 " + translate.forum.comment.display;
        }
      }
    });
  } else {
    document.getElementById("buttondivCreateComment").style.display = "none";
  }
  return commentClickListener;
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
// ---------------------- Bouttons -----------------------
// -------------------------------------------------------
function showButton(idpost, admin = false, valid, archive, translate) {
  let listbutton = document.getElementById("modalencartbutton");
  listbutton.innerHTML = "";

  if (admin) {
    if (!valid) {
      // Bouton de validation
      let buttonvalid = createHTMLElement("button", "forumbuttonvalid");
      buttonvalid.textContent = translate.forum.valid.button;
      buttonvalid.id = idpost;
      listbutton.appendChild(buttonvalid);

      buttonvalid.addEventListener("click", () => {
        let dataToSend = {
          ID: idpost,
          Content: "valid",
        };
        sendData("modifpostforum", dataToSend);
      });
    } else if (!archive) {
      // Boutton d'achivage
      let buttonarchivage = createHTMLElement("button", "forumbuttonarchivage");
      buttonarchivage.textContent = translate.forum.archive.button;
      buttonarchivage.id = idpost;
      listbutton.appendChild(buttonarchivage);

      buttonarchivage.addEventListener("click", () => {
        let dataToSend = {
          ID: idpost,
          Content: "archivage",
        };
        sendData("modifpostforum", dataToSend);
      });
    }

    // Boutton de suppression
    let buttonsuppression = createHTMLElement("button", "forumbuttonsuppression");
    buttonsuppression.textContent = translate.forum.post.delete;
    buttonsuppression.id = idpost;
    listbutton.appendChild(buttonsuppression);

    buttonsuppression.addEventListener("click", () => {
      let dataToSend = {
        ID: idpost,
        Content: "delete",
      };
      sendData("modifpostforum", dataToSend);
    });
  }

  if (valid && !archive) {
    // Bouton de signalement
    let buttonsignaler = createHTMLElement("button", "forumbuttonsignaler");
    buttonsignaler.textContent = translate.forum.report;
    buttonsignaler.id = idpost;
    listbutton.appendChild(buttonsignaler);

    buttonsignaler.addEventListener("click", () => {
      let dataToSend = {
        ID: idpost,
        Content: "report",
      };
      sendData("modifpostforum", dataToSend);
    });
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
        ["bold", "italic", "underline", "strike"],
        ["link", "image"],
        [{ header: 1 }, { header: 2 }],
      ],
    },
  });

  // Définir la fonction d'événement
  const commentClickListener = async () => {
    const now = new Date();
    if (now - timerThrottlebutton > 500) {
      timerThrottlebutton = now;

      const postContent = quill.root.innerHTML;
      if (postContent.includes("<script>") || postContent.includes("</script>")) {
        showNotification(translate.forum.error.prohibe, "error");
        return;
      }

      let dataToSend = {
        ID: id,
        Content: postContent,
      };

      await sendData("newcommentforum", dataToSend);
    }
  };

  // Ajouter l'event listener
  document.getElementById("buttonNewComment").addEventListener("click", commentClickListener);
  return commentClickListener;

  // document.getElementById("buttonNewComment").addEventListener("click", async () => {
  //   const now = new Date();
  //   if (now - timerThrottlebutton > 500) {
  //     timerThrottlebutton = now;

  //     const postContent = quill.root.innerHTML;
  //     if (postContent.includes("<script>") || postContent.includes("</script>")) {
  //       showNotification(translate.forum.error.prohibe, "error");
  //       return;
  //     }

  //     let dataToSend = {
  //       ID: id,
  //       Content: postContent,
  //     };

  //     await sendData("newcommentforum", dataToSend);
  //   }
  // });
}

async function sendData(option, dataToSend) {
  const currenthouse = localStorage.getItem("user_house");

  const update = await fetch(adressAPI + option + "/?house=" + currenthouse, {
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

  if (update.Gestion.Logged) {
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
