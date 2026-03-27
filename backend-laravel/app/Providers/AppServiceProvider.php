<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Services\Fitment\Providers\HttpRegistrationProvider;
use App\Services\Fitment\Providers\NullRegistrationProvider;
use App\Services\Fitment\Providers\RegistrationProviderInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
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
        Model::created(function (Model $model) {
            $this->writeAuditLog($model, 'created');
        });

        Model::updated(function (Model $model) {
            $this->writeAuditLog($model, 'updated');
        });

        Model::deleted(function (Model $model) {
            $this->writeAuditLog($model, 'deleted');
        });
    }

    private function writeAuditLog(Model $model, string $eventType): void
    {
        if ($model instanceof AuditLog) {
            return;
        }

        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        try {
            $dirty = method_exists($model, 'getDirty') ? $model->getDirty() : [];
            $changes = method_exists($model, 'getChanges') ? $model->getChanges() : [];

            $oldValues = [];
            $newValues = [];
            $changedFields = [];

            if ($eventType === 'updated') {
                $changedFields = array_keys($dirty);
                foreach ($changedFields as $field) {
                    if (in_array($field, ['updated_at'], true)) {
                        continue;
                    }

                    $oldValues[$field] = $model->getOriginal($field);
                    $newValues[$field] = $changes[$field] ?? $model->{$field};
                }

                if (empty($oldValues) && empty($newValues)) {
                    return;
                }
            }

            if ($eventType === 'created') {
                $newValues = $model->getAttributes();
                $changedFields = array_keys($newValues);
            }

            if ($eventType === 'deleted') {
                $oldValues = $model->getOriginal();
                $changedFields = array_keys($oldValues);
            }

            $request = request();

            AuditLog::query()->create([
                'entity_type' => class_basename($model),
                'entity_id' => $model->getKey(),
                'event_type' => $eventType,
                'user_id' => Auth::id(),
                'old_values' => $oldValues ?: null,
                'new_values' => $newValues ?: null,
                'changed_fields' => $changedFields ?: null,
                'request_method' => $request?->method(),
                'request_path' => $request?->path(),
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        } catch (\Throwable $exception) {
            // Avoid blocking writes if audit logging fails.
        }
    }
}
