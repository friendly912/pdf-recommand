from django.db import models
from django.contrib.auth.models import User

class PdfDocument(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='pdfs/')
    content = models.TextField()
    embedding = models.JSONField()  # Store the embedding as a list or numpy array

    def __str__(self):
        return self.name