import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Company, Vehicle, DeliveryTrip
from datetime import date, timedelta
from decimal import Decimal
from api.emissions import calculate_emissions

print("Creating demo data...")

company, created = Company.objects.get_or_create(
    name="Nordic Transport AS",
    defaults={
        'country': 'Norway',
        'annual_turnover': Decimal('5000000'), 
        'esg_score': 45.0,
        'baseline_emissions': Decimal('15000000') 
    }
)

if created:
    print(f"Created company: {company.name}")
else:
    print(f"Company already exists: {company.name}")

diesel_truck, _ = Vehicle.objects.get_or_create(
    vehicle_id="NO-DIESEL-001",
    defaults={
        'company': company,
        'vehicle_type': 'DIESEL',
        'capacity_tonnes': Decimal('10.0'),
        'registration_year': 2020
    }
)

diesel_truck2, _ = Vehicle.objects.get_or_create(
    vehicle_id="NO-DIESEL-002",
    defaults={
        'company': company,
        'vehicle_type': 'DIESEL',
        'capacity_tonnes': Decimal('12.0'),
        'registration_year': 2019
    }
)

ev_truck, _ = Vehicle.objects.get_or_create(
    vehicle_id="NO-EV-001",
    defaults={
        'company': company,
        'vehicle_type': 'EV_GRID',
        'capacity_tonnes': Decimal('8.0'),
        'registration_year': 2023
    }
)

print(f"Created vehicles")

DeliveryTrip.objects.filter(company=company).delete()
trip_count = 0

for i in range(80):
    emissions = calculate_emissions('DIESEL', Decimal('250'), Decimal('8.0'))
    DeliveryTrip.objects.create(
        company=company,
        vehicle=diesel_truck,
        trip_date=date(2023, (i % 12) + 1, (i % 28) + 1),
        distance_km=Decimal('250'),
        weight_tonnes=Decimal('8.0'),
        emissions_kg_co2=emissions
    )
    trip_count += 1

for i in range(120):
    emissions = calculate_emissions('DIESEL', Decimal('300'), Decimal('9.0'))
    DeliveryTrip.objects.create(
        company=company,
        vehicle=diesel_truck2,
        trip_date=date(2024, (i % 12) + 1, (i % 28) + 1),
        distance_km=Decimal('300'),
        weight_tonnes=Decimal('9.0'),
        emissions_kg_co2=emissions
    )
    trip_count += 1

for i in range(100):
    emissions = calculate_emissions('DIESEL', Decimal('320'), Decimal('10.0'))
    DeliveryTrip.objects.create(
        company=company,
        vehicle=diesel_truck,
        trip_date=date(2025, (i % 11) + 1, (i % 28) + 1),
        distance_km=Decimal('320'),
        weight_tonnes=Decimal('10.0'),
        emissions_kg_co2=emissions
    )
    trip_count += 1

for i in range(50):
    emissions = calculate_emissions('EV_GRID', Decimal('200'), Decimal('7.0'))
    DeliveryTrip.objects.create(
        company=company,
        vehicle=ev_truck,
        trip_date=date(2025, (i % 11) + 1, (i % 28) + 1),
        distance_km=Decimal('200'),
        weight_tonnes=Decimal('7.0'),
        emissions_kg_co2=emissions
    )
    trip_count += 1

print(f"✓ Created {trip_count} delivery trips")
print(f"✓ Years covered: 2023, 2024, 2025")
print(f"✓ Trend: INCREASING (will trigger HIGH risk alerts)")

total_emissions = sum(float(t.emissions_kg_co2) for t in DeliveryTrip.objects.filter(company=company))
print(f"\nTotal emissions: {total_emissions:,.2f} kg CO2 ({total_emissions/1000:,.2f} tonnes)")
print(f"Baseline: {float(company.baseline_emissions):,.2f} kg CO2")
print(f"Current ESG Score: {company.esg_score}/100")

print("\nDemo data created successfully!")
print("\nNext steps:")
print("1. Run: python manage.py runserver")
print("2. Test API: POST http://localhost:8000/api/ai-advisor/analyze_company/")
print("3. Body: {\"company_id\": " + str(company.id) + "}")
