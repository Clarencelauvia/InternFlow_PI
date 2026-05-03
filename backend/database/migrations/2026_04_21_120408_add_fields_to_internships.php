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
        Schema::table('internships', function (Blueprint $table) {
            $table->enum('internship_type', ['academique', 'professionnel'])->default('professionnel');
            $table->enum('payment_type', ['paid', 'unpaid'])->default('unpaid');
            $table->decimal('salary', 10, 2)->nullable();
            $table->string('department')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('requirements')->nullable();
            $table->string('benefits')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internships', function (Blueprint $table) {
              $table->dropColumn(['internship_type', 'payment_type', 'salary', 'department', 'expires_at', 'requirements', 'benefits']);
        });
    }
};
