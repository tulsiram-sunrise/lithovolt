<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
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

        $notification = Notification::create($validated);
        return response()->json(['message' => 'Notification created successfully', 'notification' => $notification], 201);
    }

    public function show(Notification $notification)
    {
        return response()->json($notification);
    }

    public function markAsRead(Notification $notification)
    {
        $notification->update(['status' => 'sent']);
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function userNotifications()
    {
        $notifications = auth()->user()->notifications()->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($notifications);
    }

    public function unreadCount()
    {
        $count = auth()->user()->notifications()
            ->where('status', 'pending')
            ->count();
        return response()->json(['unread_count' => $count]);
    }
}
