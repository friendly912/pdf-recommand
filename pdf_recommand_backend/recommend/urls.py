from django.urls import path
from .views import upload_pdf, calculate_similarity

urlpatterns = [
    path('upload/', upload_pdf), # ✅ ADD THIS
    path('similarity/', calculate_similarity), # ✅ ADD THIS
]