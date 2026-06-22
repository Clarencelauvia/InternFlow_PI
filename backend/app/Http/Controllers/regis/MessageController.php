<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ((int) $request->recipient_id === $request->user()->id) {
            return response()->json(['error' => "Vous ne pouvez pas vous envoyer un message à vous-même"], 422);
        }

        try {
            $message = Message::create([
                'sender_id' => $request->user()->id,
                'recipient_id' => $request->recipient_id,
                'subject' => $request->subject,
                'body' => $request->body,
            ]);

            return response()->json([
                'message' => 'Message envoyé avec succès',
                'data' => $message->load('recipient'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error sending message: ' . $e->getMessage());
            return response()->json(['error' => "Échec de l'envoi du message"], 500);
        }
    }

    public function inbox(Request $request)
    {
        return response()->json(
            Message::with('sender')->where('recipient_id', $request->user()->id)->latest()->get()
        );
    }

    public function sent(Request $request)
    {
        return response()->json(
            Message::with('recipient')->where('sender_id', $request->user()->id)->latest()->get()
        );
    }

    public function markAsRead(Request $request, $id)
    {
        $message = Message::where('recipient_id', $request->user()->id)->findOrFail($id);
        $message->update(['read_at' => now()]);

        return response()->json(['message' => 'Message marqué comme lu']);
    }
}