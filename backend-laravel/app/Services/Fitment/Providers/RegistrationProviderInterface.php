<?php

namespace App\Services\Fitment\Providers;

interface RegistrationProviderInterface
{
    public function lookup(string $registrationNumber, ?string $stateCode, string $market = 'AU'): ?array;
}
