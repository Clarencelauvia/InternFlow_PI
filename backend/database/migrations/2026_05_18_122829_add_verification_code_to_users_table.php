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
        Schema::table('users', function (Blueprint $table) {
          if (!Schema::hasColumn('users', 'verification_code')) {
                $table->string('verification_code')->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'contact')) {
                $table->string('contact')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('student')->after('password');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('role');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
              $table->dropColumn(['verification_code', 'contact', 'role', 'status']);
        });
    }
};
