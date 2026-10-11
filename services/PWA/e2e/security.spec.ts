// Projet « prod » : image de production de la PWA (build Vite + Nginx, conteneur pwa-e2e).
// Vérifie les en-têtes de sécurité et que la CSP ne bloque aucune fonction de l'application.
import type { Page } from "@playwright/test";
import { execute, expect, HOUSE, test, USERS } from "./support/fixtures";

const EXPECTED_HEADERS: Record<string, RegExp> = {
  "content-security-policy": /default-src 'self'.*script-src 'self'.*frame-ancestors 'none'/,
  "strict-transport-security": /max-age=31536000/,
  "x-content-type-options": /^nosniff$/,
  "x-frame-options": /^DENY$/,
  "referrer-policy": /^strict-origin-when-cross-origin$/,
  "permissions-policy": /camera=\(\)/,
  "cross-origin-opener-policy": /^same-origin$/,
};

/** Enregistre les violations de CSP et les requêtes vers des domaines tiers */
async function watchPolicy(page: Page) {
  await page.addInitScript(() => {
    const violations: string[] = [];
    (window as unknown as { __csp: string[] }).__csp = violations;
    document.addEventListener("securitypolicyviolation", (event) => violations.push(`${event.violatedDirective} → ${event.blockedURI}`));
  });
  const thirdParty: string[] = [];
  page.on("request", (request) => {
    const { hostname } = new URL(request.url());
    if (!["pwa-e2e", "discord.com", "cdn.discordapp.com"].includes(hostname) && !request.url().startsWith("data:") && !request.url().startsWith("blob:")) {
      thirdParty.push(request.url());
    }
  });
  return {
    violations: () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp),
    thirdParty,
  };
}

test.describe("En-têtes de sécurité (Nginx)", () => {
  test("présents sur la page, le repli SPA, les fichiers et l'API", async ({ page }) => {
    await page.goto("/");
    const asset = await page.locator('script[type="module"]').getAttribute("src");

    // Pages, fichiers, API et images relayées (en-têtes du backend remplacés : une seule valeur par en-tête)
    for (const path of ["/", "/home", "/index.html", "/sw.js", asset!, `/api/home/?house=null`, "/img/weapon/Lance.png", "/img/Logo_EMTW.webp"]) {
      const response = await page.request.get(path, { headers: { cookie: "user_token=invalide" } });
      const headers = response.headers();
      for (const [name, pattern] of Object.entries(EXPECTED_HEADERS)) {
        expect(headers[name], `${name} sur ${path}`).toMatch(pattern);
      }
      // Version de Nginx non divulguée
      expect(headers.server, `server sur ${path}`).toBe("nginx");
    }
  });
});

test.describe("CSP appliquée à l'application réelle", () => {
  test("aucune ressource bloquée ni domaine tiers sur les pages", async ({ page, loginAs }) => {
    const policy = await watchPolicy(page);
    await page.goto("/");
    await page.goto("/description");
    await page.goto("/mentionlegale");

    await loginAs("owner");
    for (const path of ["/home", "/characterCard", "/caserne", "/creategroup", "/stat", "/consulcaserne", "/settingbot", "/Appforum", "/AppAdmin"]) {
      await page.goto(path);
      await expect(page.locator("main h1, main h2").first(), path).toBeVisible();
    }

    expect(await policy.violations()).toEqual([]);
    // Aucune requête vers Google Fonts ou un autre tiers (polices hébergées avec l'application)
    expect(policy.thirdParty).toEqual([]);
  });

  test("l'éditeur du forum et l'aperçu d'image fonctionnent", async ({ page, loginAs }) => {
    const policy = await watchPolicy(page);
    await loginAs("admin");

    await page.goto("/Appforum");
    await page.locator("summary", { hasText: "Créer un nouveau post" }).click();
    await page.locator(".ql-editor").first().fill("Texte saisi sous CSP");
    await expect(page.locator(".ql-editor").first()).toContainText("Texte saisi sous CSP");

    await page.goto("/AppAdmin");
    const form = page.locator("form", { has: page.getByRole("heading", { name: "Changer l'image d'une arme" }) });
    await form.locator("select").selectOption("Lance");
    await form.locator("input[type=file]").setInputFiles({
      name: "apercu.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGOISP30HwAFdwKvhpvLXgAAAABJRU5ErkJggg==", "base64"),
    });
    // Aperçu local en blob: affiché
    await expect.poll(() => form.locator("figure img").last().evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    expect(await policy.violations()).toEqual([]);
  });

  test("l'export des groupes en image fonctionne", async ({ page, loginAs }) => {
    execute(`INSERT INTO GroupGvG${HOUSE.id} (User_ID, GroupNumber, Unit1) VALUES (?, 1, 'Gardes varègues')`, USERS.member.id);
    const policy = await watchPolicy(page);
    await loginAs("officer");
    await page.goto("/viewGroup");
    await expect(page.locator(".capture")).toContainText(USERS.member.name);

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /Télécharger l'image des groupes/ }).click();
    expect((await download).suggestedFilename()).toMatch(/_groupGvG\.jpg$/);
    expect(await policy.violations()).toEqual([]);
  });
});
