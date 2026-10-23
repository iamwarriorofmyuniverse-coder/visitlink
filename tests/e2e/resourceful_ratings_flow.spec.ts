import { test, expect } from "@playwright/test";

test.describe("Resourceful Sites & Verified Ratings Flow (Phases q1-q5 & r1-r6)", () => {
  test("1. Exploration: Learning & Hosting Scores, Tag Filters & Score Explain Modal", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/explore");
    await expect(page.getByRole("heading", { name: /Discover Facilities/i })).toBeVisible();

    // Verify Learning Value and Hosting Readiness scores are visible on cards
    await expect(page.locator("span", { hasText: /Learning Value/i }).first()).toBeVisible();
    await expect(page.locator("span", { hasText: /Hosting Ready/i }).first()).toBeVisible();

    // Open Explain Scores Modal
    const explainBtn = page.getByRole("button", { name: /Explain Scores/i }).first();
    await explainBtn.click();

    // Verify Score Explain Modal contents
    await expect(page.getByText(/Transparent Explain View/i)).toBeVisible();
    await expect(page.getByText(/Strict Zero-Bias Guarantee/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Learning Value/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hosting Readiness/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Verified Ratings/i })).toBeVisible();

    // Switch to Hosting Readiness tab
    await page.getByRole("button", { name: /Hosting Readiness/i }).click();
    await expect(page.getByText(/Safety & Facility Infrastructure/i)).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: /Close Breakdown/i }).click();
    await expect(page.getByText(/Transparent Explain View/i)).not.toBeVisible();
  });

  test("2. Exploration Slot: New Host Visibility & Exploration Exposure", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/coordinator/explore");

    // Verify presence of "New Host" badge on small/newly onboarded plants
    const newHostBadge = page.locator("span", { hasText: /New Host/i }).first();
    await expect(newHostBadge).toBeVisible();
  });

  test("3. Post-Visit Coordinator Feedback: 5 Dimensions & Server-Side Overall Rating", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "coordinator",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/feedback/req-cbe-02");
    await expect(page.getByRole("heading", { name: /5-Dimension Educational Review/i })).toBeVisible();

    // Verify server-side computed overall rating block
    await expect(page.getByText(/Server-Computed Overall Rating/i)).toBeVisible();
    await expect(page.getByText(/Exact arithmetic average/i)).toBeVisible();

    // Verify all 5 dimensions exist
    await expect(page.getByText(/1. Learning Value & Curriculum Fit/i)).toBeVisible();
    await expect(page.getByText(/2. Hosting & Plant Organisation/i)).toBeVisible();
    await expect(page.getByText(/3. Staff & Guide Quality/i)).toBeVisible();
    await expect(page.getByText(/4. Plant Safety & PPE Compliance/i)).toBeVisible();
    await expect(page.getByText(/5. Listing Accuracy/i)).toBeVisible();

    // Enter detailed review text (> 30 characters)
    const reviewBox = page.getByPlaceholder(/Share your/i);
    await reviewBox.fill("Outstanding industrial exposure for our mechanical engineering students. The live furnace demo and quality inspection metrology bay were world-class.");

    // Submit review
    const submitBtn = page.getByRole("button", { name: /Publish Verified Feedback/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Confirm success screen
    await expect(page.getByText(/Review Published Successfully/i)).toBeVisible();
    await expect(page.getByText(/Return to Dashboard/i)).toBeVisible();
  });

  test("4. Industry Request Review: Private Rating, Public Reply & Dispute Lifecycle", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "industry_manager",
        url: "http://localhost:3000",
      },
    ]);

    // Navigate to completed request
    await page.goto("/industry/requests/req-completed-01");
    await expect(page.getByRole("heading", { name: /PSG College of Technology/i })).toBeVisible();

    // 1. Submit Private Institution Rating
    const privateRatingBtn = page.getByRole("button", { name: /Submit Private Rating/i });
    await privateRatingBtn.click();

    await expect(page.locator("h3", { hasText: /Private Institution Behavioral Rating/i })).toBeVisible();
    await expect(page.getByText(/Confidential Safeguard/i)).toBeVisible();

    // Save confidential rating
    await page.getByRole("button", { name: /Save Confidential Rating/i }).click();
    await expect(page.getByText(/Private institution behavioral rating saved successfully/i)).toBeVisible();

    // 2. Submit Public Reply
    const replyBtn = page.getByRole("button", { name: /Public Reply/i });
    await replyBtn.click();

    await expect(page.getByRole("heading", { name: /Public Host Reply/i })).toBeVisible();
    const replyInput = page.getByPlaceholder(/Thank the faculty, address suggestions/i);
    await replyInput.fill("Thank you Dr. Karthikeyan and PSG students! We loved your thoughtful technical questions on cupola thermal dynamics.");

    await page.getByRole("button", { name: /Publish Official Reply/i }).click();
    await expect(page.getByText(/Official Host Reply \(Published\)/i)).toBeVisible();

    // 3. Open Dispute Lifecycle
    const disputeBtn = page.getByRole("button", { name: /Dispute Review/i });
    await disputeBtn.click();

    await expect(page.getByRole("heading", { name: /Dispute Coordinator Review/i })).toBeVisible();
    const disputeNotes = page.getByPlaceholder(/Provide detailed facts and reference plant CCTV/i);
    await disputeNotes.fill("Plant records confirm student group arrived 20 minutes late and our engineers provided 45 minutes overtime demo.");

    await page.getByRole("button", { name: /Submit Dispute for Admin Review/i }).click();
    await expect(page.getByText(/Dispute Under Admin Review/i)).toBeVisible();
  });

  test("5. Industry Profile: Capabilities Checklist & Live Score Preview", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "vl_demo_role",
        value: "industry_manager",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/industry/profile");
    await expect(page.getByRole("heading", { name: /Facility Profile & Hosting Readiness/i })).toBeVisible();

    // Verify Live Score Preview card
    await expect(page.getByText(/Live Discovery Score Preview/i)).toBeVisible();
    await expect(page.getByText(/Transparent Scoring Checklist/i)).toBeVisible();
    await expect(page.getByText(/Anti-Bias Invariant/i)).toBeVisible();

    // Verify Sections exist
    await expect(page.getByRole("heading", { name: /Learning Capabilities & Process Visibility/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Hosting Readiness & Physical Infrastructure/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Verified Industry Certifications/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Plant Photography/i })).toBeVisible();

    // Save profile
    await page.getByRole("button", { name: /Save Profile & Submit Capabilities/i }).click();
    await expect(page.getByText(/Profile Saved/i)).toBeVisible();
  });
});
