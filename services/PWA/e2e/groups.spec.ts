import type { Page } from "@playwright/test";
import { expect, HOUSE, queryAll, queryOne, test, toast, USERS } from "./support/fixtures";

const OFFICER = "Consulter un officier";
const groupRows = (table = "GroupGvG") =>
  queryAll<{ User_ID: number; GroupNumber: number; Unit1: string; Unit2: string; Comment: string }>(`SELECT * FROM ${table}${HOUSE.id} ORDER BY ID`);
const groupName = (number: number) => queryOne<{ NameGroup: string }>(`SELECT NameGroup FROM NameGroupGvG${HOUSE.id} WHERE GroupNumber = ?`, number)?.NameGroup;

async function save(page: Page) {
  // Attente de la réponse : la notification d'une sauvegarde précédente peut encore être affichée
  const response = page.waitForResponse((res) => res.url().includes("/api/saveGroupInDB/"));
  await page.locator(".savebar").getByRole("button", { name: /Sauvegarder les groupes/ }).click();
  const data = await (await response).json();
  expect(data.Gestion.Notification.content.fr).toContain("Les groupes ont été enregistrés avec succès");
  await expect(toast(page)).toContainText("Les groupes ont été enregistrés avec succès");
}

/** Compose le groupe 1 : Alice avec une unité, « Consulter un officier » et un commentaire */
async function composeGroup(page: Page) {
  const group = page.locator(".group").first();
  await group.getByPlaceholder("Nom du groupe").fill("Alpha");
  const slot = group.locator(".slot").first();
  await slot.locator(".slot__player select").selectOption(USERS.member.name);
  const units = slot.locator(".slot__units select");
  await units.nth(0).selectOption("Gardes varègues");
  await units.nth(1).selectOption(OFFICER);
  await slot.locator(".slot__comment label.switch").click();
  await slot.locator(".slot__comment input[type=text]").fill("Garde le drapeau");
  return { group, slot };
}

test.describe("Création des groupes TW", () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/creategroup");
    await expect(page.getByRole("heading", { name: "Créer les groupes TW" })).toBeVisible();
  });

  test("un groupe composé est enregistré puis prévisualisé", async ({ page }) => {
    const { slot } = await composeGroup(page);
    // Influence des unités / influence du joueur
    await expect(slot.locator(".slot__influence")).toHaveText(/\d+ \/ 750/);
    await save(page);

    expect(groupRows()).toEqual([
      expect.objectContaining({ User_ID: USERS.member.id, GroupNumber: 1, Unit1: "Gardes varègues", Unit2: OFFICER, Comment: "Garde le drapeau" }),
    ]);
    expect(groupName(1)).toBe("Alpha");

    await page.getByRole("button", { name: /Prévisualisations des groupes/ }).click();
    await expect(page).toHaveURL("/viewGroup");
    const capture = page.locator(".capture");
    await expect(capture).toContainText("Groupe Alpha");
    await expect(capture).toContainText(USERS.member.name);
    await expect(capture).toContainText("Gardes varègues");
    await expect(capture).toContainText("Garde le drapeau");
  });

  test("seuls les inscrits sont proposés, et un joueur placé n'est plus proposé ailleurs", async ({ page }) => {
    const slots = page.locator(".group").first().locator(".slot");
    const options = () => slots.nth(1).locator(".slot__player select option").allTextContents();

    // Inscrits : présents (Alice, Bob) et en retard (Carole) ; Owen non inscrit, Damien absent
    expect((await options()).map((text) => text.replace("🕐 ", "").trim())).toEqual(["Choisissez", "Alice", "Bob", "Carole"]);
    expect(await options()).toContain(`🕐 ${USERS.admin.name}`);

    await slots.nth(0).locator(".slot__player select").selectOption(USERS.member.name);
    expect(await options()).not.toContain(USERS.member.name);
  });

  test("un nom de groupe effacé est bien supprimé à l'enregistrement", async ({ page }) => {
    await composeGroup(page);
    await save(page);
    expect(groupName(1)).toBe("Alpha");

    await page.locator(".group").first().getByPlaceholder("Nom du groupe").fill("");
    await save(page);
    expect(groupName(1)?.trim()).toBe("");
    await page.reload();
    await expect(page.locator(".group").first().getByPlaceholder("Nom du groupe")).toHaveValue("");
  });

  test("les groupes peuvent être enregistrés comme groupe type attaque", async ({ page, confirm }) => {
    await composeGroup(page);
    await page.locator("details.collapse", { hasText: "Groupes type" }).locator("summary").click();
    await page.locator(".grid .stack", { hasText: "Sauvegarder le groupe en tant que groupe type" }).getByRole("button", { name: /Attaque/ }).click();
    await confirm();

    await expect(toast(page)).toContainText("groupe type attaque");
    expect(groupRows("GroupTypeAtt")).toEqual([expect.objectContaining({ User_ID: USERS.member.id, Unit1: "Gardes varègues" })]);
    // Les groupes en cours ne sont pas modifiés par une sauvegarde de groupe type
    expect(groupRows()).toEqual([]);
  });
});
