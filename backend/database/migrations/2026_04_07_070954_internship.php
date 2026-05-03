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
              Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organisation_id')->constrained('organization_profiles')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->string('duration');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('slots')->default(1);
            $table->enum('status', ['open', 'closed', 'in_progress'])->default('open');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        schema::dropIfExists('internships');
    }
};
