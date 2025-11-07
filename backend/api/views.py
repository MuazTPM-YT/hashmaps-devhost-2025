from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Sum, Avg, Count, Q
from django.conf import settings
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from .data_lake import CarbonDataLake
from .data_processor import EmissionDataProcessor
from .gemini_advisor import CarbonComplianceAdvisor

from .models import Company, Vehicle, DeliveryTrip, ComplianceDeadline, ComplianceAlert
from .serializers import (
    CompanySerializer, VehicleSerializer, DeliveryTripSerializer,
    ComplianceDeadlineSerializer, ComplianceAlertSerializer
)
from .emissions import (
    calculate_emissions, calculate_emissions_savings,
    calculate_penalty_risk, calculate_financing_impact
)
from .ml_detector import EmissionAnomalyDetector, check_compliance_deadlines
from .invoice_parser import GeminiInvoiceParser


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    @action(detail=True, methods=['post'])
    def update_esg_score(self, request, pk=None):
        company = self.get_object()
        score = company.calculate_esg_score()
        
        return Response({
            'success': True,
            'esg_score': score
        })


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    filterset_fields = ['company', 'vehicle_type']


class DeliveryTripViewSet(viewsets.ModelViewSet):
    queryset = DeliveryTrip.objects.all()
    serializer_class = DeliveryTripSerializer
    filterset_fields = ['company', 'vehicle', 'is_anomaly', 'trip_date']
    
    def perform_create(self, serializer):
        trip_data = serializer.validated_data
        
        emissions = calculate_emissions(
            trip_data['vehicle'].vehicle_type,
            trip_data['distance_km'],
            trip_data['weight_tonnes']
        )
        
        serializer.save(emissions_kg_co2=emissions)


class ComplianceDeadlineViewSet(viewsets.ModelViewSet):
    queryset = ComplianceDeadline.objects.all()
    serializer_class = ComplianceDeadlineSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        from django.utils import timezone
        today = timezone.now().date()
        deadlines = ComplianceDeadline.objects.filter(
            deadline_date__gte=today,
            deadline_date__lte=today + timedelta(days=90)
        )
        serializer = self.get_serializer(deadlines, many=True)
        return Response(serializer.data)


class ComplianceAlertViewSet(viewsets.ModelViewSet):
    queryset = ComplianceAlert.objects.all()
    serializer_class = ComplianceAlertSerializer
    filterset_fields = ['company', 'alert_type', 'severity', 'resolved']
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        from django.utils import timezone
        alert = self.get_object()
        alert.resolved = True
        alert.resolved_at = timezone.now()
        alert.save()
        
        return Response({'success': True, 'message': 'Alert resolved'})


