from django.urls import path
from .views import upload_image, classify

urlpatterns = [
    path('upload/', upload_image), # ✅ ADD THIS
    path('classification/', classify), # ✅ ADD THIS
]