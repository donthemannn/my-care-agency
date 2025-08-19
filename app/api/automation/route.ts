import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();

    if (action === 'amazon_demo') {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      try {
        console.log('🚀 Starting Amazon automation demo...');
        await page.goto('https://www.amazon.com');
        console.log('📍 Successfully navigated to Amazon homepage');
        
        // Verify we can see the Amazon logo
        const logo = page.locator('a[aria-label*="Amazon"]').first();
        await logo.waitFor({ timeout: 10000 });
        console.log('✅ Amazon logo is visible');
        
        // Find search box using multiple strategies
        const searchSelectors = ['#twotabsearchtextbox', 'input[type="text"]', '[placeholder*="Search"]'];
        let searchBox = null;
        
        for (const selector of searchSelectors) {
          try {
            const box = page.locator(selector).first();
            if (await box.isVisible({ timeout: 2000 })) {
              searchBox = box;
              console.log(`✅ Found search box using: ${selector}`);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
        
        if (searchBox) {
          await searchBox.fill('basketball');
          console.log('✅ Successfully filled search box with "basketball"');
          
          // Take a screenshot to show the automation worked
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const screenshotPath = `screenshots/amazon-demo-${timestamp}.png`;
          await page.screenshot({ path: screenshotPath });
          console.log(`📸 Screenshot saved: ${screenshotPath}`);
          
          await browser.close();
          
          return NextResponse.json({
            success: true,
            message: '🎉 Amazon automation demo completed successfully! Basketball search filled and screenshot taken.',
            action: 'amazon_demo',
            screenshot: screenshotPath,
            steps: [
              'Navigated to Amazon homepage',
              'Found and verified Amazon logo',
              'Located search box',
              'Filled search box with "basketball"',
              'Took screenshot as proof'
            ]
          });
        } else {
          await browser.close();
          return NextResponse.json({
            success: false,
            message: '⚠️ Could not find search box - Amazon may be blocking automation',
            action: 'amazon_demo'
          });
        }
      } catch (error) {
        await browser.close();
        throw error;
      }
    }

    if (action === 'test_automation') {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      try {
        console.log('🚀 Testing automation capabilities...');
        
        // Test 1: Navigate to a simple page
        await page.goto('https://example.com');
        console.log('✅ Navigation test passed');
        
        // Test 2: Find and interact with elements
        const heading = page.locator('h1');
        await heading.waitFor();
        const headingText = await heading.textContent();
        console.log(`✅ Element interaction test passed: "${headingText}"`);
        
        // Test 3: Take screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = `screenshots/automation-test-${timestamp}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log('✅ Screenshot capability test passed');
        
        // Test 4: JavaScript evaluation
        const pageTitle = await page.evaluate(() => document.title);
        console.log(`✅ JavaScript evaluation test passed: "${pageTitle}"`);
        
        await browser.close();
        
        return NextResponse.json({
          success: true,
          message: '🎉 All automation capabilities verified successfully!',
          action: 'test_automation',
          screenshot: screenshotPath,
          results: {
            navigation: true,
            elementInteraction: headingText,
            screenshot: true,
            jsEvaluation: pageTitle
          }
        });
      } catch (error) {
        await browser.close();
        throw error;
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Unknown action',
      availableActions: ['amazon_demo', 'test_automation']
    });

  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Automation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
