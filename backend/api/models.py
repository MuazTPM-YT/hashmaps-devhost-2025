from django.db import models
from django.utils import timezone
from decimal import Decimal

class Company(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100, default='Norway')
    annual_turnover = models.DecimalField(max_digits=15, decimal_places=2, help_text="Annual turnover in EUR")
    esg_score = models.FloatField(default=50.0, help_text="ESG Score (0-100)")
    baseline_emissions = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Baseline emissions in kg CO2")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def calculate_esg_score(self):
        trips = self.deliverytrip_set.all()
        if not trips.exists():
            return 50.0
        
        total_emissions = sum(trip.emissions_kg_co2 for trip in trips)
        total_distance = sum(trip.distance_km for trip in trips)
        if total_distance == 0:
            return 50.0
        
        avg_emissions_per_km = total_emissions / total_distance
        if avg_emissions_per_km <= 0.2:
            score = 100.0
        elif avg_emissions_per_km >= 1.0:
            score = 0.0
        else:
            score = 100 - ((avg_emissions_per_km - 0.2) / 0.8 * 100)
        
        self.esg_score = max(0.0, min(100.0, score))
        self.save()
        return self.esg_score


class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ('EV_SOLAR', 'Electric - Solar'),
        ('EV_NUCLEAR', 'Electric - Nuclear'),
        ('EV_GRID', 'Electric - Grid Mix'),
        ('PETROL', 'Petrol'),
        ('DIESEL', 'Diesel'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    vehicle_id = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES)
    capacity_tonnes = models.DecimalField(max_digits=5, decimal_places=2)
    registration_year = models.IntegerField(default=2020)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['vehicle_id']
    
    def __str__(self):
        return f"{self.vehicle_id} ({self.get_vehicle_type_display()})"


class DeliveryTrip(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    trip_date = models.DateField()
    distance_km = models.DecimalField(max_digits=8, decimal_places=2)
    weight_tonnes = models.DecimalField(max_digits=6, decimal_places=2)
    emissions_kg_co2 = models.DecimalField(max_digits=10, decimal_places=3)
    is_anomaly = models.BooleanField(default=False)
    anomaly_score = models.FloatField(null=True, blank=True)
    invoice_source = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-trip_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'trip_date']),
            models.Index(fields=['is_anomaly']),
        ]
    
    def __str__(self):
        return f"Trip {self.id} - {self.vehicle.vehicle_id} on {self.trip_date}"


class ComplianceDeadline(models.Model):
    name = models.CharField(max_length=255)
    deadline_date = models.DateField()
    regulation = models.CharField(max_length=100, default='CSRD')
    description = models.TextField()
    applicable_to = models.CharField(max_length=100, default='All Nordic Companies')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['deadline_date']
    
    def __str__(self):
        return f"{self.name} - {self.deadline_date}"
    
    def days_until_deadline(self):
        delta = self.deadline_date - timezone.now().date()
        return delta.days


class ComplianceAlert(models.Model):
    ALERT_TYPES = [
        ('DEADLINE', 'Deadline Approaching'),
        ('ANOMALY', 'Emission Anomaly'),
        ('THRESHOLD', 'Threshold Exceeded'),
        ('ESG_SCORE', 'ESG Score Warning'),
    ]
    
    SEVERITY_LEVELS = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    message = models.TextField()
    details = models.JSONField(null=True, blank=True)
    triggered_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['company', 'resolved']),
            models.Index(fields=['alert_type', 'severity']),
        ]
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.severity} ({self.company.name})"

