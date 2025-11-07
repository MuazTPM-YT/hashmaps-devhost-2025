from django.contrib import admin
from .models import Company, Vehicle, DeliveryTrip, ComplianceDeadline, ComplianceAlert


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'annual_turnover', 'esg_score', 'created_at')
    search_fields = ('name', 'country')
    list_filter = ('country', 'esg_score')


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_id', 'company', 'vehicle_type', 'capacity_tonnes', 'registration_year')
    search_fields = ('vehicle_id',)
    list_filter = ('vehicle_type', 'company')


@admin.register(DeliveryTrip)
class DeliveryTripAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'vehicle', 'trip_date', 'distance_km', 'emissions_kg_co2', 'is_anomaly')
    search_fields = ('vehicle__vehicle_id',)
    list_filter = ('is_anomaly', 'trip_date', 'company')
    date_hierarchy = 'trip_date'


@admin.register(ComplianceDeadline)
class ComplianceDeadlineAdmin(admin.ModelAdmin):
    list_display = ('name', 'deadline_date', 'regulation', 'days_until_deadline')
    list_filter = ('regulation', 'deadline_date')


@admin.register(ComplianceAlert)
class ComplianceAlertAdmin(admin.ModelAdmin):
    list_display = ('company', 'alert_type', 'severity', 'resolved', 'triggered_at')
    list_filter = ('alert_type', 'severity', 'resolved')
    search_fields = ('company__name', 'message')
    date_hierarchy = 'triggered_at'

