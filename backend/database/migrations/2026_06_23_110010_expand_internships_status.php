<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Expand the status lifecycle:
        //   draft -> open -> closed (manual) | closed_expired (auto) -> archived
        DB::statement(
            "ALTER TABLE internships MODIFY COLUMN status
             ENUM('draft','open','in_progress','closed','closed_expired','archived')
             NOT NULL DEFAULT 'open'"
        );

        Schema::table('internships', function (Blueprint $table) {
            if (!Schema::hasColumn('internships', 'closed_at')) {
                $table->timestamp('closed_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            if (Schema::hasColumn('internships', 'closed_at')) {
                $table->dropColumn('closed_at');
            }
        });

        DB::statement(
            "ALTER TABLE internships MODIFY COLUMN status
             ENUM('open','closed','in_progress')
             NOT NULL DEFAULT 'open'"
        );
    }
};