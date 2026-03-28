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

        $effectiveConfig = $this->resolveHttpConfig($market);

        $timeout = (int) config('registration_lookup.http.timeout_seconds', 10);
        $method = strtoupper((string) ($effectiveConfig['method'] ?? config('registration_lookup.http.method', 'GET')));
        $payloadMode = strtolower((string) ($effectiveConfig['payload_mode'] ?? config('registration_lookup.http.payload_mode', 'auto')));

        $regoParam = (string) ($effectiveConfig['rego_param'] ?? config('registration_lookup.http.rego_param', 'registration_number'));
        $stateParam = (string) ($effectiveConfig['state_param'] ?? config('registration_lookup.http.state_param', 'state_code'));
        $marketParam = (string) ($effectiveConfig['market_param'] ?? config('registration_lookup.http.market_param', 'market'));

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
            $authMode = strtolower((string) ($effectiveConfig['auth_mode'] ?? config('registration_lookup.http.auth_mode', 'header')));
            if ($authMode === 'query') {
                $tokenQueryParam = (string) ($effectiveConfig['token_query_param'] ?? config('registration_lookup.http.token_query_param', 'api_key'));
                if ($tokenQueryParam !== '') {
                    $params[$tokenQueryParam] = $token;
                }
            } else {
                $tokenHeader = (string) ($effectiveConfig['token_header'] ?? config('registration_lookup.http.token_header', 'Authorization'));
                $tokenPrefix = (string) ($effectiveConfig['token_prefix'] ?? config('registration_lookup.http.token_prefix', 'Bearer'));
                $headerValue = $tokenPrefix !== '' ? trim($tokenPrefix . ' ' . $token) : $token;
                $client = $client->withHeaders([$tokenHeader => $headerValue]);
            }
        }

        $shouldUseJsonBody = $method === 'POST' && ($payloadMode === 'json' || $payloadMode === 'auto');

        $response = $method === 'POST'
            ? ($shouldUseJsonBody ? $client->post($url, $params) : $client->asForm()->post($url, $params))
            : $client->get($url, $params);

        if (!$response->successful()) {
            return null;
        }

        $payload = $response->json();
        if (!is_array($payload)) {
            return null;
        }

        $vehiclePath = (string) ($effectiveConfig['vehicle_path'] ?? config('registration_lookup.http.vehicle_path', 'vehicle'));
        $vehicle = $vehiclePath !== '' ? data_get($payload, $vehiclePath, $payload) : $payload;
        if (!is_array($vehicle)) {
            return null;
        }

        $make = $this->pickString($vehicle, $this->normalizeKeyList($effectiveConfig['make_keys'] ?? config('registration_lookup.http.make_keys', ['make', 'manufacturer', 'vehicle_make'])));
        $model = $this->pickString($vehicle, $this->normalizeKeyList($effectiveConfig['model_keys'] ?? config('registration_lookup.http.model_keys', ['model', 'vehicle_model'])));
        $year = $this->pickInt($vehicle, $this->normalizeKeyList($effectiveConfig['year_keys'] ?? config('registration_lookup.http.year_keys', ['year', 'model_year', 'build_year'])));

        if ($make === null || $model === null) {
            return null;
        }

        return [
            'make' => strtoupper($make),
            'model' => strtoupper($model),
            'year' => $year,
            'variant' => $this->pickString($vehicle, $this->normalizeKeyList($effectiveConfig['variant_keys'] ?? config('registration_lookup.http.variant_keys', ['variant', 'series', 'trim']))),
            'raw' => $payload,
        ];
    }

    private function resolveHttpConfig(string $market): array
    {
        $base = config('registration_lookup.http', []);
        if (!is_array($base)) {
            $base = [];
        }

        $profileName = strtolower((string) ($base['profile'] ?? 'generic'));
        if ($profileName === 'market_auto') {
            $marketProfiles = $base['market_profiles'] ?? [];
            if (is_array($marketProfiles)) {
                $autoProfile = $marketProfiles[strtoupper($market)] ?? null;
                if (is_string($autoProfile) && trim($autoProfile) !== '') {
                    $profileName = strtolower(trim($autoProfile));
                }
            }
        }

        $profiles = $base['profiles'] ?? [];
        if (!is_array($profiles)) {
            return $base;
        }

        $selectedProfile = $profiles[$profileName] ?? null;
        if (!is_array($selectedProfile)) {
            return $base;
        }

        return array_replace($base, $selectedProfile);
    }

    private function normalizeKeyList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(function ($item) {
            return is_string($item) ? trim($item) : null;
        }, $value)));
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
