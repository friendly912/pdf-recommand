from django.urls import path
from .views import get_list, get_result
from django.conf.urls.static import static
from . import views
from django.conf import settings

urlpatterns = [
    path('list/', get_list),
    path('result/', get_result),
]