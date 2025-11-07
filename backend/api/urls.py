# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, VehicleViewSet, DeliveryTripViewSet,
    ComplianceDeadlineViewSet, ComplianceAlertViewSet,
    InvoiceUploadView, DashboardViewSet
)

router = DefaultRouter()
router.register('companies', CompanyViewSet)
router.register('vehicles', VehicleViewSet)
router.register('trips', DeliveryTripViewSet)
router.register('deadlines', ComplianceDeadlineViewSet)
router.register('alerts', ComplianceAlertViewSet)
router.register('invoices', InvoiceUploadView, basename='invoice')
router.register('dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]

