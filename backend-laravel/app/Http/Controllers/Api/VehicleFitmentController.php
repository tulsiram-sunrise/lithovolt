<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Fitment\RegistrationLookupService;
use Illuminate\Http\Request;

class VehicleFitmentController extends Controller
{
    public function registrationLookup(Request $request, RegistrationLookupService $lookupService)
    {
        $validated = $request->validate([
            'registration_number' => 'required|string|max:32',
            'state_code' => 'nullable|string|max:8',
            'market' => 'nullable|string|max:8',
            'manual.make' => 'nullable|string|max:80',
            'manual.model' => 'nullable|string|max:120',
            'manual.year' => 'nullable|integer|min:1950|max:2100',
        ]);

        $result = $lookupService->lookup(
            registrationNumber: $validated['registration_number'],
            stateCode: $validated['state_code'] ?? null,
            market: $validated['market'] ?? 'AU',
            manualHint: $validated['manual'] ?? [],
        );

        return response()->json($result);
    }

    public function vehicleLookup(Request $request, RegistrationLookupService $lookupService)
    {
        $validated = $request->validate([
            'make' => 'required|string|max:80',
            'model' => 'required|string|max:120',
            'year' => 'nullable|integer|min:1950|max:2100',
            'market' => 'nullable|string|max:8',
        ]);

        $result = $lookupService->lookupByVehicle(
            make: $validated['make'],
            model: $validated['model'],
            year: isset($validated['year']) ? (int) $validated['year'] : null,
            market: $validated['market'] ?? 'AU',
        );

        return response()->json($result);
    }
}
