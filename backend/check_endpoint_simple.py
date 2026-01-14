
import requests

BASE_URL = "http://127.0.0.1:8000/api"

def get_token():
    # Attempt to login to get a token
    # We need a user. I'll assume 'admin' exists or I can create one/use one from previous knowledge?
    # I don't know the password. 
    # But I can use the running backend's shell to CREATE a superuser or change password if needed?
    # Or I can try to hit the endpoint without token first to see if it's 401.
    pass

def test_stats_endpoint():
    print("Testing /orders/stats/ endpoint...")
    try:
        # First try without auth (expect 401 or 403)
        res = requests.get(f"{BASE_URL}/orders/stats/")
        print(f"No Auth Status: {res.status_code}")
        print(f"No Auth Content: {res.text}")
        
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_stats_endpoint()
