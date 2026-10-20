import { test, expect } from "@playwright/test";

test.describe("VisitLink Core User Journey & Safety Checks", () => {
  test("1. Homepage renders correctly and displays Coimbatore Hub verification badge", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VisitLink/);
    await expect(
      page.getByText("Live in Coimbatore Industrial Hub")
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Connect Educational Institutions/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Find Facilities Near You/i })
    ).toBeVisible();
  });

  test("2. Coordinator Explore Page: Radius slider, Leaflet map, and facility cards", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "vl_demo_role", value: "coordinator", url: "http://localhost:3000" },
    ]);
    await page.goto("/coordinator/explore");
    await expect(
      page.getByRole("heading", { name: /Discover Facilities in Coimbatore Hub/i })
    ).toBeVisible();

    // Verify distance badges exist
    await expect(page.getByText("Radius: 25 km")).toBeVisible();

    // Check facility cards loaded from Coimbatore seed data
    await expect(
      page.getByText("Kovai Precision Foundry & Heavy Castings [Demo]")
    ).toBeVisible();
    await expect(
      page.getByText("Siruvani IoT Pumps & Hydro-Dynamics [Demo]")
    ).toBeVisible();

    // Test switching radius to 5 km (should narrow facility list)
    await page.getByRole("button", { name: "5km", exact: true }).click();
    await expect(page.getByText("Radius: 5 km")).toBeVisible();
  });

  test("3. Booking Wizard: Ratio validation error on insufficient teachers", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "vl_demo_role", value: "coordinator", url: "http://localhost:3000" },
    ]);
    await page.goto("/coordinator/book/foundry-cbe-01");
    await expect(
      page.getByRole("heading", { name: /Kovai Precision Foundry/i })
    ).toBeVisible();

    // Fill in high student count (40) with only 1 teacher
    const studentInput = page.getByLabel("Student Count (Headcount)");
    await studentInput.fill("40");

    const teacherInput = page.getByLabel("Accompanying Teachers / Faculty");
    await teacherInput.fill("1");

    // Form should show ratio warning: requires at least 3 teachers
    await expect(
      page.getByText(/Requires at least 3 teachers/i)
    ).toBeVisible();

    // Check indemnity and submit
    const indemnityCheckbox = page.getByRole("checkbox", {
      name: /I confirm that all visiting students/i,
    });
    await indemnityCheckbox.check();

    // Click submit, should be blocked by ratio check
    await page.getByRole("button", { name: /Submit Visit Request/i }).click();
    await expect(
      page.getByText(/Insufficient accompanying teachers/i)
    ).toBeVisible();
  });

  test("4. Industry Host Portal: Active slots and review queue", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "vl_demo_role", value: "industry_manager", url: "http://localhost:3000" },
    ]);
    await page.goto("/industry");
    await expect(
      page.getByRole("heading", { name: /Industry Host Portal/i })
    ).toBeVisible();

    // Verify request queue item
    await expect(
      page.getByText("PSG College of Technology [Demo]")
    ).toBeVisible();
    await expect(page.getByText("AI Triage: Pass")).toBeVisible();

    // Navigate to Review Page
    await page
      .getByRole("link", { name: /Review & Triage/i })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: /AI Triage.*Pre-Screening Report/i })
    ).toBeVisible();
    await expect(page.getByText(/Verdict: PASS/i)).toBeVisible();
  });

  test("5. Post-Visit Feedback & Multi-dimensional Ratings", async ({
    page,
  }) => {
    await page.goto("/feedback/demo-req-01");
    await expect(
      page.getByRole("heading", { name: /Rate Your Industrial Visit Experience/i })
    ).toBeVisible();

    // Fill review text
    await page
      .getByPlaceholder(/Share your experience/i)
      .fill(
        "Excellent plant tour! Students learned practical sand casting and CNC operations. Safety briefing was thorough and clear."
      );

    // Submit review
    await page
      .getByRole("button", { name: /Publish Verified Feedback/i })
      .click();
    await expect(
      page.getByRole("heading", { name: /Thank you for your feedback!/i })
    ).toBeVisible();
  });
});
