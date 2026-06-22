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
        Schema::create('university_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('university_name');
    $table->string('domain')->unique();
    $table->string('location');
    $table->string('postal_code')->nullable();
    $table->string('official_number');
    $table->text('description')->nullable();
    $table->string('logo_path')->nullable();
    $table->string('website')->nullable();
    $table->string('institution_code')->unique();
    $table->string('city')->nullable();
    $table->string('country')->nullable();
    $table->string('accreditation_number')->nullable();
    $table->string('contact_email')->nullable();
    $table->string('contact_phone')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('university_profiles');
    }
};
