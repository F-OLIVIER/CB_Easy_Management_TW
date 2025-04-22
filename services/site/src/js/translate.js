export async function loadTranslate(langue) {
  try {
    const response = await fetch(`/json/translations_${langue}.json`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur lors du chargement du fichier de langue JSON :", err);
    return null;
  }
}
