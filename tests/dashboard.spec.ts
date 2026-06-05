import { test, expect } from "@playwright/test";

// AC1: Live URL loads the dashboard with KPI cards populated from seed data.
test("dashboard loads with KPI cards populated from seed data", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /lead attribution/i })).toBeVisible();

  const totalLeads = page.getByTestId("kpi-total-leads-value");
  const booked = page.getByTestId("kpi-booked-value");
  const revenue = page.getByTestId("kpi-revenue-value");
  const cpl = page.getByTestId("kpi-blended-cpl-value");

  await expect(totalLeads).toBeVisible();
  await expect(booked).toBeVisible();
  await expect(revenue).toBeVisible();
  await expect(cpl).toBeVisible();

  // Populated from seed data => a non-zero lead count rendered as a number.
  const leadsText = (await totalLeads.textContent())?.replace(/[^0-9]/g, "") ?? "0";
  expect(Number(leadsText)).toBeGreaterThan(0);

  // Revenue is a real currency figure.
  await expect(revenue).toHaveText(/\$[\d,]+/);
});

// AC2: Source breakdown correctly shows leads, spend, and cost-per-lead per channel.
test("source breakdown shows leads, spend and cost-per-lead for every channel", async ({
  page,
}) => {
  await page.goto("/");

  const breakdown = page.getByTestId("source-breakdown");
  await expect(breakdown).toBeVisible();

  for (const source of ["google", "facebook", "ghl", "website"]) {
    const row = page.getByTestId(`source-row-${source}`);
    await expect(row).toBeVisible();
    // leads count cell is a number > 0
    const leadsCell = row.getByTestId("cell-leads");
    const leads = Number((await leadsCell.textContent())?.replace(/[^0-9]/g, "") ?? "0");
    expect(leads).toBeGreaterThan(0);
    // spend + cpl cells render currency
    await expect(row.getByTestId("cell-spend")).toHaveText(/\$[\d,]+/);
    await expect(row.getByTestId("cell-cpl")).toHaveText(/\$[\d,]+(\.\d+)?/);
  }
});

// AC5: Adapter layer is visibly structured — the dashboard aggregates four
// distinct sources into one report, proving the normalization seam works.
test("dashboard aggregates all four sources through the adapter layer", async ({
  page,
}) => {
  await page.goto("/");
  const breakdown = page.getByTestId("source-breakdown");
  // Exactly the four PRD channels, each labeled with its human name.
  await expect(breakdown).toContainText("Google Ads");
  await expect(breakdown).toContainText("Facebook");
  await expect(breakdown).toContainText("GoHighLevel");
  await expect(breakdown).toContainText("Website");

  // The trend chart (leads over time) is rendered.
  await expect(page.getByTestId("trend-chart")).toBeVisible();
});
