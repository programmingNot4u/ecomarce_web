import urllib.request
import json
import sys

def check_api():
    url = 'http://127.0.0.1:8000/api/theme/active/'
    try:
        response = urllib.request.urlopen(url)
        data = json.load(response)
        
        print("API Response Config Keys:", data.get('config', {}).keys())
        snippets = data.get('config', {}).get('textSnippets', {}) # Frontend expects camelCase for the CONTAINER 'textSnippets' but snake_case INSIDE?
        # Wait, the serializer field 'config' is a JSONField. 
        # DRF CamelCase usually converts everything recursively.
        # If I disable it, 'text_snippets' might return as 'text_snippets' (snake) IF that's how it is in the dict,
        # OR 'textSnippets' (camel) if that's how it is in the dict.
        
        # In debug_theme.py output: "Current textSnippets: {}" 
        # Ideally we want to check internal keys like 'contact_phone'
        
        print("Snippets Keys:", snippets.keys())
        
        if 'contact_phone' in snippets:
            print("SUCCESS: Found 'contact_phone' (snake_case).")
            return True
        elif 'contactPhone' in snippets:
            print("FAILURE: Found 'contactPhone' (camelCase).")
            return False
        else:
            print("WARNING: Neither key found. Snippets might be empty.")
            # Let's try to infer from other keys or just the top level
            return True # Tentative
            
    except Exception as e:
        print(f"Error checking API: {e}")
        return False

if __name__ == '__main__':
    check_api()
