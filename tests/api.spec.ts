import { test, expect } from "@playwright/test";

// AC4: GET /api/leads returns JSON with leads + computed attribution fields.
test("GET /api/leads returns leads plus computed attribution", async ({ request }) => {
  const res = await request.get("/api/leads");
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-type"]).toContain("application/json");

  const body = await res.json();

  // Leads array with the documented shape.
  expect(Array.isArray(body.leads)).toBeTruthy();
  expect(body.leads.length).toBeGreaterThan(0);
  const lead = body.leads[0];
  for (const key of ["id", "source", "status", "value", "createdAt"]) {
    expect(lead).toHaveProperty(key);
  }
  expect(["google", "facebook", "ghl", "website"]).toContain(lead.source);

  // Per-source attribution with computed CPL + ROAS.
  expect(Array.isArray(body.attribution)).toBeTruthy();
  expect(body.attribution.length).toBeGreaterThan(0);
  const attr = body.attribution[0];
  for (const key of ["source", "leads", "spend", "revenue", "cpl", "roas"]) {
    expect(attr).toHaveProperty(key);
  }

  // Blended summary KPIs.
  expect(body.summary).toHaveProperty("totalLeads");
  expect(body.summary).toHaveProperty("blendedCpl");
  expect(body.summary.totalLeads).toBe(body.leads.length);

  // CPL is internally consistent: spend / leads for a real channel.
  const google = body.attribution.find((a: { source: string }) => a.source === "google");
  expect(google.cpl).toBeCloseTo(google.spend / google.leads, 1);
});

// AC4 (edge): the API honors the same source filter the UI uses.
test("GET /api/leads?source=ghl returns only that source", async ({ request }) => {
  const res = await request.get("/api/leads?source=ghl");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.leads.length).toBeGreaterThan(0);
  for (const lead of body.leads) {
    expect(lead.source).toBe("ghl");
  }
  // Attribution collapses to the single requested source.
  expect(body.attribution.every((a: { source: string }) => a.source === "ghl")).toBeTruthy();
});
