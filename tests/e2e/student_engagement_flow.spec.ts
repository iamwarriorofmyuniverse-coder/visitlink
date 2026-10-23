import { test, expect } from "@playwright/test";

test.describe("Student Engagement Without Accounts Flow (Phases p1-p5)", () => {
  test("1. Exploration: Engagement Badges & Interactive Filters", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/explore");
    await expect(page.getByRole("heading", { name: /Discover Facilities/i })).toBeVisible();

    // Select Hands-on Activity filter using id or label
    const engagementFilter = page.locator("#engagementFilter");
    await engagementFilter.selectOption("hands_on_activity");

    // Expect facility cards with hands-on activity badge to be listed (target badge span, not select option)
    await expect(page.locator("span", { hasText: /Hands-on/i }).first()).toBeVisible();
    await expect(page.locator("span", { hasText: /Live Demo/i }).first()).toBeVisible();
  });

  test("2. Pre-Visit Brief: Public Shareable Link (No Login Required & Zero PII)", async ({ page }) => {
    // Open brief without any login cookies or credentials
    await page.goto("/brief/demo-brief-valid-128bit-token-cbe");

    // Header & Facility Information
    await expect(page.getByText(/Official Student & Parent Pre-Visit Brief/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Kovai Precision Foundry/i })).toBeVisible();

    // Mandatory PPE & Dress Code
    await expect(page.getByText(/Mandatory Safety Rules & PPE Checklist/i)).toBeVisible();
    await expect(page.getByText(/Steel-toe safety shoes/i)).toBeVisible();

    // Reflection Prompts for Students
    await expect(page.getByText(/Reflection Questions to Think About/i)).toBeVisible();
    await expect(page.getByText(/Study automated green sand moulding lines/i)).toBeVisible();

    // Zero-PII check: Page must NOT contain student personal info or login forms
    await expect(page.getByText(/Privacy & Child Safety Guarantee/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /password|email/i })).toHaveCount(0);
  });

  test("3. Pre-Visit Brief: Unguessable Token Security (Secure 404 on Revoked/Expired Link)", async ({ page }) => {
    await page.goto("/brief/revoked-token-128bit");

    // Must show secure 404 / revoked state with zero confidential information
    await expect(page.getByRole("heading", { name: /Pre-Visit Brief Access Revoked|Pre-Visit Brief Has Expired/i })).toBeVisible();
    await expect(page.getByText(/This link was revoked by the institutional coordinator/i)).toBeVisible();
  });

  test("4. Observation Sheet: AI-Drafted Questions & Faculty Review Guardrail", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/requests/req-cbe-02");
    await expect(page.getByRole("heading", { name: /Kovai Precision Foundry/i })).toBeVisible();

    // Observation sheet section exists
    await expect(page.getByText(/Student Observation Sheet \(AI-Drafted with Ruled Spaces\)/i)).toBeVisible();
    await expect(page.getByText(/Faculty Review Pending \(Print Locked\)/i)).toBeVisible();

    // Print button is initially disabled
    const printBtn = page.getByRole("button", { name: /Print Observation Sheets/i });
    await expect(printBtn).toBeDisabled();

    // Click "Mark Reviewed & Authorize Printing"
    const reviewBtn = page.getByRole("button", { name: /Mark Reviewed & Authorize Printing/i });
    await reviewBtn.click();

    // Status updates to reviewed and print button is enabled
    await expect(page.getByText(/Reviewed & Approved by Faculty/i).first()).toBeVisible();
    await expect(printBtn).toBeEnabled();
  });

  test("5. Anonymous Student Feedback: Server-Side Anonymity Threshold & Submission", async ({ page, context }) => {
    // 5a. Check coordinator view with anonymity threshold
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/requests/req-cbe-02");
    await expect(page.getByText(/Anonymous Student Post-Visit Feedback/i)).toBeVisible();

    // Toggle to 4 responses (below threshold)
    await page.getByRole("button", { name: /4 Responses \(< 5\)/i }).click();
    await expect(page.getByText(/Server-Enforced Anonymity Shield Active \(4 of 5 Responses Received\)/i)).toBeVisible();

    // Toggle to 5 responses (threshold met)
    await page.getByRole("button", { name: /5 Responses \(Threshold Met\)/i }).click();
    await expect(page.getByText(/Average Usefulness Rating/i)).toBeVisible();
    await expect(page.getByText(/Average Engagement Rating/i)).toBeVisible();
    await expect(page.getByText(/Seeing the automated green sand moulding lines/i)).toBeVisible();

    // 5b. Submit anonymous student feedback as a student (no login)
    await context.clearCookies();
    await page.goto("/feedback/student/demo-feedback-valid-128bit-token-cbe");
    await expect(page.getByRole("heading", { name: /How was your visit/i })).toBeVisible();

    // Fill feedback using textarea ids
    const mostInterestingInput = page.locator("#mostInteresting");
    await mostInterestingInput.fill("The automated sand casting line was incredible to see in person.");

    const suggestionInput = page.locator("#suggestion");
    await suggestionInput.fill("Allow a bit more time for questions with the metallurgist.");

    // Submit
    const submitBtn = page.getByRole("button", { name: /Submit Anonymous Feedback/i });
    await submitBtn.click();

    // Verify submission success confirmation
    await expect(page.getByText(/Feedback Submitted Anonymously/i)).toBeVisible();
  });

  test("6. Participation Certificate: Client-Side Rendering with Zero-PII & Social Break", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/requests/req-cbe-02");

    // Check Planned Social Break is displayed in Visit Parameters
    await expect(page.getByText(/Planned Social Break/i)).toBeVisible();
    await expect(page.getByText(/15 Mins/i)).toBeVisible();

    // Open Certificate Generator Modal
    const certBtn = page.getByRole("button", { name: /Generate Certificate Template/i });
    await certBtn.click();

    // Certificate modal is displayed
    await expect(page.getByRole("heading", { name: /Industrial Visit Participation Certificate/i })).toBeVisible();
    await expect(page.getByText(/Client-Side Zero-PII Guarantee/i).first()).toBeVisible();

    // Fill student name
    const studentNameInput = page.getByLabel(/Recipient Student Name/i);
    await studentNameInput.fill("Sanjay Ramanathan");

    // Preview reflects the name
    await expect(page.getByText("Sanjay Ramanathan")).toBeVisible();
    await expect(page.getByText(/Certificate of Industrial Visit Completion/i)).toBeVisible();
  });
});
