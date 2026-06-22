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
           Schema::table('organization_profiles', function (Blueprint $table) {
            $table->string('official_email')->nullable()->after('domain');
            $table->unique('official_email');
        });

          Schema::table('university_profiles', function (Blueprint $table) {
            $table->string('official_email')->nullable()->after('domain');
            $table->unique('official_email');
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('organization_profiles', function (Blueprint $table) {
            $table->dropUnique(['official_email']);
            $table->dropColumn('official_email');
        });

           Schema::table('university_profiles', function (Blueprint $table) {
            $table->dropUnique(['official_email']);
            $table->dropColumn('official_email');
        });
    }
};
