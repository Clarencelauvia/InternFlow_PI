<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('student_profiles', 'university_id')) {
                $table->foreignId('university_id')
                    ->nullable()
                    ->after('university')
                    ->constrained('university_profiles')
                    ->nullOnDelete();
            }
            if (!Schema::hasColumn('student_profiles', 'university_status')) {
                $table->enum('university_status', ['none', 'pending', 'confirmed', 'rejected'])
                    ->default('none')
                    ->after('university_id');
            }
            if (!Schema::hasColumn('student_profiles', 'university_confirmed_at')) {
                $table->timestamp('university_confirmed_at')
                    ->nullable()
                    ->after('university_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('student_profiles', 'university_confirmed_at')) {
                $table->dropColumn('university_confirmed_at');
            }
            if (Schema::hasColumn('student_profiles', 'university_status')) {
                $table->dropColumn('university_status');
            }
            if (Schema::hasColumn('student_profiles', 'university_id')) {
                $table->dropForeign(['university_id']);
                $table->dropColumn('university_id');
            }
        });
    }
};