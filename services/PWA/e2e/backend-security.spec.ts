// Corrections de sécurité du backend Go, vérifiées à travers la PWA (même origine, proxy Vite).
import type { APIResponse, Page } from "@playwright/test";
import { execute, expect, FORUM, HOUSE, queryOne, test, USERS } from "./support/fixtures";

type RequestOptions = { data?: unknown; headers?: Record<string, string> };

/** Requête API depuis la page, réessayée si le limiteur de débit répond 429 (comme le client de la PWA) */
async function call(page: Page, method: "get" | "post", url: string, options: RequestOptions = {}): Promise<APIResponse> {
  for (let attempt = 1; ; attempt++) {
    const response = await page.request[method](url, options);
    if (response.status() !== 429 || attempt === 8) return response;
    await page.waitForTimeout(300 * attempt);
  }
}
const post = (page: Page, url: string, options?: RequestOptions) => call(page, "post", url, options);

const api = (endpoint: string) => `/api/${endpoint}/?house=${HOUSE.serverId}`;
const sessionOf = (id: number) => queryOne<{ uuid: string }>("SELECT uuid FROM Users WHERE ID = ?", id)!.uuid;

test.describe("Connexion : identité vérifiée auprès de Discord", () => {
  test("un identifiant Discord envoyé sans jeton n'ouvre aucune session", async ({ page }) => {
    // Ancienne faille : il suffisait de connaître l'identifiant Discord (public) d'un administrateur
    const response = await post(page, "/api/discord", { data: { id: USERS.admin.discordId, username: USERS.admin.name } });
    expect((await response.json()).Gestion.Logged).toBe(false);
    expect(response.headers()["set-cookie"] ?? "").not.toContain("user_token=");
    expect(sessionOf(USERS.admin.id)).toBe(USERS.admin.token);
  });

  test("un jeton délivré pour une autre application Discord est refusé", async ({ page }) => {
    const response = await post(page, "/api/discord", { data: { access_token: `jeton-autre-app-${USERS.admin.discordId}` } });
    const { Gestion } = await response.json();
    expect(Gestion.Logged).toBe(false);
    // Message générique : la cause technique reste dans les journaux du serveur
    expect(Gestion.Notification.content.fr).toBe("Connexion impossible pour le moment. Contactez un administrateur.");
    expect(sessionOf(USERS.admin.id)).toBe(USERS.admin.token);
  });

  test("un jeton invalide est refusé", async ({ page }) => {
    const response = await post(page, "/api/discord", { data: { access_token: "jeton-invente" } });
    const { Gestion } = await response.json();
    expect(Gestion.Logged).toBe(false);
    expect(Gestion.Notification.content.fr).toBe("Votre connexion Discord n'a pas pu être vérifiée. Reconnectez-vous avec Discord.");
  });

  test("un jeton valide ouvre une session aux cookies protégés", async ({ page }) => {
    const response = await post(page, "/api/discord", { data: { access_token: `jeton-${USERS.member.discordId}` } });
    expect((await response.json()).Gestion.Logged).toBe(true);
    const setCookie = response.headers()["set-cookie"];
    expect(setCookie).toMatch(/user_token=[^;]+;.*HttpOnly/i);
    expect(setCookie).toMatch(/user_token=[^;]+;.*SameSite=Lax/i);
    expect(sessionOf(USERS.member.id)).not.toBe(USERS.member.token);
  });
});

test.describe("Requêtes d'un autre site (CSRF)", () => {
  test("refusées sur l'API, la connexion et la déconnexion", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    const foreign = { Origin: "https://site-malveillant.example" };

    expect((await post(page, api("home"), { headers: foreign })).status()).toBe(403);
    expect((await post(page, "/api/discord", { headers: foreign, data: { access_token: `jeton-${USERS.member.discordId}` } })).status()).toBe(403);
    expect((await post(page, "/api/logout", { headers: foreign })).status()).toBe(403);
    expect(sessionOf(USERS.member.id)).toBe(USERS.member.token);

    // La même requête depuis la PWA elle-même est acceptée
    const sameOrigin = await post(page, api("home"), { headers: { Origin: new URL(page.url()).origin } });
    expect((await sameOrigin.json()).Gestion.Logged).toBe(true);
  });

  test("la déconnexion par une simple requête GET est refusée", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    expect((await call(page, "get", "/api/logout")).status()).toBe(405);
    expect(sessionOf(USERS.member.id)).toBe(USERS.member.token);
  });
});

