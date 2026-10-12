import { expect, HOUSE, queryOne, test, toast, USERS } from "./support/fixtures";

// Unité n° 1 du script ListUnit : Gardes varègues (infanterie T5, level max 30)
const UNIT = { id: 1, name: "Gardes varègues" };
const level = (userId: number) => queryOne<{ lvl: number }>(`SELECT Unit${UNIT.id} AS lvl FROM Caserne${HOUSE.id} WHERE User_ID = ?`, userId)?.lvl;
const doctrines = (userId: number) => queryOne<{ DoctrineInflu: string }>("SELECT DoctrineInflu FROM Users WHERE ID = ?", userId)!.DoctrineInflu;

test.describe("Ma caserne", () => {
  test("le level et la doctrine d'une unité sont enregistrés", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/caserne");

    const unit = page.locator("article.unit", { hasText: UNIT.name });
    await unit.getByRole("combobox", { name: `level ${UNIT.name}` }).selectOption("25");
    await unit.locator("label.switch").click();
    await expect(page.locator(".savebar")).toContainText("Modifications non enregistrées : 1");

    await page.getByRole("button", { name: "Mettre à jour ma caserne" }).click();
    await expect(toast(page)).toContainText("caserne a bien été mise à jour");
    expect(level(USERS.member.id)).toBe(25);
    expect(doctrines(USERS.member.id).split(",")).toContain(String(UNIT.id));

    // Après rechargement, l'état enregistré est affiché
    await page.reload();
    await expect(page.locator("article.unit", { hasText: UNIT.name }).getByRole("combobox", { name: `level ${UNIT.name}` })).toContainText("level 25");
  });

  test("la recherche filtre les unités", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/caserne");
    await page.getByRole("searchbox", { name: "Rechercher une unité" }).fill("varègues");
    await expect(page.locator("article.unit")).toHaveCount(1);
    await expect(page.locator("article.unit")).toContainText(UNIT.name);
  });

  test("le filtre par tier n'affiche que les tiers cochés", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/caserne");
    const units = page.locator("article.unit");
    const tier = (name: string) => page.locator("label.switch", { hasText: new RegExp(`^${name}$`) });
    await expect(units.first()).toBeVisible();
    const total = await units.count();

    await tier("T5").click();
    await expect(units.first()).toBeVisible();
    for (const text of await units.locator(".unit__body p").allTextContents()) expect(text).toMatch(/· T5$/);

    await tier("T4").click();
    for (const text of await units.locator(".unit__body p").allTextContents()) expect(text).toMatch(/· T[45]$/);

    // Aucun tier coché : toutes les unités
    await tier("T5").click();
    await tier("T4").click();
    await expect(units).toHaveCount(total);
  });
});

test.describe("Consulter une caserne (gestionnaire)", () => {
  test("un gestionnaire met à jour la caserne d'un joueur", async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/consulcaserne");
    await page.getByRole("combobox", { name: "Selectionner la caserne du joueur" }).selectOption({ label: USERS.member.name });

    const unit = page.locator("article.unit", { hasText: UNIT.name });
    await unit.getByRole("combobox", { name: `level ${UNIT.name}` }).selectOption("10");
    await page.getByRole("button", { name: "Mettre à jour la caserne" }).click();

    await expect(toast(page)).toContainText(`La caserne de ${USERS.member.name} a bien été mise à jour`);
    expect(level(USERS.member.id)).toBe(10);
    // La caserne du gestionnaire n'est pas touchée
    expect(level(USERS.officer.id)).toBe(15);
  });
});
