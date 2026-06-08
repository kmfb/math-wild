import { expect, test, type Page } from "@playwright/test";

async function runLensLoop(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How many dots are inside this mountain?" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();

  const continueButton = page.getByRole("button", { name: "Continue" });
  await continueButton.click();
  await expect(page.getByText("Flip the copy until it faces the first pattern.")).toBeVisible();
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
  await expect(page.getByText("New horizon unlocked")).toBeVisible();
});

test("mobile viewport can perform the core Lens loop", async ({ page }) => {
  await runLensLoop(page);

  await expect(page.getByText("Proof inscription")).toBeVisible();
  await expect(page.getByText("Therefore 1 + 2 + ... + n = n(n+1)/2.")).toBeVisible();
});

test("main stage drag can complete the rectangle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();

  const continueButton = page.getByRole("button", { name: "Continue" });
  await continueButton.click();
  await expect(page.getByText("Flip the copy until it faces the first pattern.")).toBeVisible();
  await continueButton.click();
  await expect(page.getByText("Move the copy until the rows complete.")).toBeVisible();

  const surface = page.getByRole("button", { name: "Drag copied stair pattern" });
  await expect(surface).toBeVisible();
  const box = await surface.boundingBox();
  if (!box) throw new Error("Canvas is missing a bounding box");

  const start = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
  const end = { x: start.x - 80, y: start.y };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();

  await expect(page.getByText("A Lens is forming from the completed rows.")).toBeVisible();
});
