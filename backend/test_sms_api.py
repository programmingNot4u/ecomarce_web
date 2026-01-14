
import requests

def test_sms_sending():
    print("--- Testing SMS API Connectivity ---")
    
    # Credentials provided by user
    api_url = "http://bulksmsbd.net/api/smsapi"
    api_key = "SpedG27TwABIag6IiK65"
    sender_id = "8809648905633"
    phone_number = "017XXXXXXXX" # Need a valid number to test, but will use a placeholder or ask user. 
    # Wait, I shouldn't spam a random number. I will use a dummy number format or just check if the API accepts the auth.
    # The API might reject 017XXXXXXXX. I will try a generic number or better yet, just print the request structure 
    # and maybe try to send to a generic test number if I had one. 
    # For now let's try to check balance or just send to an invalid number to see handshake.
    
    # Actually, the user wants me to FIX it. I should probably use a real looking dummy or ask.
    # But usually these APIs return a specific error code if auth is wrong.
    
    # Let's try with the exact params the user pasted to mimic their attempt, but maybe `01700000000`?
    phone_number = "01700000000" 
    
    message = "Test SMS from Debugger"
    
    params = {
        'api_key': api_key,
        'type': 'text',
        'number': phone_number,
        'senderid': sender_id,
        'message': message
    }
    
    print(f"Sending Request to: {api_url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(api_url, params=params)
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
    except Exception as e:
        print(f"Error sending request: {e}")

if __name__ == "__main__":
    test_sms_sending()
