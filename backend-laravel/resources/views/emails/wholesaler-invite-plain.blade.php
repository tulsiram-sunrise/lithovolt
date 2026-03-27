Hello {{ $name ?: 'there' }},

You have been invited to join Lithovolt as a wholesale partner.

@if(!empty($companyName))
Company: {{ $companyName }}
@endif
@if(!empty($notes))
Message: {{ $notes }}
@endif

Accept your invitation:
{{ $registrationLink }}

This invitation expires on {{ $expiresOn }}.

If you did not expect this invitation, you can ignore this email.

Lithovolt Team
