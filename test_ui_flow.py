import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = 'http://localhost:8001'

def run_test():
    print("Starting Browser Automation Test (Signup Flow)...")
    
    if not os.path.exists('screenshots'):
        os.makedirs('screenshots')

    with sync_playwright() as p:
        # Launch headed so user can verify visually. Slow motion for observability.
        browser = p.chromium.launch(headless=False, slow_mo=1000)
        context = browser.new_context()
        page = context.new_page()
        
        # Logging console errors
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        try:
            # 1. Signup
            print("1. Navigating to Login/Signup Page...")
            page.goto(f"{BASE_URL}/login.html")
            page.wait_for_load_state('domcontentloaded')
            page.screenshot(path="screenshots/1_login_page.png")
            
            print("   Switching to Sign Up mode...")
            # Click toggle button
            # script.js: toggleBtn.addEventListener('click', ...)
            page.click('#toggle-btn')
            
            print("   Filling Signup Form...")
            email = f"auto_test_{int(time.time())}@example.com"
            page.fill('input#name', 'Automation Test User')
            
            # Correct ID is 'identifier' based on HTML inspection
            page.fill('input#identifier', email)
            
            page.fill('input#password', 'password123')
            
            print(f"   Signing up as {email}...")
            page.click('button[type="submit"]')
            
            print("   Waiting for redirect to Profile Setup...")
            # script.js: window.location.href = 'profile-setup.html';
            page.wait_for_url(f"{BASE_URL}/profile-setup.html", timeout=10000)
            print("   Signup Successful.")
            page.screenshot(path="screenshots/2_signed_up.png")

            # 2. Add to Cart
            print("2. Navigating to Furniture Page...")
            page.goto(f"{BASE_URL}/furniture.html")
            page.wait_for_load_state('domcontentloaded')
            
            print("   Opening Product Modal...")
            page.wait_for_selector('.product-card', state='visible', timeout=10000)
            
            # Screenshot before click to verify cards
            page.screenshot(path="screenshots/2b_furniture_page.png")
            
            # Click the card container directly
            print("   Clicking first product card...")
            page.locator('.product-card').first.click()
            
            # Wait for modal visibility
            page.wait_for_selector('#full-page-product', state='visible', timeout=10000)
            print("   Product Modal Open.")
            page.screenshot(path="screenshots/3_product_modal.png")
            
            print("   Clicking Add to Cart...")
            # Correct ID is add-to-cart-btn-full
            page.click('#add-to-cart-btn-full')
            time.sleep(2) 
            page.screenshot(path="screenshots/4_added_to_cart.png")
            
            # ... rest of checkout flow ...

            # 3. Checkout
            print("3. Validating Checkout...")
            print("   Opening Cart...")
            # Click Cart Icon
            page.click('.cart-icon')
            
            # Wait for sidebar
            page.wait_for_selector('#cart-sidebar', state='visible', timeout=5000)
            print("   Cart Sidebar Open.")
            page.screenshot(path="screenshots/5_cart_open.png")
            
            print("   Clicking Checkout...")
            # Try specific ID or Text
            checkout_btn = page.locator('#checkout-btn')
            if checkout_btn.is_visible():
                checkout_btn.click()
            else:
                print("   Checkout ID not found, trying text...")
                page.get_by_role("button", name="Checkout").click()
            
            # 4. Payment Modal
            print("   Waiting for Payment Modal...")
            page.wait_for_selector('#payment-modal', state='visible', timeout=5000)
            print("   Payment Modal Open.")
            page.screenshot(path="screenshots/6_payment_modal.png")
            
            print("   Entering Address...")
            page.locator('#shipping-address').fill('123 Verified Automation St')
            
            print("   Clicking Pay Now...")
            page.click('#confirm-pay-btn')
            
            # 5. Verify Success
            print("   Waiting for success toast/redirect...")
            page.wait_for_url(f"{BASE_URL}/profile.html", timeout=15000)
            print("   Redirected to Profile.")
            page.screenshot(path="screenshots/7_success_profile.png")
            
            # Check for Order
            print("   Verifying Order in History...")
            page.wait_for_selector('.order-card', timeout=10000)
            print("   [PASS] Order found in History.")
            
            order_text = page.locator('.order-card').first.inner_text()
            print(f"   Order Details: {order_text}")

        except Exception as e:
            print(f"Test Failed: {e}")
            page.screenshot(path="screenshots/error_state.png")
            # Dump source if failed
            with open("screenshots/error_page.html", "w", encoding="utf-8") as f:
                f.write(page.content())

        finally:
            browser.close()
            print("Test Complete. Check /d:/HON/screenshots for artifacts.")

if __name__ == "__main__":
    run_test()
