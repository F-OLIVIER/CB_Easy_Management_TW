// Faux serveur Discord pour les tests e2e : répond à GET /api/oauth2/@me comme Discord.
// Jetons reconnus :
//   jeton-<discordId>            jeton valide délivré pour notre application (DISCORD_CLIENT_ID)
//   jeton-autre-app-<discordId>  jeton valide mais délivré pour une autre application Discord
//   tout autre jeton             refusé (401)
import http from "node:http";

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const OTHER_APP_ID = "999999999999999999";

const send = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

http
  .createServer((req, res) => {
    if (req.method !== "GET" || req.url !== "/api/oauth2/@me") return send(res, 404, { message: "404: Not Found" });
    const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
    const match = /^jeton-(autre-app-)?(\d{17,20})$/.exec(token);
    if (!match) return send(res, 401, { message: "401: Unauthorized", code: 0 });
    send(res, 200, {
      application: { id: match[1] ? OTHER_APP_ID : CLIENT_ID },
      scopes: ["identify", "guilds"],
      user: { id: match[2], username: "utilisateur-test" },
    });
  })
  .listen(8000, () => console.log("Faux serveur Discord prêt sur :8000"));
