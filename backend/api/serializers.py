from rest_framework import serializers
from .models import Company, Vehicle, DeliveryTrip, ComplianceDeadline, ComplianceAlert


class CompanySerializer(serializers.ModelSerializer):
    total_trips = serializers.SerializerMethodField()
    total_emissions = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = '__all__'
    
    def get_total_trips(self, obj):
        return obj.deliverytrip_set.count()
    
    def get_total_emissions(self, obj):
        total = sum(trip.emissions_kg_co2 for trip in obj.deliverytrip_set.all())
        return float(total)


class VehicleSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    trip_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = '__all__'
    
    def get_trip_count(self, obj):
        return obj.deliverytrip_set.count()


class DeliveryTripSerializer(serializers.ModelSerializer):
    vehicle_type = serializers.CharField(source='vehicle.vehicle_type', read_only=True)
    vehicle_id_display = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    
    class Meta:
        model = DeliveryTrip
        fields = '__all__'
        read_only_fields = ('emissions_kg_co2', 'is_anomaly', 'anomaly_score')


class ComplianceDeadlineSerializer(serializers.ModelSerializer):
    days_until = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceDeadline
        fields = '__all__'
    
    def get_days_until(self, obj):
        return obj.days_until_deadline()


class ComplianceAlertSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = ComplianceAlert
        fields = '__all__'

