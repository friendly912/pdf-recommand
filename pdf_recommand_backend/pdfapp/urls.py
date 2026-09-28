from django.urls import path
from .views import home, upload_pdf, get_pdfs, delete_pdf
from django.conf.urls.static import static
from . import views
from django.conf import settings

urlpatterns = [
    path('', home),
    path('upload/', upload_pdf), # ✅ ADD THIS
    path('pdfs/', get_pdfs),     # ✅ ADD THIS
    path('delete/<int:id>/', delete_pdf),
]