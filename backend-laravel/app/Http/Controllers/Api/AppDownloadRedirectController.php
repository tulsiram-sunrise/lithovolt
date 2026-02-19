<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AppDownloadRedirectController extends Controller
{
    /**
     * Smart download redirect endpoint that detects device type and redirects to appropriate store.
     * 
     * URL: /download/app/
     * 
     * Device Detection Logic:
     * - Android devices are redirected to Google Play Store
     * - iOS devices (iPhone/iPad) are redirected to Apple App Store
     * - All other devices (desktop/unknown) are redirected to a fallback landing page
     * 
     * Configuration (via .env):
     * - ANDROID_APP_URL: URL to Google Play Store or equivalent
     * - IOS_APP_URL: URL to Apple App Store or equivalent
     * - WEB_LANDING_URL: Fallback URL for web/desktop users
     */

    /**
     * Handle GET request and redirect based on device type.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect(Request $request)
    {
        // Extract user agent from request headers
        $userAgent = strtolower($request->header('User-Agent', ''));
        
        // Get timestamp for logging
        $timestamp = now()->toIso8601String();
        
        // Detect device type and determine redirect URL
        $deviceType = $this->detectDeviceType($userAgent);
        $redirectUrl = $this->getRedirectUrl($deviceType);
        
        // Log the device detection and access
        Log::info(
            "Download redirect - Device: {$deviceType} | " .
            "URL: {$redirectUrl} | " .
            "Timestamp: {$timestamp} | " .
            "User-Agent: {$userAgent}"
        );
        
        // Return redirect response
        return redirect($redirectUrl);
    }

    /**
     * Detect device type from user agent string.
     *
     * @param string $userAgent HTTP User-Agent header value (lowercase)
     * @return string One of 'android', 'ios', or 'web'
     */
    private function detectDeviceType(string $userAgent): string
    {
        // Check for Android
        if (strpos($userAgent, 'android') !== false) {
            return 'android';
        }
        
        // Check for iOS (iPhone or iPad)
        if (strpos($userAgent, 'iphone') !== false || strpos($userAgent, 'ipad') !== false) {
            return 'ios';
        }
        
        // Default to web for all other cases (desktop, unknown, etc.)
        return 'web';
    }

    /**
     * Get the redirect URL based on device type from configuration.
     *
     * @param string $deviceType Device type ('android', 'ios', or 'web')
     * @return string Appropriate redirect URL from config
     */
    private function getRedirectUrl(string $deviceType): string
    {
        switch ($deviceType) {
            case 'android':
                return config(
                    'app.android_app_url',
                    'https://play.google.com/store/apps/details?id=au.com.lithovolt'
                );
            
            case 'ios':
                return config(
                    'app.ios_app_url',
                    'https://apps.apple.com/app/lithovolt/id1234567890'
                );
            
            default:  // web
                return config(
                    'app.web_landing_url',
                    'https://www.lithovolt.com.au'
                );
        }
    }
}
