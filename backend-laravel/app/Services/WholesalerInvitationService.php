<?php

namespace App\Services;

use App\Models\WholesalerInvitation;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;

class WholesalerInvitationService
{
    /**
     * Send invitation to a single email
     */
    public function sendInvitation(
        string $email,
        User $admin,
        ?string $name = null,
        ?string $companyName = null,
        ?string $notes = null
    ): WholesalerInvitation {
        // Check if email already exists as a user
        if (User::where('email', $email)->exists()) {
            throw new \Exception("User with email {$email} already exists. Cannot invite existing users.");
        }

        // Check if already invited
        $existing = WholesalerInvitation::where('email', $email)
            ->where('accepted_at', null)
            ->first();

        if ($existing && $existing->isValid()) {
            return $existing;
        }

        // Create new invitation
        $token = Str::random(32);
        $expiresAt = now()->addDays(30); // 30-day expiration

        $invitation = WholesalerInvitation::create([
            'email' => $email,
            'name' => $name,
            'company_name' => $companyName,
            'invitation_token' => $token,
            'expires_at' => $expiresAt,
            'invited_by_admin_id' => $admin->id,
            'notes' => $notes,
        ]);

        // Send email
        $this->sendInvitationEmail($invitation);

        return $invitation;
    }

    /**
     * Send bulk invitations from CSV/array
     */
    public function sendBulkInvitations(array $invitations, User $admin): Collection
    {
        $results = new Collection();

        foreach ($invitations as $invite) {
            try {
                $result = $this->sendInvitation(
                    $invite['email'],
                    $admin,
                    $invite['name'] ?? null,
                    $invite['company_name'] ?? null,
                    $invite['notes'] ?? null
                );
                $results->push($result);
            } catch (\Exception $e) {
                // Log error but continue with next invitation
                    Log::error('Failed to send wholesaler invitation', [
                    'email' => $invite['email'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $results;
    }

    /**
     * Handle invitation acceptance (when wholesaler clicks link and registers)
     */
    public function acceptInvitation(string $token, User $user): bool
    {
        $invitation = WholesalerInvitation::where('invitation_token', $token)->first();

        if (!$invitation || !$invitation->isValid()) {
            return false;
        }

        // Verify email matches
        if ($invitation->email !== $user->email) {
            return false;
        }

        // Mark as accepted
        $invitation->update([
            'accepted_at' => now(),
        ]);

        return true;
    }

    /**
     * Resend invitation email
     */
    public function resendInvitation(WholesalerInvitation $invitation): void
    {
        // Reset expiration
        $invitation->update([
            'expires_at' => now()->addDays(30),
        ]);

        $this->sendInvitationEmail($invitation);
    }

    /**
     * Send the invitation email
     */
    private function sendInvitationEmail(WholesalerInvitation $invitation): void
    {
        $registrationLink = config('app.frontend_url') . '/register?invitation=' . $invitation->invitation_token;

        $subject = 'Invitation to Join Lithovolt as a Wholesaler';

        $viewData = [
            'subject' => $subject,
            'heading' => 'You are invited to Lithovolt',
            'subheading' => 'Wholesale Partner Onboarding',
            'greeting' => 'Hello ' . ($invitation->name ?: 'there') . ',',
            'lines' => [
                'You have been invited to join Lithovolt as a wholesale partner.',
            ],
            'meta' => array_values(array_filter([
                !empty($invitation->company_name) ? ['label' => 'Company:', 'value' => $invitation->company_name] : null,
                !empty($invitation->notes) ? ['label' => 'Message:', 'value' => $invitation->notes] : null,
            ])),
            'actionText' => 'Accept Invitation',
            'actionUrl' => $registrationLink,
            'footnote' => 'This invitation expires on ' . ($invitation->expires_at?->format('F j, Y') ?? now()->addDays(30)->format('F j, Y')) . '.',
            'footerText' => 'If you did not expect this invitation, you can ignore this email.',
        ];

        try {
            Mail::send(
                ['html' => 'emails.transactional', 'text' => 'emails.transactional-plain'],
                $viewData,
                function ($message) use ($invitation, $subject) {
                $message->to($invitation->email)
                    ->subject($subject);
                }
            );

            $invitation->update(['sent_at' => now()]);
        } catch (\Throwable $e) {
                Log::error('Failed to send wholesaler invitation email', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'error' => $e->getMessage(),
            ]);

            if (config('app.debug')) {
                throw $e;
            }
        }
    }
}
