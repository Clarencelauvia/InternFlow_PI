<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixUniversityProfilesColumns extends Migration
{
    public function up()
    {
        Schema::table('university_profiles', function (Blueprint $table) {
            $table->string('official_number', 50)->change();
            $table->string('contact_phone', 50)->nullable()->change();
            $table->string('postal_code', 50)->change();
        });
    }

    public function down()
    {
        Schema::table('university_profiles', function (Blueprint $table) {
            $table->string('official_number', 20)->change();
            $table->string('contact_phone', 20)->nullable()->change();
            $table->string('postal_code', 20)->change();
        });
    }
}