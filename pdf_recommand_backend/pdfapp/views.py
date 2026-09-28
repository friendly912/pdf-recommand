from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.conf import settings
from .models import PDF
from .serializers import PDFSerializer
import os
from .utils import extract_text, summarize_text, summarize_text_ollama
from django.http import FileResponse, Http404

def home(request):
    return HttpResponse("PDF App is working")
    
# Get PDFs for logged-in user
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_pdfs(request):
    pdfs = PDF.objects.order_by('-created_at')
    serializer = PDFSerializer(pdfs, many=True)
    return Response(serializer.data)


# Upload PDF
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def upload_pdf(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)


    pdf = PDF.objects.create(
        name=file.name,
        file=file,
        size=file.size
    )

    try:
        # ✅ Step 2: Extract text
        text = extract_text(pdf.file.path)

        # ⚡ Optional: limit size (performance)
        text = text[:5000]

        # ✅ Step 3: Summarize
        summary = summarize_text(text)
        # summary = summarize_text_ollama(text)

        # ✅ Step 4: Save summary
        pdf.content = summary
        pdf.save()

    except Exception as e:
        pdf.content = "Summary failed"
        pdf.save()
        print(e)

    return Response({
        "message": "Uploaded",
        "id": pdf.id
    })

# ✅ DELETE
@api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
def delete_pdf(request, id):
    try:
        pdf = PDF.objects.get(id=id)
        pdf.delete()

        # ✅ delete physical 
        abs_path = os.path.join(settings.BASE_DIR, pdf.file.path)
        if pdf.file and os.path.isfile(abs_path):
            os.remove(abs_path)

        return Response({"message": "Deleted"})
    except PDF.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_pdf(request, id):
    try:
        pdf = PDF.objects.get(id=id)

        # ✅ delete physical 
        abs_path = os.path.join(settings.BASE_DIR, pdf.file.path)
        if pdf.file and os.path.isfile(abs_path):
            os.remove(abs_path)

        return Response({"message": "Deleted"})
    except PDF.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
