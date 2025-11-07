import google.generativeai as genai
from PIL import Image
import io
import json
from datetime import datetime
from decimal import Decimal


class GeminiInvoiceParser:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')
    
    def parse_invoice(self, image_source):
        if isinstance(image_source, str):
            image = Image.open(image_source)
        elif isinstance(image_source, bytes):
            image = Image.open(io.BytesIO(image_source))
        elif isinstance(image_source, Image.Image):
            image = image_source
        else:
            raise ValueError("Invalid image source type")
        
        prompt = """
        You are an expert at extracting delivery information from invoices and shipping documents.
        
        Extract the following information from this delivery invoice/shipping document:
        
        1. Invoice Date (format: YYYY-MM-DD)
        2. Vehicle Registration/ID Number
        3. Distance traveled in kilometers
        4. Cargo weight (convert to tonnes if in kg or other units)
        5. Fuel/Energy type (diesel, petrol, electric, or unknown)
        
        Return ONLY a valid JSON object with these exact keys:
        {
            "date": "YYYY-MM-DD",
            "vehicle_id": "string",
            "distance_km": float,
            "weight_tonnes": float,
            "fuel_type": "diesel|petrol|electric|unknown"
        }
        
        Rules:
        - If any field is missing or unclear, use null
        - Convert all weights to tonnes (1 tonne = 1000 kg)
        - Extract numeric values only (no units in the numbers)
        - Use "unknown" for fuel_type if not specified
        - Ensure date is in YYYY-MM-DD format
        
        Return ONLY the JSON object, no other text.
        """
        
        try:
            response = self.model.generate_content([prompt, image])
            
            text = response.text.strip()
            
            if text.startswith('```'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            text = text.strip()
            data = json.loads(text)
            validated_data = self._validate_data(data)
            
            return {
                'success': True,
                'data': validated_data,
                'raw_response': text
            }
            
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': f'Failed to parse JSON response: {str(e)}',
                'raw_response': text if 'text' in locals() else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Invoice parsing error: {str(e)}'
            }
    
    def _validate_data(self, data):
        validated = {}
 
        if data.get('date'):
            try:
                datetime.strptime(data['date'], '%Y-%m-%d')
                validated['date'] = data['date']
            except ValueError:
                validated['date'] = datetime.now().strftime('%Y-%m-%d')
        else:
            validated['date'] = datetime.now().strftime('%Y-%m-%d')
        
        validated['vehicle_id'] = str(data.get('vehicle_id', 'UNKNOWN')).upper()
        try:
            validated['distance_km'] = float(data.get('distance_km', 0))
        except (ValueError, TypeError):
            validated['distance_km'] = 0.0
        
        try:
            validated['weight_tonnes'] = float(data.get('weight_tonnes', 0))
        except (ValueError, TypeError):
            validated['weight_tonnes'] = 0.0
        
        fuel_type = str(data.get('fuel_type', 'unknown')).lower()
        validated['fuel_type'] = fuel_type if fuel_type in ['diesel', 'petrol', 'electric'] else 'diesel'
        
        return validated
    
    def map_fuel_to_vehicle_type(self, fuel_type):
        mapping = {
            'diesel': 'DIESEL',
            'petrol': 'PETROL',
            'electric': 'EV_GRID',
            'unknown': 'DIESEL'
        }
        return mapping.get(fuel_type.lower(), 'DIESEL')

