<?php

namespace App\Providers;

use App\Services\Fitment\Providers\HttpRegistrationProvider;
use App\Services\Fitment\Providers\NullRegistrationProvider;
use App\Services\Fitment\Providers\RegistrationProviderInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(RegistrationProviderInterface::class, function () {
            $driver = (string) config('registration_lookup.provider_driver', 'null');

            return match ($driver) {
                'http_json' => new HttpRegistrationProvider(),
                default => new NullRegistrationProvider(),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
