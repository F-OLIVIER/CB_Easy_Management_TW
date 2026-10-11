import type { Page } from "@playwright/test";
import { expect, FORUM, queryAll, queryOne, test, toast, USERS } from "./support/fixtures";

const openPost = async (page: Page, title: string) => {
  await page.locator("button.post", { hasText: title }).click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByRole("heading", { name: title })).toBeVisible();
  return modal;
};

test.describe("Forum", () => {
  test("un utilisateur publie un post, qui attend la validation d'un administrateur", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/Appforum");
    // La file de validation n'est pas visible pour un utilisateur
    await expect(page.getByRole("heading", { name: "Post à valider" })).toHaveCount(0);
    await expect(page.locator("button.post", { hasText: FORUM.pending.title })).toHaveCount(0);

    await page.locator("summary", { hasText: "Créer un nouveau post" }).click();
    await page.getByLabel("Titre du post").fill("Idée d'amélioration");
    await page.locator(".ql-editor").first().fill("Pouvoir trier la caserne par tier.");
    await page.getByRole("button", { name: "Publier le post" }).click();

    await expect(toast(page)).toContainText("Votre post a été créé avec succès");
    const post = queryOne<{ Valid: number; Author: number; Content: string }>("SELECT Valid, Author, Content FROM Forum WHERE Title = ?", "Idée d'amélioration");
    expect(post).toMatchObject({ Valid: 0, Author: USERS.member.id });
    expect(post!.Content).toContain("Pouvoir trier la caserne par tier.");
  });

  test("un administrateur valide un post en attente", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/Appforum");
    await expect(page.getByRole("heading", { name: "Post à valider" })).toBeVisible();

    const modal = await openPost(page, FORUM.pending.title);
    await modal.getByRole("button", { name: "Valider le post" }).click();

    await expect(toast(page)).toContainText("Post validé avec succès");
    expect(queryOne<{ Valid: number }>("SELECT Valid FROM Forum WHERE ID = ?", FORUM.pending.id)!.Valid).toBe(1);
  });

  test("une réponse est ajoutée à un post actif", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/Appforum");
    const modal = await openPost(page, FORUM.active.title);
    await modal.locator("summary", { hasText: "Ecrire une réponse" }).click();
    await modal.locator(".ql-editor").fill("Merci pour l'accueil !");
    await modal.getByRole("button", { name: "Publier la réponse" }).click();

    await expect(toast(page)).toContainText("Votre commentaire a été créé avec succès");
    const comments = queryAll<{ Author: number; Content: string }>("SELECT Author, Content FROM Comments WHERE Post_ID = ?", FORUM.active.id);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ Author: USERS.member.id });
    expect(comments[0].Content).toContain("Merci pour l'accueil !");
  });

  test("le HTML piégé d'un post n'est jamais exécuté", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/Appforum");
    const modal = await openPost(page, FORUM.xss.title);
    await expect(modal.locator(".rich-content").first()).toContainText("Bonjour");

    expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
    await expect(modal.locator(".rich-content script")).toHaveCount(0);
    await expect(modal.locator(".rich-content img[onerror]")).toHaveCount(0);
  });
});
