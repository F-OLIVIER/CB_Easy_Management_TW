import fs from "fs";
import path from "path";

/**
 * Écrit un message dans un fichier de log.
 * @param {string} message - Le message à enregistrer.
 * @param {string} [logFile='app.log'] - Nom du fichier de log.
 */
// logToFile(`\n${err.message}`, "errors_bot.log");
export async function logToFile(message, logFile = "log_bot.log") {
  const logDir = path.resolve("./logs"); // Dossier des logs
  const logPath = path.join(logDir, logFile);
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    // Vérifie si le dossier "logs" existe, sinon le crée
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Écrit de manière asynchrone dans le fichier
    await fs.promises.appendFile(logPath, logMessage, "utf8");
  } catch (error) {
    console.error("Erreur d'écriture dans le fichier de log :", error);
  }
}
