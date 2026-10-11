import { expect, test } from "./support/fixtures";

test.describe("Pages publiques", () => {
  test("l'accueil présente l'application et la connexion Discord", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Easy Management TW" })).toBeVisible();
    await expect(page.locator(".hero").getByRole("button", { name: /Connexion avec Discord|Login with Discord/ })).toBeVisible();
    await expect(page.locator(".hero").getByRole("link", { name: /Comment sa marche|How does it work/ })).toHaveAttribute("href", "/description");
  });

  test("la langue change sans rechargement et reste mémorisée", async ({ page }) => {
    await page.goto("/");
    await page.locator(".header__lang").selectOption("fr");
    await expect(page.locator(".hero").getByRole("button")).toContainText("Connexion avec Discord");

    await page.locator(".header__lang").selectOption("en");
    await expect(page.locator(".hero").getByRole("button")).toContainText("Login with Discord");
    await page.reload();
    await expect(page.locator(".header__lang")).toHaveValue("en");
  });

  test("les pages Comment ça marche et Mentions légales s'affichent", async ({ page }) => {
    await page.goto("/description");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("table").first()).toBeVisible();

    await page.goto("/mentionlegale");
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("les mentions légales contiennent les informations RGPD", async ({ page }) => {
    await page.goto("/mentionlegale");
    for (const section of ["Données personnelles traitées", "Base légale", "Vos droits", "Cookies et stockage dans votre navigateur", "Partage des informations"]) {
      await expect(page.getByRole("heading", { name: section })).toBeVisible();
    }
    await expect(page.locator("#rights")).toContainText("CNIL");
  });

  test("une adresse inconnue renvoie vers l'accueil", async ({ page }) => {
    await page.goto("/page-qui-n-existe-pas");
    await expect(page).toHaveURL("/");
  });

  test("une page privée sans session renvoie vers l'accueil", async ({ page }) => {
    for (const path of ["/home", "/caserne", "/creategroup", "/AppAdmin"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL("/");
    }
  });
});
