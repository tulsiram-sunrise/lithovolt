<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #172419; font-size: 12px; }
        .header { border-bottom: 1px solid #dce8df; margin-bottom: 16px; padding-bottom: 10px; }
        .title { font-size: 20px; margin: 0; color: #0f281d; }
        .muted { color: #4e6a5b; }
        .grid { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 14px; }
        .grid th, .grid td { border: 1px solid #dce8df; padding: 8px; text-align: left; }
        .grid th { background: #f2f8f4; }
        .right { text-align: right; }
        .summary { margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Lithovolt Invoice</h1>
        <p class="muted">Invoice ID: INV-{{ $order->id }}</p>
    </div>

    <p><strong>Order Number:</strong> {{ $order->order_number ?: ('ORD-' . $order->id) }}</p>
    <p><strong>Invoice Date:</strong> {{ $invoiceDate->toDateTimeString() }}</p>
    <p><strong>Customer:</strong> {{ $order->user?->full_name ?: $order->user?->email ?: 'Unknown' }}</p>
    <p><strong>Status:</strong> {{ strtoupper((string) $order->status) }}</p>
    <p><strong>Payment Status:</strong> {{ strtoupper((string) $order->payment_status) }}</p>
    <p><strong>Payment Method:</strong> {{ strtoupper((string) ($order->payment_method ?? 'PAY_LATER')) }}</p>

    <table class="grid">
        <thead>
            <tr>
                <th>#</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Line Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->product?->name ?? $item->itemable?->name ?? ('Item #' . $item->id) }}</td>
                    <td>{{ (int) $item->quantity }}</td>
                    <td>{{ number_format((float) $item->unit_price, 2) }}</td>
                    <td>{{ number_format((float) $item->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p class="summary right"><strong>Total Amount:</strong> {{ number_format((float) $order->total_amount, 2) }}</p>

    @if(!empty($order->notes))
        <p><strong>Notes:</strong> {{ $order->notes }}</p>
    @endif
</body>
</html>
