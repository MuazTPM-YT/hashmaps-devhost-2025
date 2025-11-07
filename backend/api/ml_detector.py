from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd
from decimal import Decimal
from .models import DeliveryTrip, ComplianceAlert, Company, ComplianceDeadline
from datetime import timedelta
from django.utils import timezone

class EmissionAnomalyDetector:
    def __init__(self, contamination=0.1, threshold_percentage=20):
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
            max_samples='auto',
            bootstrap=True
        )
        self.scaler = StandardScaler()
        self.threshold_percentage = threshold_percentage
        self.fitted = False
    
    def prepare_features(self, trips_queryset):
        if trips_queryset.count() < 10:
            return None, None
        
        df = pd.DataFrame(list(trips_queryset.values(
            'id',
            'distance_km',
            'weight_tonnes',
            'emissions_kg_co2',
            'vehicle__vehicle_type'
        )))
        
        df['distance_km'] = df['distance_km'].astype(float)
        df['weight_tonnes'] = df['weight_tonnes'].astype(float)
        df['emissions_kg_co2'] = df['emissions_kg_co2'].astype(float)
        
        df['emissions_per_km'] = df['emissions_kg_co2'] / df['distance_km']
        df['emissions_per_tonne_km'] = df['emissions_kg_co2'] / (df['distance_km'] * df['weight_tonnes'].replace(0, 1))
        df['weight_per_km'] = df['weight_tonnes'] / df['distance_km']
        
        vehicle_dummies = pd.get_dummies(df['vehicle__vehicle_type'], prefix='vehicle')
        features = pd.concat([
            df[['distance_km', 'weight_tonnes', 'emissions_per_km', 'emissions_per_tonne_km']],
            vehicle_dummies
        ], axis=1)
        
        return df, features
    
    def train_and_detect(self, company_id):
        trips = DeliveryTrip.objects.filter(company_id=company_id).select_related('vehicle')
        df, features = self.prepare_features(trips)
        
        if df is None:
            return {
                'success': False,
                'message': 'Insufficient data (minimum 10 trips required)',
                'anomalies': []
            }
        
        avg_emissions = float(df['emissions_kg_co2'].mean())
        std_emissions = float(df['emissions_kg_co2'].std())
        threshold = avg_emissions * (1 + self.threshold_percentage / 100)
        features_scaled = self.scaler.fit_transform(features)
        predictions = self.model.fit_predict(features_scaled)
        anomaly_scores = self.model.score_samples(features_scaled)
        anomalies = []
        anomaly_count = 0
        
        for idx in range(len(df)):
            trip_id = int(df.iloc[idx]['id'])
            emissions = float(df.iloc[idx]['emissions_kg_co2'])
            ml_anomaly = predictions[idx] == -1
            threshold_anomaly = emissions > threshold
            is_anomaly = ml_anomaly or threshold_anomaly
            
            if is_anomaly:
                anomaly_count += 1
                percentage_above = ((emissions - avg_emissions) / avg_emissions) * 100
                
                DeliveryTrip.objects.filter(id=trip_id).update(
                    is_anomaly=True,
                    anomaly_score=float(anomaly_scores[idx])
                )
                
                anomalies.append({
                    'trip_id': trip_id,
                    'emissions_kg': round(emissions, 3),
                    'average_kg': round(avg_emissions, 3),
                    'percentage_above_avg': round(percentage_above, 2),
                    'ml_detected': ml_anomaly,
                    'threshold_exceeded': threshold_anomaly,
                    'anomaly_score': round(float(anomaly_scores[idx]), 3)
                })
        
        if anomaly_count > 0:
            from .models import Company
            company = Company.objects.get(id=company_id)
            
            ComplianceAlert.objects.create(
                company=company,
                alert_type='ANOMALY',
                severity='HIGH' if anomaly_count > 5 else 'MEDIUM',
                message=f"Detected {anomaly_count} anomalous delivery trips with emissions >20% above average",
                details={
                    'anomaly_count': anomaly_count,
                    'average_emissions': round(avg_emissions, 3),
                    'threshold': round(threshold, 3),
                    'trip_ids': [a['trip_id'] for a in anomalies[:10]]
                }
            )
        
        self.fitted = True
        return {
            'success': True,
            'total_trips': len(df),
            'anomaly_count': anomaly_count,
            'anomaly_percentage': round((anomaly_count / len(df)) * 100, 2),
            'average_emissions': round(avg_emissions, 3),
            'std_emissions': round(std_emissions, 3),
            'threshold_kg': round(threshold, 3),
            'anomalies': anomalies[:20]  # Return top 20
        }

def check_compliance_deadlines(company_id=None):
    today = timezone.now().date()
    upcoming_deadlines = ComplianceDeadline.objects.filter(
        deadline_date__gte=today,
        deadline_date__lte=today + timedelta(days=60)
    )
    
    if company_id:
        companies = Company.objects.filter(id=company_id)
    else:
        companies = Company.objects.all()
    
    alerts_created = []
    
    for company in companies:
        for deadline in upcoming_deadlines:
            days_until = (deadline.deadline_date - today).days
            
            if 30 <= days_until <= 60:
                existing_alert = ComplianceAlert.objects.filter(
                    company=company,
                    alert_type='DEADLINE',
                    message__contains=deadline.name,
                    triggered_at__gte=timezone.now() - timedelta(days=7)
                ).exists()
                
                if not existing_alert:
                    alert = ComplianceAlert.objects.create(
                        company=company,
                        alert_type='DEADLINE',
                        severity='HIGH' if days_until <= 45 else 'MEDIUM',
                        message=f"CSRD deadline '{deadline.name}' approaching in {days_until} days",
                        details={
                            'deadline_name': deadline.name,
                            'deadline_date': str(deadline.deadline_date),
                            'days_until': days_until,
                            'regulation': deadline.regulation
                        }
                    )
                    alerts_created.append(alert)
    
    return {
        'success': True,
        'alerts_created': len(alerts_created),
        'upcoming_deadlines': upcoming_deadlines.count()
    }

