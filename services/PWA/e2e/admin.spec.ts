import fs from "node:fs";
import path from "node:path";
import { WEAPON_DIR } from "./support/env";
import { expect, queryOne, test, toast } from "./support/fixtures";

/** Image PNG 2x3 générée pour le test (en-tête IHDR lisible : largeur et hauteur) */
const PNG_2x3 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAYAAAC56t6BAAAAFklEQVR4nGM8ISf3n4GBgYGJAQrgDAAxYwIJYJaQ3AAAAABJRU5ErkJggg==",
  "base64",
);
const pngSize = (file: string) => {
  const header = fs.readFileSync(file);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
};

test.describe("Administration", () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/AppAdmin");
    await expect(page.getByRole("heading", { name: "Page d'administration" })).toBeVisible();
  });

  test("l'image d'une arme est remplacée", async ({ page, confirm }) => {
    const target = path.join(WEAPON_DIR, "Lance.png");
    const original = fs.readFileSync(target);
    const form = page.locator("form", { has: page.getByRole("heading", { name: "Changer l'image d'une arme" }) });

    await form.locator("select").selectOption("Lance");
    await form.locator("input[type=file]").setInputFiles({ name: "nouvelle lance.png", mimeType: "image/png", buffer: PNG_2x3 });
    await expect(form.locator("figure")).toHaveCount(2); // image actuelle + aperçu
    await form.getByRole("button", { name: "Remplacer l'image" }).click();
    await confirm();

    await expect(toast(page)).toContainText("Image de l'arme « Lance » mise à jour");
    try {
      expect(pngSize(target)).toEqual({ width: 2, height: 3 });
    } finally {
      fs.writeFileSync(target, original);
    }
  });

  test("une nouvelle arme est ajoutée", async ({ page, confirm }) => {
    const form = page.locator("form", { has: page.getByRole("heading", { name: "Ajouter une arme" }) });
    await form.getByLabel("Nom (anglais)").fill("Bastard sword");
    await form.getByLabel("Nom (français)").fill("Épée bâtarde");
    await form.getByRole("button", { name: "Ajouter l'arme" }).click();
    await confirm();

    await expect(toast(page)).toContainText("Nouvelle arme ajoutée avec succès");
    expect(queryOne("SELECT ClasseEN FROM ListGameCharacter WHERE ClasseFR = ?", "Épée bâtarde")).toEqual({ ClasseEN: "Bastard sword" });
  });
});
