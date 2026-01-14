from rest_framework import serializers
from django.db.models import Q
from .models import Order, OrderItem, VerificationLog, PaymentMethod, FollowUp, PaymentSettings
from store.models import Product
from store.serializers import ProductSerializer

class OrderItemProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'sale_price', 'on_sale', 'images', 'category']

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = OrderItemProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class PaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = '__all__'


class VerificationLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VerificationLog
        fields = '__all__'
        read_only_fields = ['order', 'admin_user', 'created_at']

    def get_admin_name(self, obj):
        return obj.admin_user.username if obj.admin_user else 'System'

class FollowUpSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    order_date = serializers.SerializerMethodField()
    order_total = serializers.DecimalField(source='order.total', max_digits=10, decimal_places=2, read_only=True)
    order_items_summary = serializers.SerializerMethodField()
    customer_details = serializers.SerializerMethodField()

    class Meta:
        model = FollowUp
        fields = '__all__'
        read_only_fields = ['moderator', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        if obj.order:
            return obj.order.customer_name
        if obj.customer:
            return obj.customer.get_full_name() or obj.customer.username
        return "Unknown"

    def get_customer_phone(self, obj):
        if obj.order:
            return obj.order.phone
        if obj.customer:
            return obj.customer.phone_number
        return "N/A"

    def get_order_date(self, obj):
        return obj.order.created_at if obj.order else None

    def get_order_items_summary(self, obj):
        if not obj.order:
            return "General Follow-up"
        return ", ".join([f"{item.quantity}x {item.product_name}" for item in obj.order.items.all()])

    def get_customer_details(self, obj):
        if not obj.customer:
            return None
        return {
            'id': obj.customer.id,
            'name': obj.customer.get_full_name() or obj.customer.username,
            'phone': obj.customer.phone_number,
            'email': obj.customer.email
        }

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    verification_logs = VerificationLogSerializer(many=True, read_only=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)
    
    # Write-only field for creating items
    cart_items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    risk_score = serializers.SerializerMethodField()
    risk_label = serializers.SerializerMethodField()
    payment_method_label = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_risk_score(self, obj):
        return self._calculate_risk(obj)['score']

    def get_risk_label(self, obj):
        return self._calculate_risk(obj)['label']

    def _calculate_risk(self, obj):
        # Identify customer orders
        if obj.customer:
            orders = Order.objects.filter(customer=obj.customer)
        else:
            orders = Order.objects.filter(phone=obj.phone) | Order.objects.filter(email=obj.email)
            if obj.email:
                orders = orders.filter(email=obj.email) # Refine if email exists
        
        # Exclude current order from history analysis? 
        # Actually user wants "Full Data Full History". 
        # If this is the FIRST order, history is empty.
        
        total_count = orders.count()
        if total_count <= 1:
            return {'score': 100, 'label': 'New User'}
        
        # Calculate success rate
        # Exclude 'Pending' from "history" logic usually, but user said "Full History".
        # Let's check completed ones for risk.
        completed_or_failed = orders.exclude(status='Pending')
        if not completed_or_failed.exists():
             return {'score': 100, 'label': 'No History'}

        cancelled_count = completed_or_failed.filter(Q(status='Cancelled') | Q(payment_status='Failed')).count()
        relevant_total = completed_or_failed.count()
        
        success_rate = ((relevant_total - cancelled_count) / relevant_total) * 100
        
        if success_rate < 50:
            return {'score': round(success_rate), 'label': 'High Risk'}
        elif success_rate < 80:
            return {'score': round(success_rate), 'label': 'Medium Risk'}
        return {'score': round(success_rate), 'label': 'High Probability'}

    def get_payment_method_label(self, obj):
        method = obj.payment_method
        if method and method.isdigit():
            try:
                pm = PaymentMethod.objects.get(id=int(method))
                return pm.name
            except PaymentMethod.DoesNotExist:
                return method
        return method

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Robust Customer Name
        if not ret.get('customer_name'):
             if instance.customer:
                 ret['customer_name'] = instance.customer.username # Or first_name + last_name
                 # If we have name on customer profile, use it
                 full_name = instance.customer.get_full_name()
                 if full_name:
                     ret['customer_name'] = full_name
        
        # Robust Address Parsing (ensure it's dict)
        shipping_addr = ret.get('shipping_address')
        if isinstance(shipping_addr, str):
            import json
            try:
                ret['shipping_address'] = json.loads(shipping_addr.replace("'", '"')) # Simple fix for python string
                shipping_addr = ret['shipping_address'] # Update var
            except:
                pass
        
        # Fallback: Extract name from shipping address if still missing
        if not ret.get('customer_name') and isinstance(shipping_addr, dict):
            ret['customer_name'] = shipping_addr.get('name') or shipping_addr.get('firstName', '') + ' ' + shipping_addr.get('lastName', '')

        return ret

    def update(self, instance, validated_data):
        # Check for items in initial_data (raw payload) as 'items' is read-only
        items_data = self.initial_data.get('items')
        # Also check validated_data for 'cart_items' just in case
        cart_items = validated_data.pop('cart_items', None)
        
        payload_items = items_data if items_data is not None else cart_items

        # Update Order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle Items
        if payload_items is not None:
            instance.items.all().delete()
            from store.models import Product
            
            for item in payload_items:
                # Robust extraction of Product ID
                p_id = item.get('id') or item.get('productId')
                
                # Robustness: Handle if p_id itself is a dict (nested product object)
                if isinstance(p_id, dict):
                    p_id = p_id.get('id')

                # If product is a nested dict (common in frontend state)
                product_field = item.get('product')
                if isinstance(product_field, dict):
                    p_id = product_field.get('id')
                elif product_field:
                    p_id = product_field

                if not p_id:
                    continue # Skip invalid items

                # Robust extraction of other fields
                qty = item.get('quantity', 1)
                price = item.get('price', 0)
                name = item.get('name') or item.get('productName')
                image = item.get('image')

                # Variant Info
                v_info = item.get('variantInfo') or item.get('variant_info')
                
                try:
                    product_instance = Product.objects.get(id=p_id)
                    
                    OrderItem.objects.create(
                        order=instance,
                        product=product_instance,
                        product_name=name or product_instance.name,
                        price=price,
                        quantity=qty,
                        image=image,
                        variant_info=v_info
                    )
                except Product.DoesNotExist:
                     continue

        return instance

    def create(self, validated_data):
        # --- BACKEND VALIDATION ---
        # Ensure shipping address is present and not empty
        shipping_address = validated_data.get('shipping_address')
        if not shipping_address or not isinstance(shipping_address, dict) or not any(shipping_address.values()):
             # If using DRF's validation, better to raise ValidationError
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"shipping_address": "Shipping address is required and cannot be empty."})

        # Ensure payment method is present
        payment_method = validated_data.get('payment_method')
        if not payment_method:
             from rest_framework.exceptions import ValidationError
             raise ValidationError({"payment_method": "Payment method is required."})
        
        # Ensure shipping_address is saving as valid JSON
        import json
        if isinstance(shipping_address, dict):
            # If using SQLite or a DB without native JSON, it might save as string representation.
            # We explicitly dump to ensure double-quotes for standard JSON compatibility.
            # However, if it's a JSONField in Postgres, this might double-encode. 
            # Assuming SQLite/MySQL/TextField usage or generic issues:
            pass # Django JSONField should handle dicts. 
            # The issue is likely the 'hack' in frontend receiving single quotes.
            # This means Django might be saving the __str__ of the dict.
        # --- END VALIDATION ---
        
        cart_items = validated_data.pop('cart_items', [])
        
        # Ensure customer info is populated if available in request or related user
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['customer'] = request.user
            if not validated_data.get('customer_name'):
                validated_data['customer_name'] = request.user.first_name + ' ' + request.user.last_name
            if not validated_data.get('email'):
                validated_data['email'] = request.user.email
        
        # CRITICAL: Ensure shipping_address is properly structured
        # Frontend sends it as a dict, backend expects JSONField
        if 'shipping_address' not in validated_data or not validated_data.get('shipping_address'):
            validated_data['shipping_address'] = {}
        
        # CRITICAL: Handle payment_method - could be ID or name
        # Convert common IDs to proper names for better display
        payment_method = validated_data.get('payment_method', 'COD')
        payment_method_map = {
            'cod': 'Cash on Delivery',
            'bkash': 'Bkash',
            'nagad': 'Nagad',
            'rocket': 'Rocket'
        }
        # If it's a known ID, convert to name; otherwise keep as-is
        if payment_method.lower() in payment_method_map:
            validated_data['payment_method'] = payment_method_map[payment_method.lower()]
        
        # Debug print to verify incoming data
        print("Creating Order with Data:", validated_data)
        print(f"Shipping Address: {validated_data.get('shipping_address')}")
        print(f"Payment Method: {validated_data.get('payment_method')}")
        
        # --- UPDATE USER NAME IF GENERIC ---
        try:
            user = validated_data.get('customer')
            
            # --- NEW: Guest to User Conversion Logic ---
            if not user:
                phone = validated_data.get('phone')
                if phone:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    
                    # Check if user exists by phone
                    try:
                        existing_user = User.objects.get(phone_number=phone)
                        validated_data['customer'] = existing_user
                        user = existing_user
                        print(f"Linked Guest Order to Existing User: {phone}")
                    except User.DoesNotExist:
                        # Create new user
                        try:
                            # Username must be unique, use phone
                            new_user = User.objects.create(
                                username=phone,
                                phone_number=phone,
                                first_name=validated_data.get('customer_name', 'Guest').split(' ')[0],
                                last_name=" ".join(validated_data.get('customer_name', 'Guest').split(' ')[1:])
                            )
                            # Set unverifiable password since they didn't set one
                            new_user.set_unusable_password() 
                            new_user.save()
                            
                            validated_data['customer'] = new_user
                            user = new_user
                            print(f"Created New User for Guest Order: {phone}")
                        except Exception as create_err:
                            print(f"Error creating user for guest order: {create_err}")

            # Check if user exists
            if user:
                ship_addr = validated_data.get('shipping_address', {})
                # Try to get name from shipping address
                first_name = ship_addr.get('first_name') or ship_addr.get('firstName')
                last_name = ship_addr.get('last_name') or ship_addr.get('lastName')
                
                # If single 'name' field in address
                if not first_name and ship_addr.get('name'):
                    parts = ship_addr.get('name').split(' ')
                    first_name = parts[0]
                    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

                # Fallback to customer_name from order payload if available and valid
                if not first_name and validated_data.get('customer_name'):
                    c_name = validated_data.get('customer_name')
                    # Ensure it's not a generic guest/phone name
                    if c_name != 'Guest' and not c_name.replace(' ', '').isdigit():
                         parts = c_name.split(' ')
                         first_name = parts[0]
                         last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

                # UPDATE 1: Fields (Name)
                # Only update if user has no name or has a numeric/guest name
                current_first = user.first_name
                if not current_first or current_first.isdigit() or current_first == 'Guest':
                    if first_name:
                        user.first_name = first_name
                        user.last_name = last_name or ""
                        print(f"Updated User {user.id} name to {first_name} {user.last_name}")

                # UPDATE 2: Address
                # Only update if user has no shipping address saved
                if not user.shipping_address or not any(user.shipping_address.values()):
                    if ship_addr:
                        # Ensure we save structured data if possible, or just the dict
                        user.shipping_address = ship_addr
                        print(f"Updated User {user.id} shipping address")
                        
                        # Also set billing if empty
                        if not user.billing_address:
                            user.billing_address = ship_addr

                user.save()
        except Exception as e:
            print(f"Failed to update user profile from order: {e}")
            import traceback
            traceback.print_exc()
        # --- END UPDATE USER NAME ---
        
        order = Order.objects.create(**validated_data)
        
        # Helper to normalize variant info for comparison
        def normalize_variant(v_info):
            if not v_info: return ""
            if isinstance(v_info, dict):
                return str(sorted(v_info.items()))
            return str(v_info)

        # Aggregation Logic
        aggregated_items = {}
        
        for item in cart_items:
            # item = { product_id, quantity, price, name, image, variant_info, variant_id }
            p_id = item.get('id') or item.get('productId')
            variant_info = item.get('variant_info') or item.get('variantInfo') or item.get('selectedVariant')
            if not variant_info and (item.get('color') or item.get('size')):
                 variant_info = {k: item[k] for k in ['color', 'size'] if k in item}
            
            # Key for aggregation: ProductID + Normalized Variant Info
            key = f"{p_id}_{normalize_variant(variant_info)}"
            
            if key in aggregated_items:
                aggregated_items[key]['quantity'] += int(item.get('quantity', 1))
            else:
                aggregated_items[key] = {
                    'product_id': p_id,
                    'quantity': int(item.get('quantity', 1)),
                    'price': item.get('price'),
                    'name': item.get('name'),
                    'image': item.get('image'),
                    'variant_info': variant_info
                }

        from store.models import Product

        for key, item_data in aggregated_items.items():
            try:
                product = Product.objects.get(id=item_data['product_id'])
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=item_data['name'] or product.name,
                    price=item_data['price'] if item_data['price'] is not None else product.price,
                    quantity=item_data['quantity'],
                    image=item_data['image'], # Save the specific variant/product image
                    variant_info=item_data['variant_info'] # Save size/color details
                )
                
                # Deduct Stock
                if product.manage_stock and product.stock_quantity >= item_data['quantity']:
                    product.stock_quantity -= item_data['quantity']
                    product.save()
                    
                    # Log Config
                    from store.models import InventoryLog
                    InventoryLog.objects.create(
                        product=product,
                        change_amount=-item_data['quantity'],
                        reason='Order',
                        note=f'Order #{order.id} Placed',
                        user=validated_data.get('customer')
                    )
                
            except Product.DoesNotExist:
                print(f"Product {item_data['product_id']} not found for order {order.id}")
                pass 
                
        return order