test.describe("Droits vérifiés par le serveur", () => {
  test("un utilisateur ne peut ni valider ni supprimer un post, mais peut le signaler", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");

    const validate = await (await post(page, api("modifpostforum"), { data: { ID: String(FORUM.pending.id), Content: "valid" } })).json();
    expect(validate.Gestion.Notification).toMatchObject({ Type: "error", content: { fr: "Action réservée aux administrateurs." } });
    const remove = await (await post(page, api("modifpostforum"), { data: { ID: String(FORUM.active.id), Content: "delete" } })).json();
    expect(remove.Gestion.Notification.Type).toBe("error");

    expect(queryOne<{ Valid: number }>("SELECT Valid FROM Forum WHERE ID = ?", FORUM.pending.id)!.Valid).toBe(0);
    expect(queryOne("SELECT ID FROM Forum WHERE ID = ?", FORUM.active.id)).toBeDefined();

    const report = await (await post(page, api("modifpostforum"), { data: { ID: String(FORUM.active.id), Content: "report" } })).json();
    expect(report.Gestion.Notification.Type).toBe("success");
  });

  test("un administrateur non propriétaire ne peut pas écrire à toutes les maisons ni en message privé", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/home");
    for (const payload of [
      { newWeapon: { en: "Message", fr: "Message" }, informationDiscord: true },
      { newWeapon: { en: USERS.member.discordId, fr: "Bonjour" }, dmDiscord: true },
    ]) {
      const data = await (await post(page, api("UpdateAdmin"), { data: payload })).json();
      expect(data.Gestion.Notification).toMatchObject({ Type: "error", content: { fr: "Action réservée au propriétaire." } });
    }
  });

  test("le propriétaire peut envoyer une information Discord", async ({ page, loginAs }) => {
    await loginAs("owner");
    await page.goto("/home");
    const data = await (await post(page, api("UpdateAdmin"), { data: { newWeapon: { en: "Info", fr: "Info" }, informationDiscord: true } })).json();
    expect(data.Gestion.Notification.Type).toBe("success");
  });
});

test.describe("Caserne", () => {
  test("une injection SQL dans le nom de colonne est rejetée", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    // Tentative de lecture de la session du propriétaire à travers la mise à jour de la caserne
    const injection = `Unit1 = (SELECT uuid FROM Users WHERE ID = ${USERS.owner.id}), Unit2`;
    const response = await post(page, api("majcaserne"), { data: { listNewLvlUnitCaserne: [[injection, "1", "", "1"]] } });
    expect(await response.text()).not.toContain(USERS.owner.token);
    const barracks = queryOne<{ Unit1: number; Unit2: number }>(`SELECT Unit1, Unit2 FROM Caserne${HOUSE.id} WHERE User_ID = ?`, USERS.member.id)!;
    expect(barracks).toEqual({ Unit1: 30, Unit2: 20 });
  });

  test("un gestionnaire ne peut pas modifier la caserne d'un joueur d'une autre maison", async ({ page, loginAs }) => {
    execute(
      `INSERT INTO Users (ID, DiscordID, DiscordName, DiscordBaseName, DiscordRole, ID_House) VALUES (50, '900000000000000050', 'Etranger', 'Etranger', 'Membre', 2)`,
    );
    execute(`INSERT INTO Caserne${HOUSE.id} (User_ID, Unit1) VALUES (50, 5)`);
    await loginAs("officer");
    await page.goto("/home");
    const data = await (await post(page, api("majspecificcaserne"), { data: { iduser: "50", listNewLvlUnitCaserne: [["Unit1", "30", "", "1"]] } })).json();
    expect(data.Gestion.Notification).toMatchObject({ Type: "error", content: { fr: "Ce joueur n'appartient pas à votre maison." } });
    expect(queryOne<{ Unit1: number }>(`SELECT Unit1 FROM Caserne${HOUSE.id} WHERE User_ID = 50`)!.Unit1).toBe(5);
  });
});

