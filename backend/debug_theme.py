import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content.models import ThemeConfig

def debug_theme():
    # 1. Fetch active theme
    active_theme = ThemeConfig.objects.filter(is_active=True).first()
    if not active_theme:
        print("No active theme found. Creating one.")
        active_theme = ThemeConfig.objects.create(is_active=True, name='Default Theme')
    
    print(f"Current Config Keys: {list(active_theme.config.keys())}")
    current_snippets = active_theme.config.get('textSnippets', {})
    print(f"Current textSnippets: {current_snippets}")

    # 2. Simulate Update
    new_phone = "123-456-7890-TEST"
    print(f"\nUPDATING contact_phone to: {new_phone}")
    
    # Create new config object with update
    updated_snippets = current_snippets.copy()
    updated_snippets['contact_phone'] = new_phone
    
    new_config = active_theme.config.copy()
    new_config['textSnippets'] = updated_snippets
    
    # 3. Save
    active_theme.config = new_config
    active_theme.save()
    print("Saved.")

    # 4. Fetch again (Reload from DB)
    print("\nReloading from DB...")
    reloaded_theme = ThemeConfig.objects.get(pk=active_theme.pk)
    reloaded_snippets = reloaded_theme.config.get('textSnippets', {})
    print(f"Reloaded textSnippets: {reloaded_snippets}")
    
    if reloaded_snippets.get('contact_phone') == new_phone:
        print("\nSUCCESS: Update persisted in DB.")
    else:
        print("\nFAILURE: Update DID NOT persist.")

if __name__ == '__main__':
    debug_theme()
