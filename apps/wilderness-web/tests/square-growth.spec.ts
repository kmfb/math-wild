import { expect, test } from "@playwright/test";

async function openHero(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Light grows in odd rings." })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
}

async function dragOutward(page: import("@playwright/test").Page) {
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("Three canvas is missing a bounding box");
  const start = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
  const end = { x: start.x + 62, y: start.y + 10 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();
}

test("user can pull outward to grow odd rings into square structure", async ({ page }) => {
  await openHero(page);

  await dragOutward(page);
  await expect(page.getByText("+3 outer ring → 2×2 square.")).toBeVisible();
  await dragOutward(page);
  await expect(page.getByText("+5 outer ring → 3×3 square.")).toBeVisible();
  await dragOutward(page);
  await expect(page.getByText("1 + 3 + 5 + 7 = 4²")).toBeVisible();
});

test("formula and hundred square climax are reachable from fallback controls", async ({ page }) => {
  await openHero(page);

  const grow = page.getByRole("button", { name: "Watch one ring" });
  for (let index = 0; index < 5; index += 1) {
    await grow.click();
  }

  await expect(page.getByText("1 + 3 + 5 + ... + (2n - 1) = n²")).toBeVisible();
  await page.getByRole("button", { name: "Light 100×100" }).click();
  await expect(page.getByText("1 + 3 + 5 + ... + 199 = 10000")).toBeVisible();
});

test("mobile drag gesture grows a ring", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile gesture is verified on the Square Growth stage.");
  await openHero(page);

  await dragOutward(page);

  await expect(page.getByText("+3 outer ring → 2×2 square.")).toBeVisible();
});
