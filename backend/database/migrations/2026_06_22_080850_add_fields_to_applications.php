<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->text('message')->nullable()->after('cover_letter');
            $table->boolean('availability_confirmed')->default(false)->after('message');
            $table->date('available_from')->nullable()->after('availability_confirmed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
        $table->dropColumn(['message', 'availability_confirmed', 'available_from']);
        });
    }
};
