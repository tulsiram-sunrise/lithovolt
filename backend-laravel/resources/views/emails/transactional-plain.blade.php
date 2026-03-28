{{ $heading ?? 'Lithovolt' }}
@if(!empty($subheading))
{{ $subheading }}
@endif

@if(!empty($greeting))
{{ $greeting }}

@endif
@foreach(($lines ?? []) as $line)
{{ $line }}

@endforeach
@if(!empty($meta))
@foreach($meta as $item)
{{ $item['label'] ?? '' }}@if(!empty($item['value'])) {{ $item['value'] }}@endif
@endforeach

@endif
@if(!empty($actionUrl) && !empty($actionText))
{{ $actionText }}:
{{ $actionUrl }}

@endif
@if(!empty($footnote))
{{ $footnote }}

@endif
{{ $footerText ?? 'If you did not expect this email, you can safely ignore it.' }}

Lithovolt Team
