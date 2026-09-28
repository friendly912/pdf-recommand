from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import string
import nltk
from nltk.corpus import stopwords
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

nltk.download('stopwords')

def preprocess_text(text):
    # Convert text to lowercase
    text = text.lower()

    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))

    # Tokenize and remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = text.split()
    filtered_tokens = [word for word in tokens if word not in stop_words]

    return " ".join(filtered_tokens)

def calculate_tfidf(corpus):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)
    return tfidf_matrix

def compute_cosine_similarity(tfidf_matrix):
    similarity_matrix = cosine_similarity(tfidf_matrix)
    return similarity_matrix

def find_similar_pdfs(uploaded_pdf_embedding):
    # Get all stored embeddings from your database (you can use raw SQL or Django ORM)
    documents = PdfDocument.objects.all()

    similarities = []
    for doc in documents:
        # Compute cosine similarity
        similarity = cosine_similarity([uploaded_pdf_embedding], [np.array(doc.embedding)])
        similarities.append((doc, similarity))

    # Sort by similarity score
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Return top N similar PDFs
    top_similar_docs = [doc[0] for doc in similarities[:5]]
    return similarities
 