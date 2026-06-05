import { test, expect } from "@playwright/test";

// AC3 (part a): /leads filters by source and updates totals instantly.
test("leads table filters by source and updates totals instantly", async ({ page }) => {
  await page.goto("/leads");

  const table = page.getByTestId("leads-table");
  await expect(table).toBeVisible();

  const totalAll = Number(
    (await page.getByTestId("leads-total-count").textContent())?.replace(/[^0-9]/g, "") ??
      "0"
  );
  expect(totalAll).toBeGreaterThan(0);

  // Filter to Google only.
  await page.getByTestId("filter-source").selectOption("google");

  // Every visible row is now a Google lead.
  const rows = page.getByTestId("lead-row");
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
  for (let i = 0; i < rowCount; i++) {
    await expect(rows.nth(i).getByTestId("lead-source")).toHaveText(/google ads/i);
  }

  // Total updated and is smaller than the unfiltered total.
  const totalGoogle = Number(
    (await page.getByTestId("leads-total-count").textContent())?.replace(/[^0-9]/g, "") ??
      "0"
  );
  expect(totalGoogle).toBeGreaterThan(0);
  expect(totalGoogle).toBeLessThan(totalAll);
  expect(totalGoogle).toBe(rowCount);
});

// AC3 (part b): /leads filters by date range and updates totals instantly.
test("leads table filters by date range and updates totals instantly", async ({ page }) => {
  await page.goto("/leads");

  const totalAll = Number(
    (await page.getByTestId("leads-total-count").textContent())?.replace(/[^0-9]/g, "") ??
      "0"
  );
  expect(totalAll).toBeGreaterThan(0);

  // Narrow to a 2-week window near the end of the seeded period.
  await page.getByTestId("filter-from").fill("2026-05-21");
  await page.getByTestId("filter-to").fill("2026-06-04");

  const rows = page.getByTestId("lead-row");
  const narrowed = await rows.count();
  expect(narrowed).toBeGreaterThan(0);
  expect(narrowed).toBeLessThan(totalAll);

  // Every visible row's date is within the window.
  for (let i = 0; i < narrowed; i++) {
    const dateText = (await rows.nth(i).getByTestId("lead-date").textContent()) ?? "";
    expect(dateText >= "2026-05-21" && dateText <= "2026-06-04").toBeTruthy();
  }

  const totalNarrowed = Number(
    (await page.getByTestId("leads-total-count").textContent())?.replace(/[^0-9]/g, "") ??
      "0"
  );
  expect(totalNarrowed).toBe(narrowed);
});

// Edge case: a date range with no leads shows an empty state and zero totals.
test("leads table shows empty state when the date range has no leads", async ({ page }) => {
  await page.goto("/leads");
  await page.getByTestId("filter-from").fill("2020-01-01");
  await page.getByTestId("filter-to").fill("2020-01-02");

  await expect(page.getByTestId("leads-empty")).toBeVisible();
  await expect(page.getByTestId("leads-total-count")).toHaveText(/\b0\b/);
});
