// Droits d'accès : utilisateur < gestionnaire < administrateur < propriétaire.
import type { Page } from "@playwright/test";
import { expect, HOUSE, test, toast } from "./support/fixtures";

const tile = (page: Page, label: string) => page.locator("a.tile", { hasText: label });

const USER_TILES = ["Ma fiche personnage", "Ma caserne", "Forum"];
const OFFICER_TILES = ["Créer les groupes TW", "Statistique", "Consulter une caserne", "Paramétrage du bot Discord"];
const ADMIN_TILE = "Page d'administration";
const OWNER_SECTIONS = ["Statistiques de la base", "Information Discord (toutes les maisons)", "Message privé Discord"];

test.describe("Tableau de bord selon le rôle", () => {
  test("utilisateur : uniquement ses pages", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    for (const label of USER_TILES) await expect(tile(page, label)).toBeVisible();
    for (const label of [...OFFICER_TILES, ADMIN_TILE]) await expect(tile(page, label)).toHaveCount(0);
  });

  test("gestionnaire : pages de gestion, pas l'administration", async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/home");
    for (const label of [...USER_TILES, ...OFFICER_TILES]) await expect(tile(page, label)).toBeVisible();
    await expect(tile(page, ADMIN_TILE)).toHaveCount(0);
  });

  test("administrateur : accès à l'administration", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/home");
    await expect(tile(page, ADMIN_TILE)).toBeVisible();
  });
});

test.describe("Accès direct par l'adresse", () => {
  test("un utilisateur ne peut pas ouvrir une page de gestion", async ({ page, loginAs }) => {
    await loginAs("member");
    for (const path of ["/creategroup", "/stat", "/consulcaserne", "/settingbot"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL("/home");
      await expect(toast(page)).toContainText("Accès réservé");
    }
  });

  test("un gestionnaire ne peut pas ouvrir l'administration", async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/AppAdmin");
    await expect(page).toHaveURL("/home");
    await expect(toast(page)).toContainText("Accès réservé");
  });

  test("le serveur ne renvoie pas les données de gestion à un utilisateur", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    const response = await page.request.post(`/api/creategroup/?house=${HOUSE.serverId}`);
    const data = await response.json();
    expect(data.Gestion.Officier).toBe(false);
    expect(data.ListInscripted).toBeNull();
    expect(data.GroupGvG).toBeNull();
  });
});

test.describe("Page d'administration", () => {
  test("administrateur : sections propriétaire absentes, données jamais envoyées", async ({ page, loginAs }) => {
    await loginAs("admin");
    const adminResponse = page.waitForResponse((response) => response.url().includes("/api/CheckAppAdmin/"));
    await page.goto("/AppAdmin");
    await expect(page.getByRole("heading", { name: "Page d'administration" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Changer l'image d'une arme" })).toBeVisible();
    for (const section of OWNER_SECTIONS) await expect(page.getByRole("heading", { name: section })).toHaveCount(0);

    const data = await (await adminResponse).json();
    expect(data.Statistique.Houses).toBeNull();
  });

  test("propriétaire : statistiques, information et message privé Discord", async ({ page, loginAs }) => {
    await loginAs("owner");
    await page.goto("/AppAdmin");
    for (const section of OWNER_SECTIONS) await expect(page.getByRole("heading", { name: section })).toBeVisible();
    await expect(page.locator("table").getByRole("cell", { name: HOUSE.name })).toBeVisible();
  });
});
