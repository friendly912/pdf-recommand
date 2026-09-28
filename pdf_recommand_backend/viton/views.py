from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.conf import settings
import os
from .utils import process_infer
from django.core.serializers import serialize
import numpy as np
from django.http import JsonResponse
from pdfapp.serializers import PDFSerializer
import json
from django.core.files.storage import FileSystemStorage

# Upload person image
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def upload_person(request):
    file = request.FILES['file']

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    fs = FileSystemStorage(location=settings.MEDIA_ROOT)
    filename = fs.save(file.name, file)

    try:
        return Response({
            "person_path": filename
        })

    except Exception as e:
        return Response({
            "error": str(e)
        })


# Upload cloth image
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def upload_cloth(request):
    file = request.FILES['file']

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    fs = FileSystemStorage(location=settings.MEDIA_ROOT)
    filename = fs.save(file.name, file)

    try:
        return Response({
            "cloth_path": filename
        })

    except Exception as e:
        return Response({
            "error": str(e)
        })

IMG_SIZE = (224, 224)

# classify
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def apply_viton(request):

    person_image = os.path.join(settings.BASE_DIR, "media", "person.jpg")
    # mask_path = process_infer(person_image)

    return Response({
        # "mask_path": mask_path
    })
