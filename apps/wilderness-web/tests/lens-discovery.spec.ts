import { expect, test, type Page } from "@playwright/test";

async function runLensLoop(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How many dots are inside this mountain?" })).toBeVisible();
  await expect(page.locator("main")).toBeVisible();

  const continueButton = page.getByRole("button", { name: "Continue" });
  await continueButton.click();
  await expect(page.getByText("Drag the blue copy toward the row field. It will turn as it moves.")).toBeVisible();
  await continueButton.click();
  await expect(page.getByText("Move the copy until the rows complete.")).toBeVisible();
  await continueButton.click();
  await expect(page.getByText("A Lens is forming from the completed rows.")).toBeVisible();
  await continueButton.click();
  await expect(page.getByText("Use the Lens on the distant mountain.")).toBeVisible();
  await continueButton.click();
  await expect(page.getByText("Test the Lens on a nearby broken stair.")).toBeVisible();
  await continueButton.click();
  await expect(page.getByText("Compile the path into proof.")).toBeVisible();
  await continueButton.click();
}

test("user can create a Lens, apply it, test failure, and compile proof", async ({ page }) => {
  await runLensLoop(page);

  await expect(page.getByText("Proof inscription")).toBeVisible();
  await expect(page.getByText("One triangle contains half as many dots: 5050.")).toBeVisible();
  await expect(page.locator(".world-inscription").getByText("Rows cannot be completed to a uniform length by this Lens.")).toBeVisible();
  await expect(page.locator(".horizon-chip").filter({ hasText: "New horizon unlocked" }).first()).toBeVisible();
});

test("mobile viewport can perform the core Lens loop", async ({ page }) => {
  await runLensLoop(page);

  await expect(page.getByText("Proof inscription")).toBeVisible();
  await expect(page.getByText("Therefore 1 + 2 + ... + n = n(n+1)/2.")).toBeVisible();
});

test("mobile Three stage drag can complete the rectangle", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile drag is verified on the Three canvas.");
  await page.goto("/");

  const continueButton = page.getByRole("button", { name: "Continue" });
  await continueButton.click();
  await expect(page.getByText("Drag the blue copy toward the row field. It will turn as it moves.")).toBeVisible();

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Three canvas is missing a bounding box");

  const start = { x: box.x + box.width * 0.74, y: box.y + box.height * 0.62 };
  const end = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.6 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();

  await expect(page.getByText("A Lens is forming from the completed rows.")).toBeVisible();
});
