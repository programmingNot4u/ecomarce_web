import requests
import json

# First, let's check what category 12 looks like
url_get = 'http://127.0.0.1:8000/api/categories/12/'
get_response = requests.get(url_get)
print(f"GET Status Code: {get_response.status_code}")
if get_response.status_code == 200:
    current_data = get_response.json()
    print(f"Current Category Data: {json.dumps(current_data, indent=2)}")
    
    # Now try to update with the same name
    url = 'http://127.0.0.1:8000/api/categories/12/'
    data = {
        'name': current_data['name'],  # Use existing name
        'image': 'https://kcbazar.com/wp-content/uploads/2025/06/Skin-Care-1024x1024.jpg'
    }
    
    print(f"\nAttempting PATCH with data: {json.dumps(data, indent=2)}")
    response = requests.patch(url, json=data)
    print(f"PATCH Status Code: {response.status_code}")
    print(f"PATCH Response: {response.text}")
    
    if response.status_code != 200:
        try:
            error_data = response.json()
            print(f"Error Details: {json.dumps(error_data, indent=2)}")
        except:
            print("Could not parse error response as JSON")
else:
    print(f"Failed to get category: {get_response.text}")

    try:
        error_data = response.json()
        print(f"Error Details: {json.dumps(error_data, indent=2)}")
    except:
        print("Could not parse error response as JSON")
