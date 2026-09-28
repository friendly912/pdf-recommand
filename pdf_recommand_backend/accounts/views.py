# accounts/views.py
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')

        if username and password:
            user = User.objects.create_user(username=username, password=password)
            user.save()
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            })
        else:
            return Response({"message": "Invalid credentials"}, status=400)
    return Response({"message": "Missing username or password"}, status=400)