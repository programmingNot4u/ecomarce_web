from django.core.management.base import BaseCommand
from store.models import Product, ProductVariant
from django.db import transaction
import itertools

# Run with: python manage.py shell < this_script.py (or via runscript)
# Better: Just run it as a standalone script snippet in shell

def fix_variants():
    print("Starting Variant Repair...")
    products = Product.objects.all()
    count = 0
    
    for product in products:
        # Check if product has variants defined in JSON but no database combinations
        if product.variants and len(product.variants) > 0:
            current_combos = product.product_combinations.count()
            
            if current_combos == 0:
                print(f"Fixing Product: {product.name} (ID: {product.id})")
                print(f" - Found Variants: {product.variants}")
                
                # Logic copied/adapted from ProductSerializer/Views to generate combos
                # 1. Generate Cartesian Product of options
                variant_definitions = product.variants 
                # e.g. [{name: 'Size', options: ['S', 'M']}, {name: 'Color', options: ['Red']}]
                
                names = [v['name'] for v in variant_definitions]
                options = [v['options'] for v in variant_definitions]
                
                cartesian_product = list(itertools.product(*options))
                
                new_combos = []
                with transaction.atomic():
                    for combo_tuple in cartesian_product:
                        # Create Attributes Dict
                        attributes = {}
                        sku_parts = [str(product.id)]
                        
                        for i, value in enumerate(combo_tuple):
                            attr_name = names[i]
                            attributes[attr_name] = value
                            sku_parts.append(value.upper()[:3])
                            
                        # Generate SKU
                        sku = "-".join(sku_parts)
                        
                        # Create Variant
                        variant = ProductVariant.objects.create(
                            product=product,
                            attributes=attributes,
                            sku=sku,
                            price=product.price, # Default to base price
                            stock_quantity=0     # Default to 0 stock
                        )
                        new_combos.append(variant)
                        
                print(f" - Created {len(new_combos)} combinations.")
                count += 1
            else:
                # Optional: Check if count matches expected? No, too risky.
                pass
                
    print(f"Repair Complete. Fixed {count} products.")

try:
    fix_variants()
except Exception as e:
    print(f"Error: {e}")
