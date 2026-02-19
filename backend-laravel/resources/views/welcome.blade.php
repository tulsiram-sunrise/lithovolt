<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LithoVolt API - Welcome</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 900px;
            width: 100%;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
        }

        .logo {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 15px;
            letter-spacing: 2px;
        }

        .tagline {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .status {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
        }

        .status.online {
            background: rgba(76, 175, 80, 0.3);
            color: #4caf50;
        }

        .content {
            padding: 60px 40px;
        }

        .section {
            margin-bottom: 50px;
        }

        .section-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .icon {
            font-size: 28px;
        }

        .endpoints-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .endpoint-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .endpoint-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .method {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 10px;
            color: white;
        }

        .method.post {
            background: #667eea;
        }

        .method.get {
            background: #4caf50;
        }

        .endpoint-path {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #666;
            margin: 10px 0;
            word-break: break-all;
        }

        .description {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }

        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .info-box p {
            color: #1976d2;
            font-size: 14px;
            line-height: 1.6;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #eee;
        }

        .footer p {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .footer-links a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }

        .footer-links a:hover {
            color: #764ba2;
        }

        .version {
            font-size: 13px;
            color: #999;
            margin-top: 15px;
        }

        @media (max-width: 600px) {
            .header {
                padding: 40px 20px;
            }

            .logo {
                font-size: 36px;
            }

            .content {
                padding: 40px 20px;
            }

            .footer {
                padding: 20px;
            }

            .endpoints-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⚡ LithoVolt API</div>
            <div class="tagline">Battery Management System</div>
            <div class="status online">🟢 API Server Running</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">👋</span>
                    Welcome
                </div>
                <div class="info-box">
                    <p>
                        Welcome to the LithoVolt API Backend! This RESTful API provides comprehensive endpoints for managing lithium battery inventory, orders, warranties, and user accounts. The API uses JWT authentication for secure access to protected resources.
                    </p>
                </div>
            </div>

            <!-- Authentication Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">🔐</span>
                    Authentication Endpoints
                </div>
                <div class="endpoints-grid">
                    <div class="endpoint-card">
                        <div>
                            <span class="method post">POST</span>
                        </div>
                        <div class="endpoint-path">/api/auth/login/</div>
                        <div class="description">Authenticate user with email and password to receive JWT tokens.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method post">POST</span>
                        </div>
                        <div class="endpoint-path">/api/auth/register/</div>
                        <div class="description">Register a new user account with email, password, and phone.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/auth/profile/</div>
                        <div class="description">Retrieve the authenticated user's profile information.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method post">POST</span>
                        </div>
                        <div class="endpoint-path">/api/auth/refresh/</div>
                        <div class="description">Refresh an expired access token using the refresh token.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method post">POST</span>
                        </div>
                        <div class="endpoint-path">/api/auth/logout/</div>
                        <div class="description">Invalidate the current JWT token and logout the user.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method post">POST</span>
                        </div>
                        <div class="endpoint-path">/api/auth/otp/send/</div>
                        <div class="description">Send an OTP code to the user's phone number.</div>
                    </div>
                </div>
            </div>

            <!-- Inventory Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">📦</span>
                    Inventory Management
                </div>
                <div class="endpoints-grid">
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/inventory/models/</div>
                        <div class="description">List all available battery models.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/inventory/serials/</div>
                        <div class="description">Manage battery serial numbers and allocation.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/inventory/accessories/</div>
                        <div class="description">View available battery accessories and components.</div>
                    </div>
                </div>
            </div>

            <!-- Business Endpoints Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">💼</span>
                    Business Operations
                </div>
                <div class="endpoints-grid">
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/orders/</div>
                        <div class="description">Manage customer orders and order details.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/warranties/</div>
                        <div class="description">Handle warranty registration and verification.</div>
                    </div>
                    <div class="endpoint-card">
                        <div>
                            <span class="method get">GET</span>
                        </div>
                        <div class="endpoint-path">/api/warranty-claims/</div>
                        <div class="description">Process warranty claims and manage claim status.</div>
                    </div>
                </div>
            </div>

            <!-- Getting Started Section -->
            <div class="section">
                <div class="section-title">
                    <span class="icon">🚀</span>
                    Getting Started
                </div>
                <div class="info-box">
                    <p style="margin-bottom: 10px;">
                        <strong>1. Authentication:</strong> Send a POST request to <code>/api/auth/login/</code> with your email and password to receive JWT tokens (access and refresh).
                    </p>
                    <p style="margin-bottom: 10px;">
                        <strong>2. Authorization:</strong> Include the access token in the Authorization header: <code>Authorization: Bearer YOUR_TOKEN</code>
                    </p>
                    <p style="margin-bottom: 10px;">
                        <strong>3. Headers:</strong> Always include <code>Accept: application/json</code> header with your requests.
                    </p>
                    <p>
                        <strong>4. Token Refresh:</strong> When your access token expires, use the refresh token to obtain a new one from <code>/api/auth/refresh/</code>.
                    </p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>LithoVolt Backend API</strong> - Powered by Laravel</p>
            <div class="footer-links">
                <a href="/download/app">Download App</a>
                <a href="mailto:support@lithovolt.com">Support</a>
                <a href="https://www.lithovolt.com.au" target="_blank">Website</a>
            </div>
            <div class="version">
                API Version: v1 | Status: {{ env('APP_ENV') === 'production' ? 'Production' : 'Development' }}
            </div>
        </div>
    </div>
</body>

</html>