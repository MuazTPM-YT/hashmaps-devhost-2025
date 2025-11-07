from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

from api.models import Company, Vehicle, DeliveryTrip, ComplianceDeadline
from api.emissions import calculate_emissions


class Command(BaseCommand):
    help = 'Generate synthetic data for testing'
    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=150, help='Number of trips to generate')
    
    def handle(self, *args, **options):
        count = options['count']
        
        self.stdout.write('Generating synthetic data...')
        
        companies = []
        for i in range(3):
            company = Company.objects.create(
                name=f'Nordic Delivery AS {i+1}',
                country=random.choice(['Norway', 'Sweden', 'Denmark', 'Finland']),
                annual_turnover=Decimal(random.randint(50000000, 500000000)),
                esg_score=random.uniform(40, 70)
            )
            companies.append(company)
            self.stdout.write(f'Created company: {company.name}')
        
        vehicle_types = ['EV_SOLAR', 'EV_NUCLEAR', 'EV_GRID', 'PETROL', 'DIESEL']
        vehicles = []
        
        for company in companies:
            for j in range(5):
                vehicle = Vehicle.objects.create(
                    company=company,
                    vehicle_id=f'{company.name[:3].upper()}-{random.randint(1000, 9999)}',
                    vehicle_type=random.choice(vehicle_types),
                    capacity_tonnes=Decimal(random.choice([7.5, 10, 12, 17])),
                    registration_year=random.randint(2018, 2024)
                )
                vehicles.append(vehicle)
        
        self.stdout.write(f'Created {len(vehicles)} vehicles')
        
        start_date = timezone.now().date() - timedelta(days=180)
        
        for i in range(count):
            vehicle = random.choice(vehicles)
            trip_date = start_date + timedelta(days=random.randint(0, 180))
            
            distance_km = Decimal(random.uniform(50, 500))
            weight_tonnes = Decimal(random.uniform(1, float(vehicle.capacity_tonnes)))
            
            emissions = calculate_emissions(
                vehicle.vehicle_type,
                distance_km,
                weight_tonnes
            )
            
            if random.random() < 0.15:
                emissions = emissions * Decimal(random.uniform(1.3, 1.8))
            
            DeliveryTrip.objects.create(
                company=vehicle.company,
                vehicle=vehicle,
                trip_date=trip_date,
                distance_km=distance_km,
                weight_tonnes=weight_tonnes,
                emissions_kg_co2=emissions
            )
        
        self.stdout.write(f'Created {count} delivery trips')
        
        for company in companies:
            trips = DeliveryTrip.objects.filter(company=company)
            total = sum(trip.emissions_kg_co2 for trip in trips)
            company.baseline_emissions = total * Decimal('1.3')
            company.save()
        
        deadlines = [
            {'name': 'CSRD Annual Sustainability Report', 'days_from_now': 45,
             'description': 'Submit annual sustainability report under CSRD regulations'},
            {'name': 'CSRD Q2 Carbon Disclosure', 'days_from_now': 120,
             'description': 'Quarterly carbon emissions disclosure'},
            {'name': 'EU Taxonomy Compliance Verification', 'days_from_now': 180,
             'description': 'Annual EU Taxonomy alignment verification'}
        ]
        
        for d in deadlines:
            ComplianceDeadline.objects.create(
                name=d['name'],
                deadline_date=timezone.now().date() + timedelta(days=d['days_from_now']),
                regulation='CSRD',
                description=d['description']
            )
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully generated all data!'))

