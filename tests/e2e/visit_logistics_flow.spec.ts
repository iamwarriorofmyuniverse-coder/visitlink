import { test, expect } from "@playwright/test";

test.describe("Visit Logistics Flow: Food, Parking, Traffic, and Weather Advisory", () => {
  test("Coordinator triggers parking warning during booking, and Industry Manager views Parking & Weather warnings on Readiness Card", async ({
    page,
    context,
  }) => {
    // Set demo coordinator session cookie
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    // 1. Coordinator opens booking wizard for Kovai Precision Foundry
    await page.goto("/coordinator/book/foundry-cbe-01");
    await expect(
      page.getByRole("heading", { name: /Kovai Precision Foundry/i })
    ).toBeVisible();

    // 2. Set valid group size & teacher count
    const studentInput = page.getByLabel("Student Count (Headcount)");
    await studentInput.fill("30");
    const teacherInput = page.getByLabel("Accompanying Teachers / Faculty");
    await teacherInput.fill("2");

    // 3. Test Parking Logistics Warning: Request 4 buses (facility has 2 bus bays)
    const busInput = page.getByLabel("Institution Buses");
    await busInput.fill("4");

    // Expect inline real-time warning on booking form
    await expect(
      page.getByText(/Requested buses \(4\) exceed facility bus parking bays \(2\)/i)
    ).toBeVisible();

    // 4. Accept indemnity and submit request
    const indemnityCheckbox = page.getByRole("checkbox", {
      name: /I confirm that all visiting students/i,
    });
    await indemnityCheckbox.check();

    const submitBtn = page.getByRole("button", { name: /Submit Visit Request/i });
    await submitBtn.click();

    // Verify submission feedback message
    await expect(
      page.getByText(/Visit request submitted successfully!/i)
    ).toBeVisible();

    // 5. Switch to Industry Manager session to review request with flagged logistics
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "industry_manager",
        url: "http://localhost:3000",
      },
    ]);
    await page.goto("/industry/requests/req-cbe-02");

    // Verify Visit Readiness Card is displayed
    await expect(
      page.getByRole("heading", { name: /Visit Readiness & Logistics/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Logistics Warnings Flagged/i)
    ).toBeVisible();

    // Verify Parking Warning flag is visible to Industry Manager
    await expect(
      page.getByText(/Requested buses \(4\) exceed facility bus parking bays \(2\)/i).first()
    ).toBeVisible();

    // Verify Weather Advisory Warning flag is visible to Industry Manager
    await expect(
      page.getByText(/Rain Risk: High rain probability/i).first()
    ).toBeVisible();

    // Verify Open-Meteo attribution is present
    await expect(
      page.getByRole("link", { name: /Weather by Open-Meteo.com/i })
    ).toBeVisible();

    // 6. Industry Manager can click Propose Reschedule shortcut
    const rescheduleShortcut = page.getByRole("button", {
      name: /Propose Reschedule/i,
    }).first();
    await expect(rescheduleShortcut).toBeVisible();
    await rescheduleShortcut.click();

    // Verify Reschedule modal appears
    await expect(
      page.getByRole("heading", { name: /Propose Alternative Visit Date/i })
    ).toBeVisible();
  });
});
