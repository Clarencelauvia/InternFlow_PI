<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Read the current indexes so we only do what's actually needed.
        // A previous half-run may have already dropped users_email_unique.
        $indexes = collect(DB::select('SHOW INDEX FROM users'))->pluck('Key_name')->unique();

        Schema::table('users', function (Blueprint $table) use ($indexes) {
            // Drop the old single-column unique only if it's still present
            if ($indexes->contains('users_email_unique')) {
                $table->dropUnique('users_email_unique');
            }

            // Add the per-role composite unique only if it isn't there yet
            if (! $indexes->contains('users_email_role_unique')) {
                $table->unique(['email', 'role']);
            }
        });
    }

    public function down(): void
    {
        $indexes = collect(DB::select('SHOW INDEX FROM users'))->pluck('Key_name')->unique();

        Schema::table('users', function (Blueprint $table) use ($indexes) {
            if ($indexes->contains('users_email_role_unique')) {
                $table->dropUnique('users_email_role_unique');
            }
            if (! $indexes->contains('users_email_unique')) {
                $table->unique('email');
            }
        });
    }
};