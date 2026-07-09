import { expect, test, type Locator, type Page } from "playwright/test";

async function freshPage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page).toHaveTitle("Benji Peng");
}

async function hintUntilComplete(
  page: Page,
  section: "lumen" | "palimpsest",
  maxHints: number,
) {
  const game = page.locator(`#${section} [data-game-state]`);
  const hint = page.locator(`#${section}`).getByRole("button", { name: /^Hint/ });
  for (let index = 0; index < maxHints; index += 1) {
    if ((await game.getAttribute("data-game-state")) === "complete") break;
    await hint.click();
  }
  await expect(game).toHaveAttribute("data-game-state", "complete");
}

async function dragLogical(
  page: Page,
  canvas: Locator,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas is not visible");
  const point = (value: { x: number; y: number }) => ({
    x: box.x + (value.x / 900) * box.width,
    y: box.y + (value.y / 620) * box.height,
  });
  const start = point(from);
  const end = point(to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 5 });
  await page.mouse.up();
}

test("navigation exposes the two new museum exhibits", async ({ page }) => {
  await freshPage(page);

  await page.getByRole("button", { name: "Lumen", exact: true }).click();
  await expect.poll(() => page.locator("#lumen").evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(90);
  await expect(page.locator("#lumen h2")).toContainText("Lumen");

  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect
    .poll(() => page.locator("#palimpsest").evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThan(90);
  await expect(page.locator("#palimpsest h2")).toContainText("Palimpsest");
  await expect(page.getByRole("button", { name: "Orbital", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Courier", exact: true })).toHaveCount(0);
});

test("lumen supports manipulation, completion, unlocks, and persistence", async ({ page }) => {
  await freshPage(page);
  const section = page.locator("#lumen");
  await page.getByTestId("lumen-begin").scrollIntoViewIfNeeded();
  await page.getByTestId("lumen-begin").click();
  const game = section.locator("[data-game-state]");
  await expect(game).toHaveAttribute("data-game-state", "play");

  const canvas = section.locator('canvas[role="application"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Lumen canvas is not visible");
  await canvas.click({
    position: { x: (420 / 900) * box.width, y: (300 / 620) * box.height },
  });
  await canvas.press("]");
  await expect(section.locator("footer")).toContainText("M1 selected");
  await expect(section.getByRole("button", { name: "Undo" })).toBeEnabled();

  await hintUntilComplete(page, "lumen", 14);
  await expect(page.getByTestId("lumen-next")).toBeVisible();
  await expect(page.getByTestId("lumen-plate-2")).toBeEnabled();

  await page.reload();
  await expect(section.locator("header")).toContainText("1 archived");
  await expect(page.getByTestId("lumen-plate-2")).toBeEnabled();
});

test("palimpsest supports tactile restoration, layers, completion, and persistence", async ({ page }) => {
  await freshPage(page);
  const section = page.locator("#palimpsest");
  await page.getByTestId("palimpsest-begin").scrollIntoViewIfNeeded();
  await page.getByTestId("palimpsest-begin").click();
  const game = section.locator("[data-game-state]");
  await expect(game).toHaveAttribute("data-game-state", "play");

  const canvas = section.locator('canvas[role="application"]');
  await dragLogical(page, canvas, { x: 175, y: 145 }, { x: 210, y: 175 });
  await expect(section.getByRole("button", { name: "Undo" })).toBeEnabled();

  await page.getByTestId("palimpsest-fragment-ri-a").click();
  await section.getByRole("button", { name: "Rotate selected fragment clockwise" }).click();
  await section.getByRole("button", { name: "Move selected fragment to the next depth plane" }).click();
  await expect(section.locator("footer")).toContainText("A.1");

  await hintUntilComplete(page, "palimpsest", 36);
  await expect(page.getByTestId("palimpsest-next")).toBeVisible();
  await expect(page.getByTestId("palimpsest-work-2")).toBeEnabled();

  await page.reload();
  await expect(section.locator("header")).toContainText("1 conserved");
  await expect(page.getByTestId("palimpsest-work-2")).toBeEnabled();
});

test("lumen can archive the full five-plate cabinet in sequence", async ({ page }) => {
  test.slow();
  await freshPage(page);
  await page.getByTestId("lumen-begin").scrollIntoViewIfNeeded();
  await page.getByTestId("lumen-begin").click();

  for (let index = 0; index < 5; index += 1) {
    await hintUntilComplete(page, "lumen", 24);
    if (index < 4) await page.getByTestId("lumen-next").click();
  }

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("benji-lumen-cabinet") ?? "{}"));
  expect(saved.value.completed).toHaveLength(5);
  await expect(page.locator("#lumen [data-game-state]")).toHaveAttribute("data-game-state", "complete");
});

test("palimpsest can conserve the full four-work archive in sequence", async ({ page }) => {
  test.slow();
  await freshPage(page);
  await page.getByTestId("palimpsest-begin").scrollIntoViewIfNeeded();
  await page.getByTestId("palimpsest-begin").click();

  for (let index = 0; index < 4; index += 1) {
    await hintUntilComplete(page, "palimpsest", 60);
    if (index < 3) await page.getByTestId("palimpsest-next").click();
  }

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("benji-palimpsest-archive") ?? "{}"),
  );
  expect(saved.value.completed).toHaveLength(4);
  await expect(page.locator("#palimpsest [data-game-state]")).toHaveAttribute(
    "data-game-state",
    "complete",
  );
});

test("responsive themes and reduced motion retain a stable layout", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freshPage(page);

  const dimensions = await page.evaluate(() => ({
    innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  expect(dimensions.documentWidth).toBe(dimensions.innerWidth);
  expect(dimensions.reduced).toBe(true);

  await expect(page.locator("#lumen [data-game-state]")).toBeVisible();
  await expect(page.locator("#palimpsest [data-game-state]")).toBeVisible();

  await page.getByRole("button", { name: "Switch to night" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to day" })).toBeVisible();

  const sections = await page.locator("section").evaluateAll((items) =>
    items.map((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth })),
  );
  expect(sections.every((section) => section.scrollWidth <= section.width)).toBe(true);
});

test("invalid saved data fails safely without runtime errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("benji-lumen-cabinet", "not-json");
    localStorage.setItem(
      "benji-palimpsest-archive",
      JSON.stringify({ version: 1, value: { unlocked: "all" } }),
    );
  });
  await page.reload();

  await expect(page.locator("#lumen [data-game-state]")).toHaveAttribute("data-game-state", "intro");
  await expect(page.locator("#palimpsest [data-game-state]")).toHaveAttribute(
    "data-game-state",
    "intro",
  );
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
