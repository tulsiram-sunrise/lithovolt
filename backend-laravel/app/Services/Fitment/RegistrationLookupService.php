<?php

namespace App\Services\Fitment;

use App\Models\RegistrationLookupCache;
use App\Models\VehicleFitment;
use App\Services\Fitment\Providers\RegistrationProviderInterface;
use Carbon\Carbon;

class RegistrationLookupService
{
    public function __construct(private RegistrationProviderInterface $provider)
    {
    }

    public function lookup(string $registrationNumber, ?string $stateCode = null, string $market = 'AU', array $manualHint = []): array
    {
        $market = strtoupper(trim($market));
        $stateCode = $stateCode ? strtoupper(trim($stateCode)) : null;
        $rego = $this->normalizeRegistration($registrationNumber);
        $ttlMinutes = (int) config('registration_lookup.cache_ttl_minutes', 1440);

        $cached = RegistrationLookupCache::where('market', $market)
            ->where('state_code', $stateCode)
            ->where('registration_number', $rego)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->latest('id')
            ->first();

        if ($cached && $cached->fitment) {
            return $this->buildResponse(
                lookupStatus: 'matched',
                source: 'cache',
                fitment: $cached->fitment->load('recommendations.batteryModel'),
                providerUsed: $cached->provider,
                providerConnected: $cached->provider !== 'none',
            );
        }

        $providerPayload = null;
        if ((bool) config('registration_lookup.provider_enabled', false)) {
            $providerPayload = $this->provider->lookup($rego, $stateCode, $market);
        }

        $resolvedFitment = null;
        if (is_array($providerPayload)) {
            $resolvedFitment = $this->resolveFitmentFromVehicle($market, $providerPayload);
        }

        if (!$resolvedFitment && !empty($manualHint['make']) && !empty($manualHint['model'])) {
            $resolvedFitment = $this->resolveFitmentByManual(
                $market,
                (string) $manualHint['make'],
                (string) $manualHint['model'],
                isset($manualHint['year']) ? (int) $manualHint['year'] : null,
            );
        }

        RegistrationLookupCache::updateOrCreate(
            [
                'market' => $market,
                'state_code' => $stateCode,
                'registration_number' => $rego,
            ],
            [
                'provider' => is_array($providerPayload)
                    ? (string) config('registration_lookup.provider_name', 'external')
                    : 'none',
                'vehicle_fitment_id' => $resolvedFitment?->id,
                'vehicle_payload' => $providerPayload,
                'looked_up_at' => now(),
                'expires_at' => Carbon::now()->addMinutes($ttlMinutes),
            ]
        );

        if ($resolvedFitment) {
            return $this->buildResponse(
                lookupStatus: 'matched',
                source: is_array($providerPayload) ? 'provider' : 'manual',
                fitment: $resolvedFitment->load('recommendations.batteryModel'),
                providerUsed: is_array($providerPayload)
                    ? (string) config('registration_lookup.provider_name', 'external')
                    : 'none',
                providerConnected: is_array($providerPayload),
            );
        }

        return [
            'lookup_status' => (bool) config('registration_lookup.provider_enabled', false)
                ? 'no_match'
                : 'provider_unavailable',
            'source' => 'none',
            'vehicle' => null,
            'recommendations' => [],
            'feasibility' => [
                'production_ready' => false,
                'provider_connected' => false,
                'notes' => [
                    'No active registration data provider is configured in this environment.',
                    'Use manual make/model/year fallback or integrate a paid AU/NZ provider.',
                ],
            ],
        ];
    }

    public function lookupByVehicle(string $make, string $model, ?int $year = null, string $market = 'AU'): array
    {
        $fitment = $this->resolveFitmentByManual($market, $make, $model, $year);

        if (!$fitment) {
            return [
                'lookup_status' => 'no_match',
                'source' => 'vehicle',
                'vehicle' => [
                    'market' => strtoupper(trim($market)),
                    'make' => strtoupper(trim($make)),
                    'model' => strtoupper(trim($model)),
                    'year' => $year,
                ],
                'recommendations' => [],
                'feasibility' => [
                    'production_ready' => true,
                    'provider_connected' => (bool) config('registration_lookup.provider_enabled', false),
                    'notes' => ['No fitment match found for supplied vehicle input.'],
                ],
            ];
        }

        return $this->buildResponse(
            lookupStatus: 'matched',
            source: 'vehicle',
            fitment: $fitment->load('recommendations.batteryModel'),
            providerUsed: (string) config('registration_lookup.provider_name', 'none'),
            providerConnected: (bool) config('registration_lookup.provider_enabled', false),
        );
    }

    private function normalizeRegistration(string $registration): string
    {
        $value = strtoupper(trim($registration));
        return preg_replace('/[^A-Z0-9]/', '', $value) ?? $value;
    }

    private function resolveFitmentFromVehicle(string $market, array $vehicle): ?VehicleFitment
    {
        $make = strtoupper((string) ($vehicle['make'] ?? ''));
        $model = strtoupper((string) ($vehicle['model'] ?? ''));
        $year = isset($vehicle['year']) ? (int) $vehicle['year'] : null;

        if ($make === '' || $model === '') {
            return null;
        }

        return $this->resolveFitmentByManual($market, $make, $model, $year);
    }

    private function resolveFitmentByManual(string $market, string $make, string $model, ?int $year): ?VehicleFitment
    {
        $query = VehicleFitment::where('market', strtoupper($market))
            ->where('is_active', true)
            ->whereRaw('UPPER(make) = ?', [strtoupper($make)])
            ->whereRaw('UPPER(model) = ?', [strtoupper($model)]);

        if ($year) {
            $query->where(function ($yearQuery) use ($year) {
                $yearQuery
                    ->whereNull('year_from')
                    ->orWhere('year_from', '<=', $year);
            })->where(function ($yearQuery) use ($year) {
                $yearQuery
                    ->whereNull('year_to')
                    ->orWhere('year_to', '>=', $year);
            });
        }

        return $query->orderBy('year_from', 'desc')->first();
    }

    private function buildResponse(
        string $lookupStatus,
        string $source,
        VehicleFitment $fitment,
        string $providerUsed,
        bool $providerConnected,
    ): array {
        $vehicle = [
            'market' => $fitment->market,
            'make' => $fitment->make,
            'model' => $fitment->model,
            'variant' => $fitment->variant,
            'year_from' => $fitment->year_from,
            'year_to' => $fitment->year_to,
            'fuel_type' => $fitment->fuel_type,
            'body_type' => $fitment->body_type,
            'drivetrain' => $fitment->drivetrain,
        ];

        $recommendations = $fitment->recommendations
            ->sortBy('priority')
            ->map(function ($rec) {
                return [
                    'priority' => $rec->priority,
                    'recommendation_type' => $rec->recommendation_type,
                    'fitment_notes' => $rec->fitment_notes,
                    'battery' => $rec->batteryModel,
                ];
            })
            ->values()
            ->all();

        return [
            'lookup_status' => $lookupStatus,
            'source' => $source,
            'vehicle' => $vehicle,
            'recommendations' => $recommendations,
            'feasibility' => [
                'production_ready' => $providerConnected,
                'provider_connected' => $providerConnected,
                'provider_used' => $providerUsed,
                'notes' => $providerConnected
                    ? ['External provider connected and fitment matched.']
                    : ['Provider not connected. Lookup is currently fallback-driven.'],
            ],
        ];
    }
}
