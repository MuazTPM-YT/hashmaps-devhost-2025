from .models import EmissionDataLake, Company
from django.db.models import Sum, Count
from datetime import datetime

class CarbonDataLake:
    def upload_emission_data(self, company_id, data, source='API'):
        company = Company.objects.get(id=company_id)
        
        metadata = {
            'uploaded_at': datetime.now().isoformat(),
            'data_points': len(data),
            'source': source
        }
        
        lake_record = EmissionDataLake.objects.create(
            company=company,
            data_batch=data,
            record_count=len(data),
            source=source,
            batch_metadata=metadata
        )
        
        return lake_record.id
    
    def get_company_data(self, company_id):
        lake_records = EmissionDataLake.objects.filter(
            company_id=company_id
        ).order_by('-uploaded_at')
        
        all_data = []
        for record in lake_records:
            all_data.extend(record.data_batch)
        
        return all_data
    
    def get_storage_stats(self):
        stats = EmissionDataLake.objects.aggregate(
            total_batches=Count('id'),
            total_records=Sum('record_count')
        )
        
        companies_count = EmissionDataLake.objects.values('company').distinct().count()
        
        return {
            'total_batches': stats['total_batches'] or 0,
            'total_records': stats['total_records'] or 0,
            'companies_tracked': companies_count,
            'storage_type': 'PostgreSQL Data Lake',
            'database': 'Production PostgreSQL with JSONB'
        }
    
    def get_company_stats(self, company_id):
        stats = EmissionDataLake.objects.filter(
            company_id=company_id
        ).aggregate(
            total_batches=Count('id'),
            total_records=Sum('record_count')
        )
        
        latest_batch = EmissionDataLake.objects.filter(
            company_id=company_id
        ).order_by('-uploaded_at').first()
        
        return {
            'company_id': company_id,
            'batches_stored': stats['total_batches'] or 0,
            'total_records': stats['total_records'] or 0,
            'latest_upload': latest_batch.uploaded_at.isoformat() if latest_batch else None
        }
