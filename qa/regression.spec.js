import { test, expect } from "@playwright/test";

const BASE = "http://127.0.0.1:4173";
const routes = ["/","/catalog.html","/product.html?id=1091500","/seller.html?slug=gamekey","/sellers.html","/chat.html?seller=gamekey","/support.html","/info.html?section=faq","/cart.html","/checkout.html","/account.html","/account.html?tab=favorites","/account.html?tab=profile","/seller-dashboard.html","/seller-dashboard.html?tab=products","/seller-dashboard.html?tab=orders","/seller-dashboard.html?tab=inventory","/seller-dashboard.html?tab=finance","/seller-dashboard.html?tab=analytics","/order.html?number=FP-48291"];

test.describe("FPRES regression", () => {
  test("all primary routes render without runtime errors", async ({ page }) => {
    for (const route of routes) {
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("undefined");
      expect(errors, route + " runtime errors").toEqual([]);
      page.removeAllListeners("pageerror");
    }
  });

  test("buyer login persists through reload and logout returns home", async ({ page }) => {
    await page.goto(BASE + "/account.html?auth=1");
    await page.locator("#loginName").fill("Regression Buyer");
    await page.locator("#loginEmail").fill("regression@fpres.local");
    await page.locator("[data-enter]").click();
    await expect(page).toHaveURL(/account\.html$/);
    await expect(page.locator("h1")).toContainText("Мой FPRES");
    await page.reload();
    await expect(page.locator("h1")).toContainText("Мой FPRES");
    await page.locator("[data-logout]").click();
    await expect(page).toHaveURL(/index\.html$/);
    await page.goto(BASE + "/account.html");
    await expect(page.locator("#loginNameDirect")).toBeVisible();
  });

  test("account login modal can be opened and closed", async ({ page }) => {
    await page.goto(BASE + "/account.html?auth=1");
    await expect(page.locator("#loginModal")).toHaveClass(/show/);
    await page.locator("[data-close]").click();
    await expect(page).toHaveURL(/index\.html$/);
  });

  test("seller login, all tabs, withdrawal and logout work", async ({ page }) => {
    await page.goto(BASE + "/seller-dashboard.html");
    await page.locator("#sellerLoginPassword").fill("regression-password");
    await page.locator("[data-seller-enter]").click();
    await expect(page.locator("h1")).toContainText("Кабинет продавца");
    for (const tab of ["overview","products","orders","inventory","finance","analytics"]) {
      await page.goto(BASE + "/seller-dashboard.html?tab=" + tab);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("undefined");
    }
    await page.goto(BASE + "/seller-dashboard.html?tab=finance");
    await page.locator("#withdrawAmount").fill("5000");
    await page.locator("[data-withdraw]").click();
    expect((await page.locator(".toast").innerText()).replace(/\u00a0/g, " ")).toContain("5 000");
    await page.locator("[data-logout='seller']").click();
    await expect(page).toHaveURL(/index\.html$/);
    await page.goto(BASE + "/seller-dashboard.html");
    await expect(page.locator("#sellerLoginPassword")).toBeVisible();
  });

  test("cart checkout creates a delivered order", async ({ page }) => {
    await page.goto(BASE + "/product.html?id=1091500");
    await page.locator("[data-buy]").first().click();
    await page.goto(BASE + "/cart.html");
    await expect(page.locator(".cartItem")).toHaveCount(1);
    await page.locator("a[href='checkout.html']").click();
    await page.locator("#email").fill("regression@fpres.local");
    await page.locator("#buyerName").fill("Regression Buyer");
    await page.locator("[data-method='sbp']").click();
    await page.locator("#pay").click();
    await expect(page).toHaveURL(/order\.html\?number=FP-/);
    await expect(page.locator(".orderHero")).toContainText("Выдан");
  });

  test("chat and support actions fire once", async ({ page }) => {
    await page.goto(BASE + "/chat.html?seller=gamekey");
    await page.locator("#chatInput").fill("Regression chat");
    await page.locator("[data-send-chat]").click();
    await expect(page.locator(".bubble.me")).toHaveCount(1);
    await expect(page.locator(".toast")).toHaveCount(1);
    await page.goto(BASE + "/support.html");
    await page.locator("[data-ticket]").click();
    await expect(page.locator(".toast")).toHaveCount(1);
    await expect(page.locator(".toast")).toContainText("FP-HELP-1024");
  });

  test("favorites toggle and catalog search work", async ({ page }) => {
    await page.goto(BASE + "/catalog.html");
    const fav = page.locator("[data-fav-game]").first();
    const initiallyActive = await fav.evaluate(el => el.classList.contains("active"));
    if (initiallyActive) await fav.click();
    await fav.click();
    await expect(fav).toHaveClass(/active/);
    await fav.click();
    await expect(fav).not.toHaveClass(/active/);
    await page.locator("[data-search]").fill("Cyberpunk");
    await page.locator("[data-search]").press("Enter");
    await expect(page).toHaveURL(/catalog\.html\?q=/);
  });
});