class InvoiceUploadView(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser)
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        invoice_file = request.FILES.get('invoice')
        company_id = request.data.get('company_id')
        
        if not invoice_file:
            return Response(
                {'error': 'No invoice file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not company_id:
            return Response(
                {'error': 'company_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        parser = GeminiInvoiceParser(api_key=settings.GEMINI_API_KEY)
        result = parser.parse_invoice(invoice_file.read())
        
        if not result['success']:
            return Response(
                {'error': result.get('error', 'Parsing failed')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = result['data']
        
        vehicle_type = parser.map_fuel_to_vehicle_type(data['fuel_type'])
        vehicle, created = Vehicle.objects.get_or_create(
            vehicle_id=data['vehicle_id'],
            defaults={
                'company': company,
                'vehicle_type': vehicle_type,
                'capacity_tonnes': Decimal('10.0')
            }
        )
        
        emissions = calculate_emissions(
            vehicle.vehicle_type,
            Decimal(str(data['distance_km'])),
            Decimal(str(data['weight_tonnes']))
        )
        
        trip = DeliveryTrip.objects.create(
            company=company,
            vehicle=vehicle,
            trip_date=data['date'],
            distance_km=Decimal(str(data['distance_km'])),
            weight_tonnes=Decimal(str(data['weight_tonnes'])),
            emissions_kg_co2=emissions,
            invoice_source=invoice_file.name
        )
        
        return Response({
            'success': True,
            'trip_id': trip.id,
            'vehicle_created': created,
            'extracted_data': data,
            'emissions_kg_co2': float(emissions)
        }, status=status.HTTP_201_CREATED)


class DashboardViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        company_id = request.query_params.get('company_id')
        
        if not company_id:
            return Response(
                {'error': 'company_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        trips = DeliveryTrip.objects.filter(company=company)
        total_emissions = trips.aggregate(Sum('emissions_kg_co2'))['emissions_kg_co2__sum'] or Decimal('0')
        if company.baseline_emissions:
            baseline = company.baseline_emissions
        else:
            baseline = total_emissions * Decimal('1.5') if total_emissions > 0 else Decimal('1000000')
        
        savings = calculate_emissions_savings(total_emissions, baseline)
        
        penalty_threshold = Decimal('10000000')
        penalty_calc = calculate_penalty_risk(
            total_emissions,
            penalty_threshold,
            company.annual_turnover
        )
        
        esg_score = company.calculate_esg_score()
        financing = calculate_financing_impact(esg_score, company.annual_turnover)
        vehicle_breakdown = list(trips.values('vehicle__vehicle_type').annotate(
            total_emissions=Sum('emissions_kg_co2'),
            trip_count=Count('id'),
            avg_emissions=Avg('emissions_kg_co2')
        ).order_by('-total_emissions'))
        
        vehicle_chart_data = [
            {
                'name': item['vehicle__vehicle_type'].replace('_', ' '),
                'value': float(item['total_emissions']),
                'count': item['trip_count']
            }
            for item in vehicle_breakdown
        ]
        
        anomaly_count = trips.filter(is_anomaly=True).count()
        recent_alerts = ComplianceAlert.objects.filter(
            company=company,
            resolved=False
        ).order_by('-triggered_at')[:5]
        
        return Response({
            'company': {
                'id': company.id,
                'name': company.name,
                'annual_turnover_eur': float(company.annual_turnover),
                'esg_score': esg_score,
            },
            'emissions': {
                'total_kg': float(total_emissions),
                'total_tonnes': float(total_emissions / 1000),
                'baseline_kg': float(baseline),
                'savings_kg': float(savings['savings_kg']),
                'savings_tonnes': float(savings['savings_tonnes']),
                'savings_percentage': float(savings['savings_percentage']),
            },
            'penalty_risk': {
                'exceeds_threshold': penalty_calc['exceeds_threshold'],
                'potential_penalty_eur': float(penalty_calc['potential_penalty_eur']),
                'penalty_avoided': not penalty_calc['exceeds_threshold'],
                'threshold_kg': float(penalty_calc['threshold_kg']),
                'excess_emissions_kg': float(penalty_calc['excess_emissions_kg']),
            },
            'financing': {
                'annual_savings_eur': float(financing['annual_savings_eur']),
                'base_rate': financing['base_rate'],
                'adjusted_rate': financing['adjusted_rate'],
                'rate_reduction_bps': int(financing['rate_reduction'] * 10000),
            },
            'vehicle_breakdown': vehicle_chart_data,
            'trips': {
                'total_count': trips.count(),
                'anomaly_count': anomaly_count,
                'anomaly_percentage': (anomaly_count / trips.count() * 100) if trips.count() > 0 else 0,
            },
            'alerts': ComplianceAlertSerializer(recent_alerts, many=True).data
        })
    
    @action(detail=False, methods=['post'])
    def detect_anomalies(self, request):
        company_id = request.data.get('company_id')
        
        if not company_id:
            return Response(
                {'error': 'company_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        detector = EmissionAnomalyDetector()
        result = detector.train_and_detect(company_id)
        
        return Response(result)
    
    @action(detail=False, methods=['post'])
    def check_deadlines(self, request):
        company_id = request.data.get('company_id')
        result = check_compliance_deadlines(company_id)
        
        return Response(result)

class AIAdvisorViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def analyze_company(self, request):
        company_id = request.data.get('company_id')
        
        if not company_id:
            return Response({'error': 'company_id required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        data_lake = CarbonDataLake()
        trips = DeliveryTrip.objects.filter(company=company).values(
            'trip_date', 'distance_km', 'weight_tonnes', 
            'emissions_kg_co2', 'vehicle__vehicle_type'
        )
        
        trip_data = [
            {
                'trip_date': str(trip['trip_date']),
                'distance_km': float(trip['distance_km']),
                'weight_tonnes': float(trip['weight_tonnes']),
                'emissions_kg_co2': float(trip['emissions_kg_co2']),
                'vehicle_type': trip['vehicle__vehicle_type']
            }
            for trip in trips
        ]
        
        lake_id = data_lake.upload_emission_data(company_id, trip_data)
        lake_data = data_lake.get_company_data(company_id)
        
        processor = EmissionDataProcessor()
        trends = processor.analyze_trends(lake_data)
        threshold_check = processor.check_threshold_breach(
            lake_data, 
            10000000  # 10,000 tonnes threshold
        )
        
        advisor = CarbonComplianceAdvisor(api_key=settings.GEMINI_API_KEY)
        
        company_info = {
            'name': company.name,
            'country': company.country,
            'annual_turnover': float(company.annual_turnover),
            'esg_score': company.esg_score
        }
        
        ai_response = advisor.analyze_and_suggest(trends, company_info)
        
        if not ai_response['success']:
            return Response({'error': ai_response['error']}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        advice = ai_response['advice']
        if advice.get('risk_level') in ['HIGH', 'CRITICAL']:
            ComplianceAlert.objects.create(
                company=company,
                alert_type='THRESHOLD',
                severity=advice['risk_level'],
                message=advice.get('trend_analysis', 'High risk detected'),
                details=advice
            )
        
        lake_stats = data_lake.get_storage_stats()
        company_stats = data_lake.get_company_stats(company_id)
        
        return Response({
            'success': True,
            'company': company_info,
            'data_lake': {
                'lake_record_id': lake_id,
                'records_processed': len(lake_data),
                'global_stats': lake_stats,
                'company_stats': company_stats,
                'storage': 'PostgreSQL (Production Database)'
            },
            'analytics': {
                'engine': 'DuckDB In-Memory Analytics',
                'emission_trends': trends,
                'threshold_status': threshold_check
            },
            'ai_insights': {
                'model': 'Google Gemini 2.5 Pro',
                'advice': advice
            }
        })
    
    @action(detail=False, methods=['get'])
    def data_lake_stats(self, request):
        data_lake = CarbonDataLake()
        stats = data_lake.get_storage_stats()
        
        return Response({
            'success': True,
            'data_lake_stats': stats
        })
    


class AIAdvisorViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def analyze_company(self, request):
        company_id = request.data.get('company_id')
        
        if not company_id:
            return Response(
                {'error': 'company_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        trips = DeliveryTrip.objects.filter(company=company).values(
            'trip_date', 'distance_km', 'weight_tonnes', 
            'emissions_kg_co2', 'vehicle__vehicle_type'
        )
        
        if not trips.exists():
            return Response(
                {'error': 'No emission data found for this company'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        trip_data = [
            {
                'trip_date': str(trip['trip_date']),
                'distance_km': float(trip['distance_km']),
                'weight_tonnes': float(trip['weight_tonnes']),
                'emissions_kg_co2': float(trip['emissions_kg_co2']),
                'vehicle_type': trip['vehicle__vehicle_type']
            }
            for trip in trips
        ]
        
        data_lake = CarbonDataLake()
        lake_record_id = data_lake.upload_emission_data(
            company_id, 
            trip_data, 
            source='Django ORM'
        )
        
        lake_data = data_lake.get_company_data(company_id)
        
        processor = EmissionDataProcessor()
        trends = processor.analyze_trends(lake_data)
        threshold_check = processor.check_threshold_breach(
            lake_data, 
            10000000
        )
        vehicle_efficiency = processor.calculate_vehicle_efficiency(lake_data)
        
        company_info = {
            'name': company.name,
            'country': company.country,
            'annual_turnover': float(company.annual_turnover),
            'esg_score': company.esg_score
        }
        
        advisor = CarbonComplianceAdvisor(api_key=settings.GEMINI_API_KEY)
        ai_response = advisor.analyze_and_suggest(
            trends, 
            company_info,
            threshold_check
        )
        
        if not ai_response['success']:
            return Response(
                {'error': ai_response['error']}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        advice = ai_response['advice']
        
        if advice.get('risk_level') in ['HIGH', 'CRITICAL']:
            ComplianceAlert.objects.create(
                company=company,
                alert_type='THRESHOLD',
                severity=advice['risk_level'],
                message=advice.get('trend_analysis', 'High compliance risk detected'),
                details=advice
            )
        
        lake_stats = data_lake.get_storage_stats()
        company_stats = data_lake.get_company_stats(company_id)
        
        return Response({
            'success': True,
            'timestamp': timezone.now().isoformat(),
            'company': company_info,
            'data_lake': {
                'lake_record_id': lake_record_id,
                'records_processed': len(lake_data),
                'storage_engine': 'PostgreSQL with JSONB',
                'global_stats': lake_stats,
                'company_stats': company_stats
            },
            'analytics': {
                'engine': 'DuckDB In-Memory Analytics',
                'emission_trends': trends,
                'threshold_status': threshold_check,
                'vehicle_efficiency': vehicle_efficiency
            },
            'ai_insights': {
                'model': 'Google Gemini 2.5 Pro',
                'risk_level': advice.get('risk_level'),
                'is_compliant': advice.get('is_compliant'),
                'trend_analysis': advice.get('trend_analysis'),
                'potential_fine_eur': advice.get('potential_fine_eur'),
                'suggestions': advice.get('suggestions', []),
                'green_credits_info': advice.get('green_credits_info'),
                'financing_benefits': advice.get('financing_benefits'),
                'user_prompt': advice.get('user_prompt')
            }
        })
    
    @action(detail=False, methods=['post'])
    def calculate_plantation_offset(self, request):
        company_id = request.data.get('company_id')
        plantation_info = request.data.get('plantation', {})
        
        if not company_id:
            return Response(
                {'error': 'company_id required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        trips = DeliveryTrip.objects.filter(company=company)
        total_emissions = sum(float(t.emissions_kg_co2) for t in trips)
        
        emission_data = {
            'total_emissions_kg': total_emissions,
            'company_name': company.name
        }
        
        advisor = CarbonComplianceAdvisor(api_key=settings.GEMINI_API_KEY)
        offset_result = advisor.calculate_plantation_offset(
            emission_data, 
            plantation_info
        )
        
        if not offset_result['success']:
            return Response(
                {'error': offset_result['error']}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'success': True,
            'company': company.name,
            'emission_data': emission_data,
            'plantation_info': plantation_info,
            'offset_calculation': offset_result['offset_calculation']
        })
    
    @action(detail=False, methods=['get'])
    def data_lake_stats(self, request):
        """View overall data lake statistics"""
        data_lake = CarbonDataLake()
        stats = data_lake.get_storage_stats()
        
        return Response({
            'success': True,
            'data_lake_statistics': stats,
            'timestamp': timezone.now().isoformat()
        })
    
    @action(detail=False, methods=['post'])
    def user_confirm_action(self, request):
        company_id = request.data.get('company_id')
        action = request.data.get('action')
        confirmed = request.data.get('confirmed', False)
        
        if not all([company_id, action]):
            return Response(
                {'error': 'company_id and action are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if confirmed:
            message = f"User confirmed action: {action}"
            company = Company.objects.get(id=company_id)
            ComplianceAlert.objects.create(
                company=company,
                alert_type='ESG_SCORE',
                severity='LOW',
                message=message,
                details={
                    'action': action,
                    'status': 'approved',
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            return Response({
                'success': True,
                'message': 'Action confirmed and queued for execution',
                'action': action,
                'status': 'approved'
            })
        else:
            return Response({
                'success': True,
                'message': 'Action declined by user',
                'action': action,
                'status': 'declined'
            })
