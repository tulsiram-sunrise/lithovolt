<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone' => $request->phone,
                'is_verified' => false,
                'role' => 'customer', // Default role
            ]);

            // Generate JWT tokens
            $access_token = JWTAuth::fromUser($user);
            $refresh_token = JWTAuth::fromUser($user, ['exp' => now()->addDays(30)->timestamp]);

            return response()->json([
                'access' => $access_token,
                'refresh' => $refresh_token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'is_verified' => $user->is_verified,
                    'role' => $user->role,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Registration failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user with email and password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'error' => 'Invalid credentials'
                ], 401);
            }

            // Generate JWT tokens
            $access_token = JWTAuth::fromUser($user);
            $refresh_token = JWTAuth::fromUser($user, ['exp' => now()->addDays(30)->timestamp]);

            return response()->json([
                'access' => $access_token,
                'refresh' => $refresh_token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'is_verified' => $user->is_verified,
                    'role' => $user->role,
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Could not create token',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user (invalidate token)
     */
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Failed to logout'
            ], 500);
        }
    }

    /**
     * Refresh JWT token
     */
    public function refresh(Request $request)
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            $user = JWTAuth::setToken($newToken)->toUser();

            $refresh_token = JWTAuth::fromUser($user, ['exp' => now()->addDays(30)->timestamp]);

            return response()->json([
                'access' => $newToken,
                'refresh' => $refresh_token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'is_verified' => $user->is_verified,
                    'role' => $user->role,
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Token refresh failed'
            ], 401);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        try {
            $user = auth('jwt')->user();

            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone' => $user->phone,
                'is_verified' => $user->is_verified,
                'role' => $user->role,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve profile'
            ], 401);
        }
    }

    /**
     * Send OTP to user's phone
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('phone', $request->phone)->first();

            if (!$user) {
                return response()->json([
                    'error' => 'Phone number not found'
                ], 404);
            }

            // Generate OTP (6 digits)
            $otp = rand(100000, 999999);

            // Store OTP in session/cache (in production, use database or cache)
            \Illuminate\Support\Facades\Cache::put('otp_' . $request->phone, $otp, now()->addMinutes(10));

            // Send OTP to phone (implement actual SMS sending)
            // For now, just return success (in production, integrate with SMS service)

            return response()->json([
                'message' => 'OTP sent successfully',
                'otp' => $otp  // Remove in production - only for testing
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send OTP',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $storedOtp = \Illuminate\Support\Facades\Cache::get('otp_' . $request->phone);

            if (!$storedOtp || $storedOtp != $request->otp) {
                return response()->json([
                    'error' => 'Invalid or expired OTP'
                ], 401);
            }

            $user = User::where('phone', $request->phone)->first();

            if (!$user) {
                return response()->json([
                    'error' => 'User not found'
                ], 404);
            }

            // Mark user as verified
            $user->update(['is_verified' => true]);

            // Clear OTP from cache
            \Illuminate\Support\Facades\Cache::forget('otp_' . $request->phone);

            // Generate JWT tokens
            $access_token = JWTAuth::fromUser($user);
            $refresh_token = JWTAuth::fromUser($user, ['exp' => now()->addDays(30)->timestamp]);

            return response()->json([
                'message' => 'OTP verified successfully',
                'access' => $access_token,
                'refresh' => $refresh_token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'is_verified' => $user->is_verified,
                    'role' => $user->role,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'OTP verification failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request password reset
     */
    public function passwordResetRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'error' => 'Email not found'
                ], 404);
            }

            // Generate password reset token
            $resetToken = \Illuminate\Support\Str::random(60);

            // Store in cache (in production, use database)
            \Illuminate\Support\Facades\Cache::put('password_reset_' . $resetToken, [
                'user_id' => $user->id,
                'email' => $user->email
            ], now()->addHours(1));

            // Send email with reset token (implement actual email sending)
            // For now, just return token (in production, send via email)

            return response()->json([
                'message' => 'Password reset token sent to email',
                'reset_token' => $resetToken  // Remove in production
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process password reset request',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm password reset
     */
    public function passwordResetConfirm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reset_token' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $resetData = \Illuminate\Support\Facades\Cache::get('password_reset_' . $request->reset_token);

            if (!$resetData) {
                return response()->json([
                    'error' => 'Invalid or expired reset token'
                ], 401);
            }

            $user = User::find($resetData['user_id']);

            if (!$user) {
                return response()->json([
                    'error' => 'User not found'
                ], 404);
            }

            // Update password
            $user->update(['password' => Hash::make($request->password)]);

            // Clear reset token from cache
            \Illuminate\Support\Facades\Cache::forget('password_reset_' . $request->reset_token);

            return response()->json([
                'message' => 'Password reset successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Password reset failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
