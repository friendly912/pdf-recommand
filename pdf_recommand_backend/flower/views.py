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
from django.core.files.storage import FileSystemStorage
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Upload image
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def upload_image(request):
    file = request.FILES['file']

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    fs = FileSystemStorage(location=settings.MEDIA_ROOT)
    filename = fs.save(file.name, file)

    MODEL_PATH = os.path.join(settings.BASE_DIR, "media", "flower_mobilenet_107.h5")
    # model_url = fs.url("flowers.h5")
    model = load_model(MODEL_PATH)

    class_names = [
        "pink primrose",                  #1
        "hard-leaved pocket orchid",      #2
        "canterbury bells",               #3
        "sweet pea",                      #4
        "english marigold",               #5
        "tiger lily",                     #6
        "moon orchid",                    #7
        "bird of paradise",               #8
        "monkshood",                      #9
        "globe thistle",                  #10
        "snapdragon",                     #11
        "colt's foot",                    #12
        "king protea",                    #13
        "spear thistle",                  #14
        "yellow iris",                    #15
        "globe-flower",                   #16
        "purple coneflower",              #17
        "peruvian lily",                  #18
        "balloon flower",                 #19
        "giant white arum lily",          #20
        "fire lily",                      #21
        "pincushion flower",              #22
        "fritillary",                     #23
        "red ginger",                     #24
        "grape hyacinth",                 #25
        "corn poppy",                     #26
        "prince of wales feathers",       #27
        "stemless gentian",               #28
        "artichoke",                      #29
        "sweet william",                  #30
        "carnation",                      #31
        "garden phlox",                   #32
        "love in the mist",               #33
        "mexican aster",                  #34
        "alpine sea holly",               #35
        "ruby-lipped cattleya",           #36
        "cape flower",                    #37
        "great masterwort",               #38
        "siam tulip",                     #39
        "lenten rose",                    #40
        "barbeton daisy",                 #41
        "daffodil",                       #42
        "sword lily",                     #43
        "poinsettia",                     #44
        "bolero deep blue",               #45
        "wallflower",                     #46
        "marigold",                       #47
        "buttercup",                      #48
        "oxeye daisy",                    #49
        "common dandelion",               #50
        "petunia",                        #51
        "wild pansy",                     #52
        "primula",                        #53
        "sunflower",                      #54
        "pelargonium",                    #55
        "bishop of llandaff",             #56
        "gaura",                          #57
        "geranium",                       #58
        "orange dahlia",                  #59
        "pink-yellow dahlia",             #60
        "cautleya spicata",               #61
        "japanese anemone",               #62
        "black-eyed susan",               #63
        "silverbush",                     #64
        "californian poppy",              #65
        "osteospermum",                   #66
        "spring crocus",                  #67
        "bearded iris",                   #68
        "windflower",                     #69
        "tree poppy",                     #70
        "gazania",                        #71
        "azalea",                         #72
        "water lily",                     #73
        "rose",                           #74
        "thorn apple",                    #75
        "morning glory",                  #76
        "passion flower",                 #77
        "lotus",                          #78
        "toad lily",                      #79
        "anthurium",                      #80
        "frangipani",                     #81
        "clematis",                       #82
        "hibiscus",                       #83
        "columbine",                      #84
        "desert-rose",                    #85
        "tree mallow",                    #86
        "magnolia",                       #87
        "cyclamen",                       #88
        "watercress",                     #89
        "canna lily",                     #90
        "hippeastrum",                    #91
        "bee balm",                       #92
        "ball moss",                      #93   
        "foxglove",                       #94
        "bougainvillea",                  #95
        "camellia",                       #96
        "mallow",                         #97
        "mexican petunia",                #98
        "bromelia",                       #99
        "blanket flower",                 #100
        "trumpet creeper",                #101
        "blackberry lily",                #102
        "Aloe",                           #103
        "Tulip",                          #104
        "Zinnia",                         #105
        "Begonia",                        #106
        "Cosmos"                          #107
    ]

    # Load image
    file_url = os.path.join(settings.BASE_DIR, "media", filename)
    img = image.load_img(file_url, target_size=IMG_SIZE)
    
    # Convert to array
    img_array = image.img_to_array(img)
    
    # Normalize (IMPORTANT)
    img_array = img_array / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    predictions = model.predict(img_array)
    
    # Get class index
    predicted_index = np.argmax(predictions[0])
    confidence = np.max(predictions[0])

    label = class_names[predicted_index]

    print("Model output index:", predicted_index)
    print("With +1:", predicted_index + 1)
    print("With -1:", predicted_index - 1)

    try:
        return Response({
            "class_name": label,
            "confidence": confidence
        })

    except Exception as e:
        return Response({
            "error": str(e)
        })

IMG_SIZE = (224, 224)

# classify
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def classify(request):
   

    return Response(serializer.data)
    # return Response([])
