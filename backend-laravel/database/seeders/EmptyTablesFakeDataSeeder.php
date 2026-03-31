<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\BatteryModel;
use App\Models\ClaimStatusHistory;
use App\Models\Notification;
use App\Models\NotificationSetting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\RegistrationLookupCache;
use App\Models\Role;
use App\Models\SerialNumber;
use App\Models\StaffUser;
use App\Models\User;
use App\Models\VehicleFitment;
use App\Models\Warranty;
use App\Models\WarrantyClaim;
use App\Models\WarrantyClaimAttachment;
use App\Models\WholesalerApplication;
use App\Models\WholesalerInvitation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmptyTablesFakeDataSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()->orderBy('id')->get();
        $adminUser = $users->first();
        $wholesalerUser = $users->firstWhere('email', 'wholesaler@lithovolt.com.au') ?? $users->skip(1)->first();
        $consumerUser = $users->firstWhere('email', 'customer@lithovolt.com.au') ?? $users->last();

        if ($this->isEmpty('product_categories')) {
            ProductCategory::query()->create(['name' => 'Automotive Batteries', 'slug' => 'automotive-batteries', 'is_active' => true]);
            ProductCategory::query()->create(['name' => 'Commercial Batteries', 'slug' => 'commercial-batteries', 'is_active' => true]);
            ProductCategory::query()->create(['name' => 'Accessories', 'slug' => 'accessories', 'is_active' => true]);
        }

        if ($this->isEmpty('products')) {
            $categories = ProductCategory::query()->orderBy('id')->get();
            $batteryModels = BatteryModel::query()->orderBy('id')->take(8)->get();

            foreach ($batteryModels as $index => $model) {
                $price = (float) ($model->price ?? (199 + ($index * 20)));
                $qty = 40 + ($index * 3);

                Product::query()->create([
                    'name' => $model->name,
                    'product_type' => 'BATTERY',
                    'sku' => sprintf('PRD-%s-%03d', $model->id, $index + 1),
                    'category_id' => $categories->get($index % max(1, $categories->count()))?->id,
                    'legacy_battery_model_id' => $model->id,
                    'description' => $model->description ?: 'Demo catalog item generated for UI testing.',
                    'image_url' => 'https://placehold.co/800x600/png?text=' . rawurlencode((string) ($model->model_code ?: $model->sku)),
                    'price' => $price,
                    'total_quantity' => $qty,
                    'available_quantity' => max(0, $qty - random_int(2, 10)),
                    'low_stock_threshold' => 5,
                    'metadata' => [
                        'brand' => $model->brand,
                        'series' => $model->series,
                        'model_code' => $model->model_code,
                        'group_size' => $model->group_size,
                        'battery_type' => $model->battery_type,
                        'chemistry' => $model->chemistry,
                        'capacity_ah' => $model->capacity_ah,
                    ],
                    'is_active' => true,
                    'is_serialized' => true,
                    'is_warranty_eligible' => true,
                    'is_fitment_eligible' => true,
                    'default_warranty_months' => (int) ($model->warranty_months ?: 24),
                ]);
            }
        }

        if ($this->isEmpty('staff_users') && $adminUser) {
            // Get ADMIN role - must exist from RoleSeeder
            $adminRole = Role::query()->where('name', 'ADMIN')->firstOrFail();
            $salesRole = Role::query()->where('name', 'SALES')->first() ?: $adminRole;

            StaffUser::query()->create([
                'user_id' => $adminUser->id,
                'role_id' => $adminRole->id,  // Explicitly use the ADMIN role object's id
                'supervisor_id' => null,
                'hire_date' => now()->subMonths(18)->toDateString(),
                'is_active' => true,
                'notes' => 'Seeded admin staff profile',
            ]);

            if ($wholesalerUser && $wholesalerUser->id !== $adminUser->id) {
                StaffUser::query()->create([
                    'user_id' => $wholesalerUser->id,
                    'role_id' => $salesRole->id,  // Use the SALES role object's id
                    'supervisor_id' => $adminUser->id,
                    'hire_date' => now()->subMonths(8)->toDateString(),
                    'is_active' => true,
                    'notes' => 'Seeded sales staff profile',
                ]);
            }
        }

        if ($this->isEmpty('orders') && $consumerUser) {
            $statuses = ['PENDING', 'PROCESSING', 'FULFILLED'];
            $paymentStatuses = ['pending', 'paid', 'paid'];
            $paymentMethods = ['PAY_LATER', 'ONLINE', 'ONLINE'];

            for ($i = 0; $i < 3; $i++) {
                Order::query()->create([
                    'order_number' => sprintf('ORD-FAKE-%04d', $i + 1),
                    'user_id' => $consumerUser->id,
                    'total_amount' => 0,
                    'status' => $statuses[$i],
                    'payment_status' => $paymentStatuses[$i],
                    'payment_method' => $paymentMethods[$i],
                    'notes' => 'Auto-generated fake order for dashboard/testing',
                ]);
            }
        }

        if ($this->isEmpty('order_items')) {
            $products = Product::query()->orderBy('id')->get();
            $orders = Order::query()->orderBy('id')->get();

            foreach ($orders as $index => $order) {
                $product = $products->get($index % max(1, $products->count()));
                if (!$product) {
                    continue;
                }

                $qty = random_int(1, 3);
                $unitPrice = (float) $product->price;
                $total = $qty * $unitPrice;

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'itemable_type' => Product::class,
                    'itemable_id' => $product->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total_price' => $total,
                ]);

                $order->update(['total_amount' => $order->total_amount + $total]);
            }
        }

        if ($this->isEmpty('serial_numbers')) {
            $products = Product::query()->where('product_type', 'BATTERY')->orderBy('id')->take(6)->get();
            $batteryModels = BatteryModel::query()->whereIn('id', $products->pluck('legacy_battery_model_id')->filter())->get()->keyBy('id');

            foreach ($products as $index => $product) {
                $model = $batteryModels->get($product->legacy_battery_model_id) ?? BatteryModel::query()->first();
                if (!$model) {
                    continue;
                }

                SerialNumber::query()->create([
                    'battery_model_id' => $model->id,
                    'product_id' => $product->id,
                    'serial_number' => sprintf('LVAU%s%05d', now()->format('ymd'), $index + 1),
                    'status' => $index % 2 === 0 ? 'sold' : 'allocated',
                    'allocated_to' => $wholesalerUser?->id,
                    'allocated_date' => now()->subDays(10 - $index),
                    'sold_to' => $consumerUser?->id,
                    'sold_date' => now()->subDays(5 - min($index, 4)),
                ]);
            }
        }

        if ($this->isEmpty('warranties') && $consumerUser) {
            $serials = SerialNumber::query()->orderBy('id')->take(4)->get();

            foreach ($serials as $index => $serial) {
                Warranty::query()->create([
                    'warranty_number' => sprintf('WAR-FAKE-%04d', $index + 1),
                    'battery_model_id' => $serial->battery_model_id,
                    'product_id' => $serial->product_id,
                    'user_id' => $consumerUser->id,
                    'serial_number' => $serial->serial_number,
                    'issue_date' => now()->subMonths(6 - $index)->toDateString(),
                    'expiry_date' => now()->addMonths(18 + $index)->toDateString(),
                    'status' => 'active',
                    'qr_code' => (string) Str::uuid(),
                ]);
            }
        }

        if ($this->isEmpty('warranty_claims') && $consumerUser) {
            $warranties = Warranty::query()->orderBy('id')->take(2)->get();
            foreach ($warranties as $index => $warranty) {
                WarrantyClaim::query()->create([
                    'warranty_id' => $warranty->id,
                    'user_id' => $consumerUser->id,
                    'claim_number' => sprintf('CLM-FAKE-%04d', $index + 1),
                    'complaint_description' => $index === 0
                        ? 'Battery not holding charge overnight.'
                        : 'Intermittent start issue during cold mornings.',
                    'status' => $index === 0 ? 'PENDING' : 'UNDER_REVIEW',
                    'assigned_to' => $adminUser?->id,
                    'reviewed_by' => $index === 0 ? null : $adminUser?->id,
                    'review_notes' => $index === 0 ? null : 'Initial diagnostics requested from service center.',
                ]);
            }
        }

        if ($this->isEmpty('warranty_claim_attachments')) {
            WarrantyClaim::query()->orderBy('id')->take(2)->get()->each(function (WarrantyClaim $claim, int $index): void {
                WarrantyClaimAttachment::query()->create([
                    'warranty_claim_id' => $claim->id,
                    'file_path' => 'https://picsum.photos/seed/wclaim-' . ($index + 1) . '/1280/720',
                    'file_type' => 'image/jpeg',
                    'file_name' => sprintf('claim-photo-%02d.jpg', $index + 1),
                ]);
            });
        }

        if ($this->isEmpty('claim_status_history')) {
            WarrantyClaim::query()->orderBy('id')->take(2)->get()->each(function (WarrantyClaim $claim): void {
                ClaimStatusHistory::query()->create([
                    'claim_id' => $claim->id,
                    'from_status' => 'PENDING',
                    'to_status' => strtoupper((string) $claim->status),
                    'changed_by' => $claim->reviewed_by,
                    'notes' => 'Seeded initial claim workflow state',
                ]);
            });
        }

        if ($this->isEmpty('notification_settings')) {
            $users->each(function (User $user): void {
                NotificationSetting::query()->create([
                    'user_id' => $user->id,
                    'email_notifications' => true,
                    'sms_notifications' => false,
                    'push_notifications' => true,
                ]);
            });
        }

        if ($this->isEmpty('notifications')) {
            $users->each(function (User $user): void {
                Notification::query()->create([
                    'user_id' => $user->id,
                    'type' => 'email',
                    'subject' => 'Welcome to LithoVolt Demo Data',
                    'message' => 'This is seeded sample data used for UI and workflow testing.',
                    'status' => 'sent',
                    'sent_at' => now()->subMinutes(random_int(15, 240)),
                ]);
            });
        }

        if ($this->isEmpty('wholesaler_applications') && $wholesalerUser) {
            WholesalerApplication::query()->create([
                'user_id' => $wholesalerUser->id,
                'business_name' => 'LithoVolt Trade Sydney',
                'registration_number' => 'AU-REG-784512',
                'status' => 'approved',
                'review_notes' => 'Auto-approved for fake data bootstrapping.',
                'reviewed_by' => $adminUser?->id,
                'reviewed_at' => now()->subDays(2),
            ]);
        }

        if ($this->isEmpty('wholesaler_invitations') && $adminUser) {
            WholesalerInvitation::query()->create([
                'email' => 'new.wholesaler@lithovolt.com.au',
                'name' => 'Sam Wholesaler',
                'company_name' => 'Metro Battery Traders',
                'invitation_token' => Str::uuid()->toString(),
                'sent_at' => now()->subDay(),
                'accepted_at' => null,
                'expires_at' => now()->addDays(7),
                'invited_by_admin_id' => $adminUser->id,
                'notes' => 'Seeded invitation for admin workflow testing.',
            ]);
        }

        if ($this->isEmpty('registration_lookup_cache')) {
            $fitment = VehicleFitment::query()->orderBy('id')->first();
            RegistrationLookupCache::query()->create([
                'market' => 'AU',
                'state_code' => 'NSW',
                'registration_number' => 'FAKE123',
                'provider' => 'manual_seed',
                'vehicle_fitment_id' => $fitment?->id,
                'vehicle_payload' => [
                    'vin' => 'WVWZZZ1JZXW000001',
                    'make' => 'Toyota',
                    'model' => 'Hilux',
                    'year' => 2021,
                ],
                'looked_up_at' => now()->subHours(2),
                'expires_at' => now()->addDay(),
            ]);
        }

        if ($this->isEmpty('audit_logs')) {
            AuditLog::query()->create([
                'entity_type' => 'Product',
                'entity_id' => Product::query()->value('id'),
                'event_type' => 'created',
                'user_id' => $adminUser?->id,
                'old_values' => null,
                'new_values' => ['source' => 'EmptyTablesFakeDataSeeder'],
                'changed_fields' => ['name', 'sku', 'image_url'],
                'request_method' => 'SEED',
                'request_path' => 'database/seeders/EmptyTablesFakeDataSeeder',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'artisan-seeder',
            ]);
        }
    }

    private function isEmpty(string $table): bool
    {
        return DB::table($table)->count() === 0;
    }
}
