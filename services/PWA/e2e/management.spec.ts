// Pages de gestion : statistiques et paramétrage du bot.
import { expect, HOUSE, queryOne, test, toast, USERS } from "./support/fixtures";

test.describe("Statistique", () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/stat");
    await expect(page.getByRole("heading", { name: "Statistique" })).toBeVisible();
  });

  test("liste tous les joueurs de la maison et trie par influence", async ({ page }) => {
    const names = () => page.locator("tbody td.name").allTextContents();
    expect((await names()).sort()).toEqual(Object.values(USERS).map((user) => user.name).sort());

    await page.getByRole("button", { name: /Influence/ }).click();
    const ascending = await names();
    expect(ascending.at(-1)).toBe(USERS.officer.name); // influence la plus haute (800)
    await page.getByRole("button", { name: /Influence/ }).click();
    expect((await names())[0]).toBe(USERS.officer.name);
  });

  test("le commentaire d'un gestionnaire est enregistré", async ({ page }) => {
    const row = page.locator("tbody tr", { has: page.locator("td.name", { hasText: USERS.member.name }) });
    await row.getByPlaceholder("Votre commentaire").fill("Joueur fiable");
    await page.getByRole("button", { name: "Ajouter les commentaires" }).click();

    await expect(toast(page)).toContainText("Information mise à jour avec succès");
    expect(queryOne<{ c: string }>("SELECT CommentGestionnaire AS c FROM Users WHERE ID = ?", USERS.member.id)!.c).toBe("Joueur fiable");
  });
});

test.describe("Paramétrage du bot Discord", () => {
  const house = () => queryOne<{ House_name: string; Late: number; ID_Chan_GvG: string }>("SELECT House_name, Late, ID_Chan_GvG FROM Houses WHERE ID = ?", HOUSE.id)!;

  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/settingbot");
    await expect(page.getByLabel("Nom de la maison")).toHaveValue(HOUSE.name);
  });

  test("un ID Discord invalide est signalé et bloque l'envoi", async ({ page }) => {
    const field = page.getByLabel("ID du chan Discord ou les utilisateurs vote");
    await field.fill("123");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("button", { name: /Appliquer la mise à jour/ }).click();

    // Ni fenêtre de confirmation ni enregistrement
    expect(await field.evaluate((input: HTMLInputElement) => input.validity.patternMismatch)).toBe(true);
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    expect(house().ID_Chan_GvG).toBe("300000000000000001");
  });

  test("le nom de la maison et le bouton « En retard » sont enregistrés", async ({ page, confirm }) => {
    await page.getByLabel("Nom de la maison").fill("Maison Renommée");
    await page.locator("label.switch", { hasText: "En retard" }).click();
    await page.getByRole("button", { name: /Appliquer la mise à jour/ }).click();
    await confirm();

    await expect(toast(page)).toContainText("paramètres du bot effectué avec succès");
    expect(house()).toMatchObject({ House_name: "Maison Renommée", Late: 0 });
  });

  test("sans modification, rien n'est envoyé", async ({ page }) => {
    await page.getByRole("button", { name: /Appliquer la mise à jour/ }).click();
    await expect(toast(page)).toContainText("Aucun changement détecté");
  });
});
