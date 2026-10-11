import { DISCORD_CLIENT_ID } from "./support/env";
import { expect, HOUSE, queryOne, test, toast, USERS } from "./support/fixtures";

// 1x1 pixel PNG : icône de serveur Discord simulée
const PNG_PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGOISP30HwAFdwKvhpvLXgAAAABJRU5ErkJggg==", "base64");

test.describe("Connexion Discord", () => {
  test("la connexion ouvre une session et récupère le logo à jour de la maison", async ({ page, mockDiscord }) => {
    const discord = await mockDiscord({
      id: USERS.member.discordId,
      username: USERS.member.name,
      // Un serveur Discord sans rapport avec l'application, qui ne doit pas être conservé
      guilds: [{ id: HOUSE.serverId, icon: "iconeactuelle" }, { id: "555555555555555555", icon: "autreserveur" }],
    });
    await page.route("https://cdn.discordapp.com/**", (route) => route.fulfill({ body: PNG_PIXEL, contentType: "image/png" }));

    await page.goto("/");
    await page.locator(".hero").getByRole("button", { name: "Connexion avec Discord" }).click();
    await expect(page).toHaveURL("/home");

    // Demande d'autorisation conforme : flux implicite, droits minimaux, protection CSRF
    const params = discord.authorizeParams()!;
    expect(params.get("client_id")).toBe(DISCORD_CLIENT_ID);
    expect(params.get("response_type")).toBe("token");
    expect(params.get("scope")).toBe("identify guilds");
    expect(params.get("state")).toMatch(/^[0-9a-f]{32}$/);

    await expect(page.locator(".header__username")).toHaveText(USERS.member.name);
    // Le jeton Discord ne reste pas dans l'adresse
    expect(page.url()).not.toContain("access_token");
    // Session créée en base par le backend (nouveau jeton)
    const session = queryOne<{ uuid: string }>("SELECT uuid FROM Users WHERE ID = ?", USERS.member.id)!;
    expect(session.uuid).not.toBe(USERS.member.token);
    expect(session.uuid).not.toBe("");

    await expect(page.locator(".house img.house-logo")).toHaveAttribute("src", `https://cdn.discordapp.com/icons/${HOUSE.serverId}/iconeactuelle.webp`);

    // Minimisation (RGPD) : seule l'icône des maisons de l'utilisateur est conservée dans le navigateur
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("discord_guild_icons") ?? "{}"));
    expect(Object.keys(stored)).toEqual([HOUSE.serverId]);
  });

  test("une réponse Discord au state falsifié est refusée", async ({ page, context, mockDiscord }) => {
    await mockDiscord({ id: USERS.member.discordId, username: USERS.member.name }, { tamperState: true });
    await page.goto("/");
    await page.locator(".hero").getByRole("button", { name: "Connexion avec Discord" }).click();

    await expect(toast(page)).toContainText("Connexion Discord annulée");
    await expect(page).toHaveURL("/");
    expect((await context.cookies()).some((cookie) => cookie.name === "user_token")).toBe(false);
  });

  test("un compte Discord absent de la base ne peut pas se connecter", async ({ page, context, mockDiscord }) => {
    await mockDiscord({ id: "999999999999999999", username: "Inconnu" });
    await page.goto("/");
    await page.locator(".hero").getByRole("button", { name: "Connexion avec Discord" }).click();

    await expect(toast(page)).toContainText("Vous n'existez pas dans la base de données");
    await expect(page).toHaveURL("/");
    expect((await context.cookies()).some((cookie) => cookie.name === "user_token")).toBe(false);
  });

  test("la déconnexion ferme la session côté serveur et efface les données locales", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    await page.evaluate((house) => localStorage.setItem("discord_guild_icons", JSON.stringify({ [house]: null })), HOUSE.serverId);
    await page.getByRole("button", { name: "Se déconnecter" }).click();

    await expect(page).toHaveURL("/");
    const leftovers = await page.evaluate(() => ["discord_guild_icons", "user_house"].filter((key) => localStorage.getItem(key) !== null));
    expect(leftovers).toEqual([]);
    await expect.poll(() => queryOne<{ uuid: string }>("SELECT uuid FROM Users WHERE ID = ?", USERS.member.id)?.uuid).toBe("");
    await page.goto("/home");
    await expect(page).toHaveURL("/");
  });
});