test.describe("Cloisonnement des maisons", () => {
  // Gestionnaire d'une autre maison (maison 2), avec sa propre session
  const STRANGER_TOKEN = "token-autre-maison";
  test.beforeEach(async ({ context, baseURL }) => {
    execute(`INSERT INTO Houses (ID, House_name, House_logo, Langage, ID_Server, ID_Group_Users, ID_Group_Officier, ID_Chan_GvG, ID_Chan_Gestion, ID_Chan_Users, ID_MessageGvG)
             VALUES (2, 'Autre maison', '', 'fr', '222222222222222222', '1', '2', '3', '4', '5', '')`);
    execute(`INSERT INTO Users (ID, uuid, DateCookie, DiscordID, DiscordName, DiscordBaseName, DiscordRole, ID_House, EtatInscription)
             VALUES (60, '${STRANGER_TOKEN}', '2099-01-01 00:00:00', '900000000000000060', 'Etranger', 'Etranger', 'Officier', 2, 1)`);
    for (const table of ["Caserne2", "CaserneMaitrise2"]) execute(`CREATE TABLE ${table} (ID INTEGER PRIMARY KEY, User_ID INTEGER NOT NULL, Unit1 INTEGER DEFAULT 0)`);
    execute("INSERT INTO Caserne2 (User_ID, Unit1) VALUES (60, 10)");
    const domain = new URL(baseURL!).hostname;
    await context.addCookies([
      { name: "user_token", value: STRANGER_TOKEN, domain, path: "/", httpOnly: true },
      { name: "user_logged", value: "1", domain, path: "/" },
    ]);
  });

  test("le gestionnaire d'une autre maison ne voit aucune caserne de la maison", async ({ page }) => {
    await page.goto("/");
    const names = Object.values(USERS).map((user) => user.name);
    for (const endpoint of ["consulcaserne", "creategroup", "statGvG", "caserne", "charactercard"]) {
      // Maison de test demandée explicitement : n'appartient pas à l'utilisateur
      const data = await (await post(page, api(endpoint))).json();
      expect(data.ListInscripted, endpoint).toBeNull();
      expect(data.GroupGvG, endpoint).toBeNull();
      expect(data.Gestion.Officier, endpoint).toBe(false);
      const body = JSON.stringify(data);
      for (const name of names) expect(body, `${endpoint} : ${name}`).not.toContain(`"Username":"${name}"`);
    }

    // Sa propre maison : uniquement ses joueurs
    const own = await (await post(page, "/api/consulcaserne/?house=222222222222222222")).json();
    expect(own.ListInscripted.map((user: { Username: string }) => user.Username)).toEqual(["Etranger"]);
  });

  test("le gestionnaire d'une autre maison ne peut pas modifier une caserne de la maison", async ({ page }) => {
    await page.goto("/");
    for (const house of [HOUSE.serverId, "222222222222222222"]) {
      await post(page, `/api/majspecificcaserne/?house=${house}`, { data: { iduser: String(USERS.member.id), listNewLvlUnitCaserne: [["Unit1", "5", "", "1"]] } });
    }
    expect(queryOne<{ Unit1: number }>(`SELECT Unit1 FROM Caserne${HOUSE.id} WHERE User_ID = ?`, USERS.member.id)!.Unit1).toBe(30);
  });
});

test.describe("Contenus nettoyés par le serveur", () => {
  test("le HTML piégé d'un nouveau post est retiré avant l'enregistrement", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    await post(page, api("newpostforum"), {
      data: {
        Title: "<b>Titre</b> piégé<script>alert(1)</script>",
        Content: `<p>Texte <strong>gras</strong></p><img src="x" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">lien</a><p id="DisconnectButton" class="toast" style="position:fixed">imitation</p>`,
      },
    });

    const saved = queryOne<{ Title: string; Content: string }>("SELECT Title, Content FROM Forum WHERE Author = ? ORDER BY ID DESC", USERS.member.id)!;
    expect(saved.Title).not.toMatch(/[<>]/);
    expect(saved.Content).toContain("<strong>gras</strong>");
    expect(saved.Content).toContain("imitation");
    for (const forbidden of ["<script", "onerror", "javascript:", "id=", "class=", "style="]) expect(saved.Content).not.toContain(forbidden);
  });

  test("les posts déjà enregistrés sont nettoyés à l'affichage", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    const data = await (await post(page, api("forum"))).json();
    const legacy = data.Forum.find((post: { ID: string }) => post.ID === String(FORUM.xss.id));
    expect(legacy.Content).toContain("Bonjour");
    for (const forbidden of ["<script", "onerror", "class=", "id=", "style="]) expect(legacy.Content).not.toContain(forbidden);
  });

  test("les commentaires et noms de groupe ne peuvent pas contenir de balises", async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/home");
    await post(page, api("saveGroupInDB"), {
      data: {
        dataToSend: [
          { inputValue: "", selectValues: [], commentaire: "" },
          { inputValue: "group1", selectValues: [USERS.member.name, "Gardes varègues", "", "", ""], commentaire: '<img src=x onerror="alert(1)">Note' },
        ],
        namegroup: [["1", "<b>Alpha</b>"]],
        optiontype: "current",
      },
    });
    expect(queryOne<{ Comment: string }>(`SELECT Comment FROM GroupGvG${HOUSE.id} WHERE User_ID = ?`, USERS.member.id)!.Comment).not.toMatch(/[<>]/);
    expect(queryOne<{ NameGroup: string }>(`SELECT NameGroup FROM NameGroupGvG${HOUSE.id} WHERE GroupNumber = 1`)!.NameGroup).toBe("bAlpha/b");
  });
});

test("le limiteur de débit est propre à chaque client et répond 429", async ({ page, loginAs }) => {
  await loginAs("member");
  await page.goto("/home");
  await page.waitForTimeout(1500); // seau de jetons rempli

  const statuses = await Promise.all(Array.from({ length: 15 }, () => page.request.post(api("home")).then((response) => response.status())));
  expect(statuses).toContain(429);
  expect(statuses).toContain(200);

  // Après une seconde, le client peut de nouveau faire des requêtes
  await page.waitForTimeout(1500);
  expect((await page.request.post(api("home"))).status()).toBe(200);
});
