<?php

namespace App\Services\Fitment\Providers;

use Illuminate\Support\Facades\Http;

class HttpRegistrationProvider implements RegistrationProviderInterface
{
    public function lookup(string $registrationNumber, ?string $stateCode, string $market = 'AU'): ?array
    {
        $url = (string) config('registration_lookup.http.url');
        if ($url === '') {
            return null;
        }

        $timeout = (int) config('registration_lookup.http.timeout_seconds', 10);
        $method = strtoupper((string) config('registration_lookup.http.method', 'GET'));

        $regoParam = (string) config('registration_lookup.http.rego_param', 'registration_number');
        $stateParam = (string) config('registration_lookup.http.state_param', 'state_code');
        $marketParam = (string) config('registration_lookup.http.market_param', 'market');

        $params = [
            $regoParam => $registrationNumber,
            $marketParam => strtoupper($market),
        ];

        if ($stateCode) {
            $params[$stateParam] = strtoupper($stateCode);
        }

        $client = Http::acceptJson()->timeout($timeout);

        $token = (string) config('registration_lookup.http.token');
        if ($token !== '') {
            $tokenHeader = (string) config('registration_lookup.http.token_header', 'Authorization');
            $tokenPrefix = (string) config('registration_lookup.http.token_prefix', 'Bearer');
            $headerValue = $tokenPrefix !== '' ? trim($tokenPrefix . ' ' . $token) : $token;
            $client = $client->withHeaders([$tokenHeader => $headerValue]);
        }

        $response = $method === 'POST'
            ? $client->post($url, $params)
            : $client->get($url, $params);

        if (!$response->successful()) {
            return null;
        }

        $payload = $response->json();
        if (!is_array($payload)) {
            return null;
        }

        $vehiclePath = (string) config('registration_lookup.http.vehicle_path', 'vehicle');
        $vehicle = $vehiclePath !== '' ? data_get($payload, $vehiclePath, $payload) : $payload;
        if (!is_array($vehicle)) {
            return null;
        }

        $make = $this->pickString($vehicle, ['make', 'manufacturer', 'vehicle_make']);
        $model = $this->pickString($vehicle, ['model', 'vehicle_model']);
        $year = $this->pickInt($vehicle, ['year', 'model_year', 'build_year']);

        if ($make === null || $model === null) {
            return null;
        }

        return [
            'make' => strtoupper($make),
            'model' => strtoupper($model),
            'year' => $year,
            'variant' => $this->pickString($vehicle, ['variant', 'series', 'trim']),
            'raw' => $payload,
        ];
    }

    private function pickString(array $source, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = $source[$key] ?? null;
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    private function pickInt(array $source, array $keys): ?int
    {
        foreach ($keys as $key) {
            $value = $source[$key] ?? null;
            if (is_numeric($value)) {
                return (int) $value;
            }
        }

        return null;
    }
}
