import requests
import json

BASE_URL = "http://localhost:8000/api"

def check_endpoint(endpoint):
    print(f"\n--- Checking {endpoint} ---")
    try:
        response = requests.get(f"{BASE_URL}/{endpoint}/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"Response is a List. Length: {len(data)}")
                if len(data) > 0:
                    print("First item keys:", data[0].keys())
            elif isinstance(data, dict):
                print(f"Response is a Dict. Keys: {data.keys()}")
                if 'results' in data:
                    print(f"Results length: {len(data['results'])}")
            else:
                print(f"Unknown type: {type(data)}")
        else:
            print("Error response:", response.text)
    except Exception as e:
        print(f"Exception: {e}")

check_endpoint("categories")
check_endpoint("products")
