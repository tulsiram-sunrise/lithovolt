<?php

namespace App\Services\Fitment\Providers;

class NullRegistrationProvider implements RegistrationProviderInterface
{
    public function lookup(string $registrationNumber, ?string $stateCode, string $market = 'AU'): ?array
    {
        return null;
    }
}
