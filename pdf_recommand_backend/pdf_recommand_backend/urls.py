# pdf_recommendation/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('pdfapp.urls')),
    path('api/recommend/', include('recommend.urls')),
    path('api/search/', include('search.urls')),
    path('api/flower/', include('flower.urls')),
    path('api/viton/', include('viton.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)