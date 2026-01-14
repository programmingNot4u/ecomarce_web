import uuid
import random

class CourierService:
    @staticmethod
    def create_shipment(order, courier_name):
        """
        Simulate creating a shipment with a 3rd party courier.
        Returns (tracking_number, label_url)
        """
        # In a real app, this would make an API call to Pathao/Steadfast/RedX
        
        prefix = "TRK"
        if courier_name.lower() == 'pathao':
            prefix = "PTH"
        elif courier_name.lower() == 'steadfast':
            prefix = "SF"
        elif courier_name.lower() == 'redx':
            prefix = "RDX"
            
        # Generate a realistic looking tracking number
        tracking_number = f"{prefix}-{random.randint(100000, 999999)}-{order.id}"
        
        # Simulate a label URL (would be a PDF from the courier)
        label_url = f"https://courier.example.com/labels/{tracking_number}.pdf"
        
        return {
            'tracking_number': tracking_number,
            'label_url': label_url,
            'status': 'Pickup Pending'
        }

    @staticmethod
    def cancel_shipment(tracking_number):
        """
        Simulate cancelling a shipment
        """
        return True
