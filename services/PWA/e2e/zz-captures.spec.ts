// Captures temporaires pour l'audit visuel (fichier supprimé ensuite)
import { execute, HOUSE, test, USERS } from "./support/fixtures";

const PAGES = ["/", "/home", "/characterCard", "/caserne", "/creategroup", "/viewGroup", "/stat", "/Appforum", "/AppAdmin", "/settingbot"];

for (const [label, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]] as const) {
  test(`captures ${label}`, async ({ page, loginAs }) => {
    test.setTimeout(120_000);
    execute(`INSERT INTO GroupGvG${HOUSE.id} (User_ID, GroupNumber, Unit1, Unit2, Comment) VALUES (?, 1, 'Gardes varègues', 'Consulter un officier', 'Garde le drapeau'), (?, 1, 'Skjaldmös', '', '')`, USERS.member.id, USERS.officer.id);
    execute(`INSERT INTO NameGroupGvG${HOUSE.id} (GroupNumber, NameGroup) VALUES (1, 'Alpha')`);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.screenshot({ path: `e2e/.work/shots/${label}_accueil.png`, fullPage: true });
    await loginAs("owner");
    for (const path of PAGES.slice(1)) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      await page.screenshot({ path: `e2e/.work/shots/${label}${path.replace("/", "_")}.png`, fullPage: label === "desktop" });
    }
  });
}
