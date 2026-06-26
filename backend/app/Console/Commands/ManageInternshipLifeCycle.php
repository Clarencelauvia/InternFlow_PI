<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Internship;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Log;

class ManageInternshipLifecycle extends Command
{
    protected $signature = 'internships:lifecycle';

    protected $description = 'Auto-close internships past their deadline, notify organisations, and archive those closed for over 24h.';

    public function handle(): int
    {
        $now = now();

        // --- 6.3 Auto-close: open internships whose deadline (or end date) has passed ---
        $expired = Internship::where('status', 'open')
            ->where(function ($q) use ($now) {
                // application deadline passed
                $q->where(function ($q2) use ($now) {
                    $q2->whereNotNull('expires_at')->where('expires_at', '<', $now);
                })
                // or, if no deadline set, the end date passed
                ->orWhere(function ($q2) use ($now) {
                    $q2->whereNull('expires_at')->whereNotNull('end_date')->where('end_date', '<', $now);
                });
            })
            ->get();

        foreach ($expired as $internship) {
            $internship->status = 'closed_expired';
            $internship->closed_at = $now;
            $internship->save();

            // --- 6.4 Notify the organisation ---
            $userId = optional($internship->organization)->user_id;
            if ($userId) {
                UserNotification::create([
                    'user_id' => $userId,
                    'type' => 'internship_expired',
                    'title' => 'Stage automatiquement fermé',
                    'message' => "Votre offre de stage « {$internship->title} » a atteint sa date limite et a été automatiquement fermée. Elle sera retirée des annonces publiques dans les 24 heures.",
                    'data' => ['internship_id' => $internship->id],
                ]);
            }
        }

        // --- 6.5 Auto-archive: expired-closed internships closed more than 24h ago ---
        $toArchive = Internship::where('status', 'closed_expired')
            ->whereNotNull('closed_at')
            ->where('closed_at', '<', $now->copy()->subDay())
            ->get();

        foreach ($toArchive as $internship) {
            $internship->status = 'archived';
            $internship->save();
        }

        $summary = "Lifecycle: {$expired->count()} fermé(s) automatiquement, {$toArchive->count()} archivé(s).";
        $this->info($summary);
        Log::info($summary);

        return self::SUCCESS;
    }
}