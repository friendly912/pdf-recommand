from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.conf import settings
from pdfapp.models import PDF
from pdfapp.serializers import PDFSerializer
import os
import json
from .utils import extract_text, summarize_text
from django.http import FileResponse, Http404
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

# Get PDFs for logged-in user
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_list(request):
    pdfs = PDF.objects.order_by('-created_at')
    serializer = PDFSerializer(pdfs, many=True)
    return Response(serializer.data)
    

# Function to encode text into embeddings
def encode_text(text):
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.astype('float32')  # Ensure the embedding is in the correct format for FAISS


# Function to create the FAISS index for document embeddings
def create_faiss_index():
    documents = PDF.objects.all()
    # print(documents)

    # Generate embeddings for all documents
    document_embeddings = [encode_text(doc.content) for doc in documents]

    # Convert to NumPy array
    document_embeddings = np.array(document_embeddings).astype('float32')

    # Create a FAISS index with L2 distance
    index = faiss.IndexFlatL2(document_embeddings.shape[1])
    index.add(document_embeddings)

    return index, documents

# Get PDFs for logged-in user
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def get_result(request):
    data = json.loads(request.body)
    query = data.get('query')

    # Generate embedding for the search query
    query_embedding = encode_text(query).reshape(1, -1)

    # Create or load the FAISS index (this can be optimized by storing it persistently)
    index, documents = create_faiss_index()

    # Perform the search to get the most similar documents
    D, I = index.search(query_embedding, k=5)  # k=5 returns the top 5 most similar documents

    # Get the top 5 most relevant documents based on the indices from FAISS
    top_documents = [documents[int(i)] for i in I[0]]

    # Step 7: Serialize the data and return the response
    serializer = PDFSerializer(top_documents, many=True)  # Use your serializer here


    return Response(serializer.data)
