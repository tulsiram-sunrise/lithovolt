<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\WholesalerInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    private function isUserEmailVerified(User $user): bool
    {
        return (bool) $user->is_verified || !is_null($user->email_verified_at);
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users',
            'invitation' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $consumerRole = Role::where('name', 'CONSUMER')->first();
            if (!$consumerRole) {
                return response()->json([
                    'error' => 'Default consumer role is not configured.'
                ], 500);
            }

            $invitation = null;
            $isInvitedRegistration = false;

            if ($request->filled('invitation')) {
                $invitation = WholesalerInvitation::where('invitation_token', (string) $request->invitation)->first();

                if (!$invitation || !$invitation->isValid()) {
                    return response()->json([
                        'error' => 'Invalid or expired invitation link.'
                    ], 422);
                }

                if (strtolower((string) $invitation->email) !== strtolower((string) $request->email)) {
                    return response()->json([
                        'error' => 'Invitation email does not match registration email.'
                    ], 422);
                }

                $isInvitedRegistration = true;
            }

            $verificationToken = $isInvitedRegistration ? null : \Illuminate\Support\Str::random(64);

            $roleId = $consumerRole->id;
            if ($isInvitedRegistration) {
                $wholesalerRole = Role::where('name', 'WHOLESALER')->first();
                if (!$wholesalerRole) {
                    return response()->json([
                        'error' => 'WHOLESALER role is not configured.'
                    ], 500);
                }
                $roleId = $wholesalerRole->id;
            }

            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'role_id' => $roleId,
                'is_verified' => $isInvitedRegistration,
                'email_verified_at' => $isInvitedRegistration ? now() : null,
                'is_active' => true,
                'verification_code' => $verificationToken,
            ]);

            if ($isInvitedRegistration && $invitation) {
                $invitation->update([
                    'accepted_at' => now(),
                ]);

                return response()->json([
                    'message' => 'Registration successful. Your invitation has been accepted and you can now log in.',
                ], 201);
            }

            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
            $verificationLink = $frontendUrl . '/verify-email?token=' . urlencode($verificationToken);

            try {
                Mail::raw(
                    "Welcome to Lithovolt.\n\n" .
                    "Please verify your email by clicking the link below:\n" .
                    $verificationLink . "\n\n" .
                    "If you did not create this account, you can ignore this message.",
                    function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('Verify your Lithovolt email');
                    }
                );
            } catch (\Throwable $mailError) {
                if (config('app.debug')) {
                    return response()->json([
                        'message' => 'Registration successful. Email failed in debug mode; use verification link manually.',
                        'verification_link' => $verificationLink,
                        'mail_error' => $mailError->getMessage(),
                    ], 201);
                }

                return response()->json([
                    'error' => 'Registration successful but verification email could not be sent.'
                ], 500);
            }

            return response()->json([
                'message' => 'Registration successful. Please verify your email before logging in.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Registration failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify email from verification link token.
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        $user = User::where('verification_code', $request->token)->first();

        if (!$user) {
            return response()->json([
                'error' => 'Invalid or expired verification link.'
            ], 400);
        }

        $user->update([
            'is_verified' => true,
            'email_verified_at' => now(),
            'verification_code' => null,
        ]);

        return response()->json([
            'message' => 'Email verified successfully. You can now login.'
        ]);
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

            if (!$user->is_active) {
                return response()->json([
                    'error' => 'Your account is inactive. Please contact support.'
                ], 403);
            }

            if (!$this->isUserEmailVerified($user)) {
                return response()->json([
                    'error' => 'Email verification required before login.'
                ], 403);
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
                    'email_verified_at' => $user->email_verified_at,
                    'is_active' => $user->is_active,
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
                    'email_verified_at' => $user->email_verified_at,
                    'is_active' => $user->is_active,
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
                'address' => $user->address,
                'city' => $user->city,
                'state' => $user->state,
                'postal_code' => $user->postal_code,
                'is_verified' => $user->is_verified,
                'email_verified_at' => $user->email_verified_at,
                'is_active' => $user->is_active,
                'role' => $user->role,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve profile'
            ], 401);
        }
    }

    /**
     * Update authenticated user profile
     */
    public function updateProfile(Request $request)
    {
        $user = auth('jwt')->user();
        /** @var User $user */

        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user->update([
                'first_name' => $request->input('first_name', $user->first_name),
                'last_name' => $request->input('last_name', $user->last_name),
                'phone' => $request->input('phone', $user->phone),
                'address' => $request->input('address', $user->address),
                'city' => $request->input('city', $user->city),
                'state' => $request->input('state', $user->state),
                'postal_code' => $request->input('postal_code', $user->postal_code),
            ]);

            $user = $user->fresh();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'city' => $user->city,
                    'state' => $user->state,
                    'postal_code' => $user->postal_code,
                    'is_verified' => $user->is_verified,
                    'email_verified_at' => $user->email_verified_at,
                    'is_active' => $user->is_active,
                    'role' => $user->role,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update profile',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change authenticated user password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors(),
            ], 422);
        }

        try {
            $user = auth('jwt')->user();
            /** @var User $user */

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'error' => 'Current password is incorrect'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'message' => 'Password changed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to change password',
                'message' => $e->getMessage(),
            ], 500);
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
            $user->update([
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);

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
                    'email_verified_at' => $user->email_verified_at,
                    'is_active' => $user->is_active,
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

            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
            $resetLink = $frontendUrl . '/reset-password?token=' . urlencode($resetToken) . '&email=' . urlencode($user->email);

            try {
                Mail::raw(
                    "We received a request to reset your Lithovolt password.\n\n" .
                    "Use this link to set a new password:\n" .
                    $resetLink . "\n\n" .
                    "Or enter this reset token manually:\n" .
                    $resetToken . "\n\n" .
                    "This link expires in 1 hour. If you did not request this change, you can ignore this email.",
                    function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('Lithovolt Password Reset');
                    }
                );
            } catch (\Throwable $mailError) {
                if (config('app.debug')) {
                    return response()->json([
                        'message' => 'Password reset email failed to send in debug mode. Use returned token/link for local testing.',
                        'reset_token' => $resetToken,
                        'reset_link' => $resetLink,
                        'mail_error' => $mailError->getMessage(),
                    ]);
                }

                return response()->json([
                    'error' => 'Unable to send password reset email at this time.'
                ], 500);
            }

            return response()->json([
                'message' => 'Password reset link sent to email'
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
