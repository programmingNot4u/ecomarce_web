
import requests
import json

base_url = 'http://localhost:9000/api'
email = 'ronyp@maryone.shop'
password = 'admin'

# Login
print("Logging in...")
try:
    resp = requests.post(f'{base_url}/users/login/', json={'email': email, 'password': password})
    if resp.status_code == 200:
        data = resp.json()
        token = data.get('token')
        print(f"Login successful. Token: {token[:10]}...")
        
        # Get Users
        print("Fetching users...")
        headers = {'Authorization': f'Token {token}'}
        users_resp = requests.get(f'{base_url}/users/', headers=headers)
        if users_resp.status_code == 200:
            users = users_resp.json()
            print(f"Users found: {len(users)}")
            for u in users:
                print(f" - {u['username']} ({u.get('role', 'N/A')})")
        else:
            print(f"Failed to fetch users: {users_resp.status_code} {users_resp.text}")
    else:
        print(f"Login failed: {resp.status_code} {resp.text}")
except Exception as e:
    print(f"Error: {e}")
