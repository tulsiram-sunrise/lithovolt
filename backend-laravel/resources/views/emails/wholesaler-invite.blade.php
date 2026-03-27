<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lithovolt Wholesaler Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f2f8f4;font-family:Arial,Helvetica,sans-serif;color:#102018;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f8f4;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d6e6dc;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background:linear-gradient(120deg,#10281d,#0a1410);padding:22px 24px;color:#e8fdf1;">
                            <h1 style="margin:0;font-size:22px;line-height:1.2;">You are invited to Lithovolt</h1>
                            <p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;">Wholesale Partner Onboarding</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;font-size:16px;line-height:1.5;">
                                Hello {{ $name ?: 'there' }},
                            </p>
                            <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#1f3a2b;">
                                You have been invited to join Lithovolt as a wholesale partner.
                            </p>

                            @if(!empty($companyName))
                                <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#314f3f;">
                                    <strong>Company:</strong> {{ $companyName }}
                                </p>
                            @endif

                            @if(!empty($notes))
                                <div style="margin:12px 0 18px 0;padding:12px;border-radius:8px;border:1px solid #d9ece0;background:#f8fdf9;">
                                    <p style="margin:0 0 6px 0;font-size:13px;color:#466757;"><strong>Personal message</strong></p>
                                    <p style="margin:0;font-size:14px;line-height:1.5;color:#1f3a2b;">{{ $notes }}</p>
                                </div>
                            @endif

                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:18px 0 16px 0;">
                                <tr>
                                    <td style="border-radius:8px;background:#20d16b;">
                                        <a href="{{ $registrationLink }}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;color:#052212;text-decoration:none;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#466757;word-break:break-all;">
                                If the button does not work, use this link:<br>
                                <a href="{{ $registrationLink }}" style="color:#0f8a46;text-decoration:underline;">{{ $registrationLink }}</a>
                            </p>

                            <p style="margin:14px 0 0 0;font-size:13px;line-height:1.6;color:#466757;">
                                This invitation expires on <strong>{{ $expiresOn }}</strong>.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 24px;border-top:1px solid #e3efe8;background:#fbfefc;">
                            <p style="margin:0;font-size:12px;line-height:1.5;color:#5f7d6e;">
                                If you did not expect this invitation, you can ignore this email.
                            </p>
                            <p style="margin:6px 0 0 0;font-size:12px;color:#5f7d6e;">
                                Lithovolt Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
