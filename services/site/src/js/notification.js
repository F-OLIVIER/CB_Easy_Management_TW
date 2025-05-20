// showNotification("Erreur lors du traitement ❌", "error");
// showNotification("Opération réussie ! ✅", "success");

export function showNotification(message, type = "success", duration = 5000) {
  // Vérifier si un conteneur de notifications existe déjà
  let notificationContainer = document.getElementById("notification-container");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notification-container";
    document.body.appendChild(notificationContainer);
  }

  // Créer la div de notification
  let notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Ajouter un bouton de fermeture
  let closeButton = document.createElement("span");
  closeButton.textContent = "X"; // Symbole de fermeture
  closeButton.className = "close-btn";
  closeButton.onclick = () => notification.remove();

  notification.appendChild(closeButton);
  notificationContainer.appendChild(notification);

  // Supprimer la notification après x ms
  setTimeout(() => {
    notification.remove();
  }, duration);
}
