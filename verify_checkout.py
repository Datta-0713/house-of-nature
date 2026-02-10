import urllib.request
import urllib.parse
import json
import time

BASE_URL = 'http://localhost:8001/api'

def post_json(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        print(f"Request Error: {e}")
        return 500, {}

def run_verification():
    print("Starting Verification...")
    
    # 1. Signup
    email = f"test_user_{int(time.time())}@example.com"
    password = "password123"
    print(f"1. Signing up user: {email}")
    
    status, user_data = post_json(f"{BASE_URL}/auth/signup", {
        'email': email,
        'password': password,
        'name': 'Test User'
    })
    
    if status != 200:
        print(f"Signup Failed: {user_data}")
        return
    
    token = user_data['token']
    print(f"   Signup Successful. Token: {token}")

    # 2. Creating Order
    print("2. Creating Order (Bamboo Chair @ 690 * 2 + Bamboo Stool @ 1200 * 1)...")
    cart_items = [
        {'title': 'Bamboo Chair v1', 'quantity': 2}, 
        {'title': 'Bamboo Stool', 'quantity': 1}
    ]
    
    status, order_data = post_json(f"{BASE_URL}/orders", {
        'items': cart_items,
        'payment': {'address': '123 Verify St'}
    }, token)
    
    if status != 200:
        print(f"Order Creation Failed: {order_data}")
        return
    
    order_id = order_data.get('orderId')
    print(f"   Order Created Successfully. ID: {order_id}")

    # 3. Verify Backend State
    print("3. Verifying Backend File Persistence...")
    
    try:
        # Check Orders File
        with open('d:/HON/orders.json', 'r') as f:
            orders = json.load(f)
        
        order_found = next((o for o in orders if o['id'] == order_id), None)
        if order_found:
            print(f"   [PASS] Order found in global orders.json.")
            
            # Expected Total: (690 * 2) + (1200 * 1) = 1380 + 1200 = 2580
            if order_found['total'] == 2580:
                print(f"   [PASS] Price Validation Exact Match: 2580")
            else:
                print(f"   [FAIL] Price Mismatch. Expected 2580, Got {order_found['total']}")
        else:
            print("   [FAIL] Order NOT found in orders.json")

        # Check User File
        with open('d:/HON/users.json', 'r') as f:
            users = json.load(f)
        
        user_found = next((u for u in users if u['id'] == token), None)
        if user_found:
            user_order = next((o for o in user_found.get('orders', []) if o['id'] == order_id), None)
            if user_order:
                print("   [PASS] Order linked to user history.")
            else:
                print("   [FAIL] Order NOT linked to user history.")
            
            if not user_found.get('cart'):
                print("   [PASS] User cart cleared.")
            else:
                print(f"   [FAIL] User cart NOT cleared: {user_found['cart']}")
        else:
            print("   [FAIL] User record not found.")

    except Exception as e:
        print(f"Verification Check Error: {e}")
        
    print("\nVerification Complete.")

if __name__ == "__main__":
    run_verification()
