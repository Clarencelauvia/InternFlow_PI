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
        schema::table('organization_profiles', function (Blueprint $table){

            $table->string('sector')->nullable();
            $table->string('company_size')->nullable();
            $table->integer('founded_year')->nullable();
            $table->json('social_links')->nullable();
            $table->text('mission_statement')->nullable();
            $table->string('recruitment_email')->nullable();
            $table->string('contact_person_name')->nullable();
            $table->string('contact_person_role')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        schema::table('organization_profiles', function (Blueprint $table){
            $table->dropColumn(['sector', 'company_size', 'founded_year', 'social_links', 
            'mission_statement', 'recruitment_email', 'contact_person_name', 'contact_person_role']);
        });
    }
};
