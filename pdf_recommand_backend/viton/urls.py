from django.urls import path
from .views import upload_person, upload_cloth, apply_viton

urlpatterns = [
    path('upload_person/', upload_person),
    path('upload_cloth/', upload_cloth),
    path('apply_viton/', apply_viton),
]