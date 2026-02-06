from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView,
    send_otp, verify_otp,
    password_reset_request, password_reset_confirm,
    logout
)

urlpatterns = [
    # JWT Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout, name='logout'),
    
    # OTP Authentication
    path('otp/send/', send_otp, name='send_otp'),
    path('otp/verify/', verify_otp, name='verify_otp'),
    
    # Password Reset
    path('password-reset/', password_reset_request, name='password_reset'),
    path('password-reset/confirm/', password_reset_confirm, name='password_reset_confirm'),
]
