import { test, expect } from "@playwright/test";

test.describe("Educational Intent & Anti-Abuse Verification Flow (Phases m1-m5)", () => {
  test("1. Form Validation: Blocks placeholder text, short objectives, and consumer freemail domains", async ({
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

    // Navigate to booking page
    await page.goto("/coordinator/book/foundry-cbe-01");
    await expect(page.getByRole("heading", { name: /Kovai Precision Foundry/i })).toBeVisible();

    // Fill placeholder text into Objective #1
    const obj1 = page.getByLabel("Objective #1: What technical process will students study?");
    await obj1.fill("industrial exposure and general visit");

    // Expect inline placeholder warning
    await expect(page.getByText(/Generic placeholder detected/i).first()).toBeVisible();

    // Fill short text into Objective #2 (< 30 chars)
    const obj2 = page.getByLabel("Objective #2: What quality/engineering workflow will students observe?");
    await obj2.fill("Learn CNC machines");

    // Fill consumer email without override
    const facultyEmail = page.getByLabel("Official Institutional Email *");
    await facultyEmail.fill("professor.test@gmail.com");

    // Expect freemail domain rejection notice
    await expect(page.getByText(/Consumer Freemail Domain Rejected/i)).toBeVisible();

    // Try submitting with invalid intent
    const indemnityCheckbox = page.getByRole("checkbox", {
      name: /I confirm that all visiting students/i,
    });
    await indemnityCheckbox.check();

    const submitBtn = page.getByRole("button", { name: /Submit Visit Request/i });
    await submitBtn.click();

    // Verify submission is blocked with validation error
    await expect(page.getByText(/Objective #1 contains generic placeholder phrasing|Objective #2 must be at least 30 characters|Faculty must use an official institutional email/i).first()).toBeVisible();
  });

  test("2. Gatekeeper: Blocks booking if institution does not meet facility minimum trust tier", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    // Aerospace facility requires 'trusted' tier, navigate with default 'verified' tier
    await page.goto("/coordinator/book/aerospace-cbe-01?instTier=verified");
    await expect(page.getByRole("heading", { name: /Aerodrome Ground Support/i })).toBeVisible();

    // Verify gatekeeper notice is visible
    await expect(page.getByText(/Booking Access Restricted by Anti-Abuse Policy/i)).toBeVisible();
    await expect(page.getByText(/This facility requires 'trusted' trust tier/i)).toBeVisible();

    // Verify submit button is disabled
    const submitBtn = page.getByRole("button", { name: /Submit Visit Request/i });
    await expect(submitBtn).toBeDisabled();

    // Switch institution tier to 'trusted' via interactive switcher
    const trustedBtn = page.getByRole("button", { name: "trusted" });
    await trustedBtn.click();

    // Verify gatekeeper notice disappears and submit button is enabled
    await expect(page.getByText(/Booking Access Restricted by Anti-Abuse Policy/i)).not.toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test("3. Genuine Request: Completes end-to-end booking with syllabus alignment and faculty sponsorship", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/book/foundry-cbe-01");

    // Verify default valid academic fields
    await expect(page.getByLabel("Course / Subject Title *")).toHaveValue(/Manufacturing Technology/i);
    await expect(page.getByLabel("Syllabus Topic Linked to Visit *")).toHaveValue(/Metal Casting Processes/i);
    await expect(page.getByLabel("Official Institutional Email *")).toHaveValue(/karthikeyan.mech@psgtech.edu/i);

    // Accept indemnity and submit
    const indemnityCheckbox = page.getByRole("checkbox", {
      name: /I confirm that all visiting students/i,
    });
    await indemnityCheckbox.check();

    const submitBtn = page.getByRole("button", { name: /Submit Visit Request/i });
    await submitBtn.click();

    // Expect successful submission
    await expect(page.getByText(/Visit request submitted successfully!/i)).toBeVisible();

    // Navigate to request details as coordinator
    await page.goto("/coordinator/requests/req-cbe-02");

    // Verify Verified Educational Intent Card is displayed
    await expect(page.getByText(/Verified Educational Intent & Academic Sponsoring/i)).toBeVisible();
    await expect(page.getByText(/karthikeyan.mech@psgtech.edu/i)).toBeVisible();
    await expect(page.getByText(/Post-Visit Report & Learning Summary/i)).toBeVisible();
  });

  test("4. Industry Manager: Reviews AI Triage Intent report and conducts post-visit verification", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "industry_manager",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/industry/requests/req-cbe-02");

    // Verify AI Triage Intent-Quality report
    await expect(page.getByText(/AI Triage Intent-Quality & Safety Pre-Screening Report/i)).toBeVisible();
    await expect(page.getByText(/0.92 \/ 1.0/i)).toBeVisible();
    await expect(page.getByText(/Declared Academic Intent & Faculty Sponsor/i)).toBeVisible();

    // Approve the request first
    const approveBtn = page.getByRole("button", { name: /Approve \(Atomic Check\)/i });
    await approveBtn.click();
    await expect(page.getByText(/Request approved! Slot capacity safely decremented/i)).toBeVisible();

    // Open Post-Visit Attendance Verification modal
    const verifyBtn = page.getByRole("button", { name: /Verify Post-Visit Attendance/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(page.getByRole("heading", { name: /Post-Visit Industry Verification/i })).toBeVisible();

    // Test selecting "Not Educational" to verify human-in-the-loop protection banner
    const notEducationalRadio = page.getByLabel(/Not Educational \(Leisure \/ Sightseeing Abuse\)/i);
    await notEducationalRadio.check();

    await expect(page.getByText(/Human-in-the-Loop Anti-Abuse Protection/i)).toBeVisible();
    await expect(page.getByText(/A "Not educational" report does not automatically penalize or strike an institution/i)).toBeVisible();

    // Now select Educational for genuine completion
    const educationalRadio = page.getByLabel(/Educational \(Genuine Academic Value\)/i);
    await educationalRadio.check();

    // Submit post-visit verification
    const submitVerificationBtn = page.getByRole("button", { name: /Submit Post-Visit Verification/i });
    await submitVerificationBtn.click();

    // Verify request is marked completed
    await expect(page.getByText(/Post-visit verification saved! Rated 5\/5 stars/i)).toBeVisible();
  });

  test("5. Platform Admin: Audits strike complaints with evidence, reviews appeals, and manages trust directory", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "admin",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Platform Admin & Anti-Abuse Center/i })).toBeVisible();

    // 1. Audit Strike Complaint: Dismiss Complaint
    await expect(page.getByText(/Pending Strike Complaints/i)).toBeVisible();
    await expect(page.getByText(/Host Facility Evidence & Incident Report/i)).toBeVisible();

    const dismissBtn = page.getByRole("button", { name: /Dismiss \(Insufficient Grounds\)/i });
    await dismissBtn.click();
    await expect(page.getByText(/Complaint dismissed. Evidence deemed insufficient to warrant formal strike penalty/i)).toBeVisible();

    // 2. Review Appeals Queue: Grant Reinstatement Appeal
    await expect(page.getByRole("heading", { name: /Appeals Queue for Restricted Institutions/i })).toBeVisible();
    const grantAppealBtn = page.getByRole("button", { name: /Grant Appeal & Reinstate/i });
    await grantAppealBtn.click();
    await expect(page.getByText(/Appeal granted! Restriction lifted/i)).toBeVisible();

    // 3. Trust Directory Tab
    const trustTab = page.getByRole("button", { name: /Trust Directory & Freemail/i });
    await trustTab.click();

    await expect(page.getByText(/Institution Trust Tiers & Rural Freemail Overrides/i)).toBeVisible();
    await expect(page.getByText(/Pollachi Rural Polytechnic Institute/i)).toBeVisible();
    await expect(page.getByText(/Override Enabled \(Rural \/ Exemption\)/i)).toBeVisible();
  });
});