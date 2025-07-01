import { expect, test } from "@playwright/test";

// Use the working authentication
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("New Conversation Modal - CC/BCC Close Buttons", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to conversations page
    await page.goto("/mailboxes/gumroad/mine", { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  });

  test("should add and remove CC/BCC fields with close buttons", async ({ page }) => {
    // Open new conversation modal by clicking the send button
    await page.click('[data-testid="new-conversation-button"], button:has-text("Send"), button[aria-label*="new"], .rounded-full:has-text("Send"), [title*="message"]');
    
    // Wait for modal to be visible
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Initially, CC and BCC fields should not be visible
    await expect(page.locator('input[name="CC"]')).not.toBeVisible();
    await expect(page.locator('input[name="BCC"]')).not.toBeVisible();
    
    // Click on "Add CC or BCC" to show the buttons
    await page.click('text=Add');
    
    // Click CC button to show CC field
    await page.click('text=CC');
    await expect(page.locator('input[name="CC"]')).toBeVisible();
    
    // Verify CC close button is present and functional
    const ccCloseButton = page.locator('input[name="CC"]').locator('..').locator('button[type="button"]');
    await expect(ccCloseButton).toBeVisible();
    
    // Add some text to CC field
    await page.fill('input[name="CC"]', 'test@example.com');
    
    // Click close button for CC
    await ccCloseButton.click();
    
    // Verify CC field is hidden and value is cleared
    await expect(page.locator('input[name="CC"]')).not.toBeVisible();
    
    // Show CC again and verify it's empty
    await page.click('text=CC');
    await expect(page.locator('input[name="CC"]')).toHaveValue('');
    
    // Now test BCC field
    await page.click('text=BCC');
    await expect(page.locator('input[name="BCC"]')).toBeVisible();
    
    // Verify BCC close button is present and functional
    const bccCloseButton = page.locator('input[name="BCC"]').locator('..').locator('button[type="button"]');
    await expect(bccCloseButton).toBeVisible();
    
    // Add some text to BCC field
    await page.fill('input[name="BCC"]', 'bcc@example.com');
    
    // Click close button for BCC
    await bccCloseButton.click();
    
    // Verify BCC field is hidden and value is cleared
    await expect(page.locator('input[name="BCC"]')).not.toBeVisible();
    
    // Show BCC again and verify it's empty
    await page.click('text=BCC');
    await expect(page.locator('input[name="BCC"]')).toHaveValue('');
  });

  test("should not submit form when clicking close buttons", async ({ page }) => {
    // Open new conversation modal
    await page.click('[data-testid="new-conversation-button"], button:has-text("Send"), button[aria-label*="new"], .rounded-full:has-text("Send"), [title*="message"]');
    
    // Wait for modal to be visible
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Show CC field
    await page.click('text=Add');
    await page.click('text=CC');
    
    // Fill required fields to make form submittable
    await page.fill('input[name="To"]', 'test@example.com');
    await page.fill('input[name="Subject"]', 'Test Subject');
    await page.fill('[aria-label="Message"]', 'Test message content');
    await page.fill('input[name="CC"]', 'cc@example.com');
    
    // Set up a listener for any navigation or form submission
    let formSubmitted = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('conversation')) {
        formSubmitted = true;
      }
    });
    
    // Click the CC close button
    const ccCloseButton = page.locator('input[name="CC"]').locator('..').locator('button[type="button"]');
    await ccCloseButton.click();
    
    // Wait a moment to ensure no form submission occurs
    await page.waitForTimeout(1000);
    
    // Verify form was not submitted
    expect(formSubmitted).toBe(false);
    
    // Verify modal is still open (not closed due to form submission)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify CC field is hidden
    await expect(page.locator('input[name="CC"]')).not.toBeVisible();
  });

  test("should handle message textarea scroll functionality", async ({ page }) => {
    // Open new conversation modal
    await page.click('[data-testid="new-conversation-button"], button:has-text("Send"), button[aria-label*="new"], .rounded-full:has-text("Send"), [title*="message"]');
    
    // Wait for modal to be visible
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Find the message textarea
    const messageTextarea = page.locator('[aria-label="Message"]');
    await expect(messageTextarea).toBeVisible();
    
    // Fill with a very long message to trigger scroll
    const longMessage = Array(50).fill('This is a long line of text that should cause the textarea to scroll when it exceeds the maximum height. ').join('\n');
    await messageTextarea.fill(longMessage);
    
    // Verify the textarea has scroll capabilities
    const textareaContainer = messageTextarea.locator('..');
    const hasScrollClass = await textareaContainer.evaluate((el) => {
      return el.classList.contains('overflow-y-auto') || 
             el.classList.contains('max-h-60') ||
             getComputedStyle(el).overflowY === 'auto';
    });
    
    expect(hasScrollClass).toBe(true);
  });
});