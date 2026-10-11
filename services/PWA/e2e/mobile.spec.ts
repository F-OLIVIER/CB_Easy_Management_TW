// Exécuté par le projet "mobile" (Pixel 7) : affichage sans débordement horizontal.
import { expect, test } from "./support/fixtures";

const PAGES = ["/home", "/characterCard", "/caserne", "/creategroup", "/stat", "/Appforum", "/AppAdmin"];

test("les pages tiennent dans la largeur d'un téléphone", async ({ page, loginAs }) => {
  await loginAs("owner");
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator("main h1, main h2").first(), path).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `débordement horizontal sur ${path}`).toBeLessThanOrEqual(0);
  }
});

test("l'accueil public s'affiche sur téléphone", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero").getByRole("button", { name: "Connexion avec Discord" })).toBeVisible();
});
