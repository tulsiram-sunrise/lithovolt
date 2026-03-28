<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:jwt');
    }

    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json($notifications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'type' => 'required|in:email,sms,push',
            'subject' => 'required|string',
            'message' => 'required|string',
            'status' => 'in:pending,sent,failed',
        ]);

        $actor = $request->user();
        if (!$this->isPrivileged($actor) && (int) $validated['user_id'] !== (int) $actor->id) {
            return response()->json([
                'message' => 'You can only create notifications for your own account.',
            ], 403);
        }

        $notification = Notification::create($validated);
        return response()->json(['message' => 'Notification created successfully', 'notification' => $notification], 201);
    }

    public function show(Request $request, Notification $notification)
    {
        if (!$this->canAccessNotification($request->user(), $notification)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($notification);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if (!$this->canAccessNotification($request->user(), $notification)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notification->update(['status' => 'sent']);
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function userNotifications()
    {
        /** @var User $user */
        $user = auth()->user();
        $notifications = $user->notifications()->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($notifications);
    }

    public function unreadCount()
    {
        /** @var User $user */
        $user = auth()->user();
        $count = $user->notifications()
            ->where('status', 'pending')
            ->count();
        return response()->json(['unread_count' => $count]);
    }

    private function isPrivileged(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        $roleName = strtoupper((string) ($user->role?->name ?? $user->role ?? ''));
        return $roleName === 'ADMIN';
    }

    private function canAccessNotification(?User $user, Notification $notification): bool
    {
        if (!$user) {
            return false;
        }

        return $this->isPrivileged($user)
            || (int) $notification->user_id === (int) $user->id;
    }
}
