import os
import django
import json

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.serializers import ReviewSerializer, QuestionSerializer
from store.models import Product

def test_serializers():
    print("--- START DEBUGGING ---")
    
    # Ensure a product exists
    product = Product.objects.first()
    if not product:
        print("ERROR: No products found in database to test with.")
        return

    print(f"Testing with Product ID: {product.id}")

    # 1. Simulate Review Payload from Frontend
    # Frontend sends: rating, comment, images, productId, userName + mapped product, user_name
    review_payload = {
        "rating": 5,
        "comment": "Debug Review",
        "images": [],
        "productId": product.id,  # Extra field from spread
        "userName": "Guest Debugger", # Extra field from spread
        "product": product.id,    # Mapped field
        "user_name": "Guest Debugger" # Mapped field
    }
    
    print("\n[ReviewSerializer] Validating Payload:")
    print(json.dumps(review_payload, indent=2))
    
    serializer = ReviewSerializer(data=review_payload)
    if serializer.is_valid():
        print("[ReviewSerializer] SUCCESS! Data is valid.")
    else:
        print("[ReviewSerializer] FAILED!")
        print("Errors:", json.dumps(serializer.errors, indent=2))

    # 2. Simulate Question Payload
    question_payload = {
        "question": "Debug Question?",
        "productId": product.id,
        "userName": "Guest Debugger",
        "product": product.id,
        "user_name": "Guest Debugger"
    }

    print("\n[QuestionSerializer] Validating Payload:")
    print(json.dumps(question_payload, indent=2))

    qs_serializer = QuestionSerializer(data=question_payload)
    if qs_serializer.is_valid():
        print("[QuestionSerializer] SUCCESS! Data is valid.")
    else:
        print("[QuestionSerializer] FAILED!")
        print("Errors:", json.dumps(qs_serializer.errors, indent=2))

if __name__ == "__main__":
    test_serializers()
