import { expect, queryOne, test, toast, USERS } from "./support/fixtures";

const alice = USERS.member;
const userRow = () => queryOne<{ Lvl: number; Influence: number; EtatInscription: number }>("SELECT Lvl, Influence, EtatInscription FROM Users WHERE ID = ?", alice.id)!;

test.describe("Fiche personnage", () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/characterCard");
    await expect(page.getByRole("heading", { name: "Informations de mon héros" })).toBeVisible();
  });

  test("affiche les informations du héros", async ({ page }) => {
    const facts = page.locator(".facts").first();
    await expect(facts).toContainText("Lance");
    await expect(facts).toContainText(String(alice.lvl));
    await expect(facts).toContainText(String(alice.influence));
  });

  test("le level mis à jour est enregistré", async ({ page }) => {
    await page.getByPlaceholder("Nouveau level").fill("1300");
    await page.getByRole("button", { name: "Mettre à jour mon personnage" }).click();

    await expect(toast(page)).toContainText("level a été mis à jour");
    await expect(page.locator(".facts").first()).toContainText("1300");
    expect(userRow().Lvl).toBe(1300);
  });

  test("une influence impossible est bloquée sans rien envoyer", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => request.url().includes("/api/updateCharacterCard/") && requests.push(request.url()));
    const influence = page.getByPlaceholder("Nouvelle influence");
    await influence.fill("2000");
    await page.getByRole("button", { name: "Mettre à jour mon personnage" }).click();

    // Contrôle du navigateur (min 700 / max 1200) : le formulaire n'est pas envoyé
    expect(await influence.evaluate((input: HTMLInputElement) => input.validity.rangeOverflow)).toBe(true);
    expect(requests).toEqual([]);
    expect(userRow().Influence).toBe(alice.influence);
  });

  test("l'inscription à la TW change d'état (bouton retard activé par la maison)", async ({ page }) => {
    await expect(page.getByText("Inscrit présent pour la prochaine TW")).toBeVisible();
    await expect(page.getByRole("button", { name: "M'inscrire en retard" })).toBeVisible();
    await expect(page.getByRole("button", { name: "M'inscrire présent" })).toHaveCount(0);

    await page.getByRole("button", { name: "M'inscrire absent" }).click();
    await expect(page.getByText("Inscrit absent pour la prochaine TW")).toBeVisible();
    expect(userRow().EtatInscription).toBe(3);
  });
});
