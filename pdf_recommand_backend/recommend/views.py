from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.conf import settings
import os
import fitz
from .utils import find_similar_pdfs, preprocess_text, calculate_tfidf, compute_cosine_similarity
from pdfapp.models import PDF
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from django.core.serializers import serialize
import numpy as np
from django.http import JsonResponse
from pdfapp.serializers import PDFSerializer
import json

# Upload PDF
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def upload_pdf(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        doc = fitz.open(stream=file.read(), filetype="pdf")

        text = ""
        for page in doc:
            text += page.get_text()
        
        if not text.strip():
            return Response({"error": "No text found in PDF"})

        text = text[:5000]

        model_name = "sshleifer/distilbart-cnn-12-6"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

        # Tokenize the input text
        inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)

        # Generate the summary (using the model's generate method)
        result = model.generate(
            inputs['input_ids'],  # Input text
            max_length=250,       # Increase max length for longer summary
            min_length=100,       # Ensure the summary is at least 100 tokens long
            num_beams=6,          # Use more beams for better quality
            length_penalty=0.8,   # Encourage a longer summary (less penalization for length)
            early_stopping=True   # Stop when the model deems the summary is finished
        )

        summary = tokenizer.decode(result[0], skip_special_tokens=True)

        return Response({
            "summary": summary
        })

    except Exception as e:
        return Response({
            "error": str(e)
        })

# calculate similarity
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def calculate_similarity(request):

    data = json.loads(request.body)
    query = data.get('query')
 
    processed_uploaded_text = preprocess_text(query)
    print(processed_uploaded_text)
    pdfs = PDF.objects.all()
    serializers = PDFSerializer(pdfs, many=True)
    contents = [doc['content'] for doc in serializers.data]
    print(contents)

    corpus = [processed_uploaded_text]  # Add the uploaded PDF's processed text

    for doc in pdfs:
        corpus.append(doc.content)  # Assuming summarized_text contains preprocessed text

    print(len(corpus))

    # Step 4: Calculate TF-IDF for all documents (uploaded + existing PDFs)
    tfidf_matrix = calculate_tfidf(corpus)

    # Step 5: Compute the cosine similarity between the uploaded PDF and the existing PDFs
    similarity_matrix = compute_cosine_similarity(tfidf_matrix)

    # The first row of the similarity matrix corresponds to the uploaded PDF
    similarities = similarity_matrix[0][1:]  # Exclude similarity with itself

    # Get the indices of the top 5 most similar PDFs
    similar_pdf_indices = np.argsort(similarities)[::-1][:5]

    # Retrieve the corresponding PDF documents based on the sorted indices
    similar_pdfs = []
    for i in similar_pdf_indices:
        pdf = {
            'name': pdfs[int(i)],
            'similarity_rate': round(similarities[int(i)] * 100, 2),  # Convert similarity to percentage
            'file': '',
            'content': contents[int(i)],
            'size': 0,
        }
        similar_pdfs.append(pdf)

    # Step 7: Serialize the data and return the response
    serializer = PDFSerializer(similar_pdfs, many=True)  # Use your serializer here

    return Response(serializer.data)
    # return Response([])
