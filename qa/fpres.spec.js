import { test, expect } from "@playwright/test";

const BASE = "http://127.0.0.1:4173";

const routes = [
  "/", "/index.html", "/catalog.html", "/catalog.html?platform=PlayStation",
  "/catalog.html?platform=Xbox", "/catalog.html?platform=Nintendo",
  "/catalog.html?platform=Steam", "/catalog.html?type=keys",
  "/catalog.html?type=dlc", "/catalog.html?type=services",
  "/catalog.html?type=topup", "/catalog.html?type=subscriptions",
  "/product.html?id=1091500", "/seller.html?slug=gamekey",
  "/sellers.html", "/chat.html", "/support.html",
  "/info.html?section=faq", "/info.html?section=commissions",
  "/info.html?section=security", "/info.html?section=contacts",
  "/info.html?section=refunds", "/info.html?section=terms",
  "/info.html?section=privacy", "/cart.html", "/checkout.html",
  "/account.html", "/account.html?tab=orders",
  "/account.html?tab=favorites", "/account.html?tab=profile",
  "/seller-dashboard.html", "/seller-dashboard.html?tab=products",
  "/seller-dashboard.html?tab=orders", "/seller-dashboard.html?tab=inventory",
  "/seller-dashboard.html?tab=finance", "/seller-dashboard.html?tab=analytics",
  "/order.html?number=FP-48291"
];

test.describe("FPRES route smoke", () => {
  for (const route of routes) {
    test(route, async ({ page }) => {
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("undefined");
      expect(errors, route + " page errors").toEqual([]);
    });
  }
});

test("catalog search, platform, category and sort controls work", async ({ page }) => {
  await page.goto(BASE + "/catalog.html");
  const initial = await page.locator("#grid .gameCard").count();
  expect(initial).toBeGreaterThan(0);
  await page.locator("[data-platform='PlayStation']").click();
  await expect(page.locator("#count")).toContainText("10");
  await page.locator("[data-type='dlc']").click();
  expect(await page.locator("#grid .gameCard").count()).toBeGreaterThan(0);
  await page.locator("#sort").selectOption("asc");
  await page.locator("#catQ").fill("God of War");
  expect(await page.locator("#grid .gameCard").count()).toBeGreaterThan(0);
});

test("favorite flow works from catalog to account", async ({ page }) => {
  await page.goto(BASE + "/catalog.html");
  const favorite = page.locator("[data-fav-game]").first();
  const id = await favorite.getAttribute("data-fav-game");
  await favorite.click();
  await page.goto(BASE + "/account.html?tab=favorites");
  await expect(page.locator(`[data-fav-game="${id}"]`)).toBeVisible();
});

test("cart, quantity controls and checkout demo work", async ({ page }) => {
  await page.goto(BASE + "/product.html?id=1091500");
  await page.locator("[data-buy]").first().click();
  await page.goto(BASE + "/cart.html");
  await expect(page.locator(".cartItem")).toHaveCount(1);
  await page.locator("[data-inc='1091500']").click();
  await expect(page.locator(".qty span")).toHaveText("2");
  await page.locator("[data-dec='1091500']").click();
  await page.locator("a[href='checkout.html']").click();
  await page.locator("#email").fill("demo@fpres.local");
  await page.locator("#buyerName").fill("Demo Player");
  await page.locator("[data-method='sbp']").click();
  await page.locator("#pay").click();
  await expect(page).toHaveURL(/order\.html\?number=FP-/);
  await expect(page.locator(".orderHero")).toContainText("Выдан");
});

test("seller profile, follow and chat work", async ({ page }) => {
  await page.goto(BASE + "/seller.html?slug=gamekey");
  await page.locator("[data-follow='gamekey']").click();
  await expect(page.locator("[data-follow='gamekey']")).toContainText("Подписан");
  await page.locator("a[href^='chat.html?seller=gamekey']").click();
  await page.locator("#chatInput").fill("Здравствуйте");
  await page.locator("[data-send-chat]").click();
  await expect(page.locator(".bubble.me")).toContainText("Здравствуйте");
});

test("seller dashboard tabs work", async ({ page }) => {
  for (const tab of ["overview","products","orders","inventory","finance","analytics"]) {
    await page.goto(BASE + "/seller-dashboard.html?tab=" + tab);
    await expect(page.locator("main")).toBeVisible();
  }
  await page.goto(BASE + "/seller-dashboard.html?tab=finance");
  await page.locator("#withdrawAmount").fill("5000");
  await page.locator("[data-withdraw]").click();
  await expect(page.locator(".toast")).toContainText("5000");
});

test("support, login and buyer seller separation work", async ({ page }) => {
  await page.goto(BASE + "/");
  await page.locator(".trustClickable").click();
  await expect(page).toHaveURL(/support\.html\?section=order/);
  await expect(page.locator("h1")).toContainText("Проблема с заказом");
  await page.goto(BASE + "/support.html");
  await page.locator("[data-ticket]").click();
  await expect(page.locator(".toast")).toContainText("FP-HELP-1024");
  await page.goto(BASE + "/");
  await expect(page.locator(".chatFloat")).toContainText("Чаты");
  await expect(page.locator("a[href='seller-dashboard.html']").first()).toHaveCount(1);
  await page.locator("[data-login]").click();
  await expect(page).toHaveURL(/account\.html\?auth=1/);
  await expect(page.locator("#loginModal")).toHaveClass(/show/);
  await page.locator("[data-close]").click();
  await expect(page).toHaveURL(/\/$/);
  await page.locator("[data-login]").click();
  await expect(page).toHaveURL(/account\.html\?auth=1/);
  await page.locator("#loginName").fill("QA Player");
  await page.locator("#loginEmail").fill("qa@fpres.local");
  await page.locator("[data-enter]").click();
  await expect(page).toHaveURL(/account\.html$/);
  await expect(page.locator("h1")).toContainText("Мой FPRES");
});

test("all internal anchors resolve to existing local documents", async ({ page, request }) => {
  await page.goto(BASE + "/");
  const hrefs = await page.locator("a[href]").evaluateAll(as =>
    as.map(a => a.getAttribute("href")).filter(Boolean)
      .filter(h => !h.startsWith("#") && !h.startsWith("http") && !h.startsWith("mailto:"))
  );
  const unique = [...new Set(hrefs.map(h => h.split("?")[0]).filter(h => h.endsWith(".html") || h === "/"))];
  for (const href of unique) {
    const url = href === "/" ? BASE + "/" : BASE + "/" + href.replace(/^\//, "");
    const res = await request.get(url);
    expect(res.status(), "broken internal link: " + href).toBe(200);
  }
});
