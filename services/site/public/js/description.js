import { communBlock_notconnected, createHTMLElement, lang_select } from "./useful.js";
import { translate } from "./translate.js";

let currentSectionIndex = null;
let currentImageIndex = null;

export function description() {
  const language = localStorage.getItem("selectedLang") || "en";
  document.getElementById("lang-select").value = language;

  communBlock_notconnected();

  let Container = document.getElementById("Container");
  Container.innerHTML = "";
  let containerDescription = createHTMLElement("div", "containerDescription");

  translate[language].descriptionSections.forEach((section, index) => {
    let sectionDiv = createHTMLElement("div", "section");

    let title = document.createElement("h2");
    title.textContent = section.title;
    title.className = "sectionTitle";

    let table = document.createElement("table");
    table.className = "commandTable";
    let tbody = document.createElement("tbody");

    section.commands.forEach(([command, description]) => {
      let row = document.createElement("tr");

      let commandCell = document.createElement("td");
      commandCell.textContent = command;
      commandCell.className = "commandCell";

      let descCell = document.createElement("td");
      descCell.innerHTML = description;
      descCell.className = "descCell";

      row.appendChild(commandCell);
      row.appendChild(descCell);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    sectionDiv.appendChild(title);
    sectionDiv.appendChild(table);

    // carousel d'image
    if (section.images) {
      let carouselContainer = createHTMLElement("div", "carouselContainer");
      let carousel = createHTMLElement("div", "carousel");
      carousel.id = `carousel-${index}`;

      let img = document.createElement("img");
      img.src = section.images[0];
      img.className = "carouselImage";
      img.dataset.index = 0;
      img.onclick = () => openImageModal(img.src, index, 0);

      let prevButton = document.createElement("button");
      prevButton.textContent = "◀";
      prevButton.className = "carouselButton";
      prevButton.onclick = () => changeImage(index, -1, language);

      let nextButton = document.createElement("button");
      nextButton.textContent = "▶";
      nextButton.className = "carouselButton";
      nextButton.onclick = () => changeImage(index, 1, language);

      carousel.appendChild(img);
      carouselContainer.appendChild(prevButton);
      carouselContainer.appendChild(carousel);
      carouselContainer.appendChild(nextButton);

      sectionDiv.appendChild(carouselContainer);
    }

    containerDescription.appendChild(sectionDiv);
  });

  let modal = document.createElement("div");
  modal.style.display = "none";
  modal.id = "imageModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-prev">◀</button>
      <img id="modalImage" class="modal-image" />
      <button class="modal-next">▶</button>
    </div>
  `;
  Container.appendChild(modal);

  Container.appendChild(containerDescription);

  lang_select("/description");
}

function changeImage(sectionIndex, direction, language) {
  let carousel = document.getElementById(`carousel-${sectionIndex}`);
  let img = carousel.querySelector("img");

  let section = translate[language].descriptionSections[sectionIndex]; // Utilisation directe

  let currentIndex = parseInt(img.dataset.index);
  let newIndex = (currentIndex + direction + section.images.length) % section.images.length;

  img.src = section.images[newIndex];
  img.dataset.index = newIndex;
}

function openImageModal(imageSrc, sectionIndex, imageIndex) {
  let modal = document.getElementById("imageModal");
  let modalImage = document.getElementById("modalImage");

  currentSectionIndex = sectionIndex;
  currentImageIndex = imageIndex;

  modalImage.src = imageSrc;
  modal.style.display = "flex";

  // Fermer le modal quand on clique sur l'image
  modalImage.onclick = () => {
    modal.style.display = "none";
  };

  // Fermer le modal quand on clique sur le fond noir
  modal.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Navigation avec les flèches
  modal.querySelector(".modal-prev").onclick = (event) => {
    event.stopPropagation(); // Empêche la fermeture en cliquant sur les flèches
    changeModalImage(-1, language);
  };
  modal.querySelector(".modal-next").onclick = (event) => {
    event.stopPropagation(); // Empêche la fermeture en cliquant sur les flèches
    changeModalImage(1, language);
  };
}

function changeModalImage(direction, language) {
  let section = translate[language].descriptionSections[currentSectionIndex];
  currentImageIndex = (currentImageIndex + direction + section.images.length) % section.images.length;

  document.getElementById("modalImage").src = section.images[currentImageIndex];
}
