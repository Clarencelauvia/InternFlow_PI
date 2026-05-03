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
           Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('location')->nullable();
            $table->text('skills')->nullable();
            $table->string('preferred_work_type')->nullable(); // remote, onsite, hybrid
            $table->string('internship_type')->nullable(); // professionnel, academique
            $table->integer('preferred_duration_min')->nullable();
            $table->integer('preferred_duration_max')->nullable();
            $table->string('languages')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('experience')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'location', 'skills', 'preferred_work_type', 'internship_type',
                'preferred_duration_min', 'preferred_duration_max', 'languages',
                'linkedin_url', 'github_url', 'portfolio_url'
            ]);
        });
    }
};
