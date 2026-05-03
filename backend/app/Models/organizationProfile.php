<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class organizationProfile extends Model
{
    use HasFactory;
    
    protected $table = 'organization_profiles';

    protected $fillable = [
        'user_id',
        'organisation_name',
        'domain',
        'location',
        'postal_code',
        'official_number',
        'description',
        'logo_path',
        'website',
        'sector',
        'company_size',
        'founded_year',
        'social_links',
        'mission_statement',
        'recruitment_email',
        'contact_person_name',
        'contact_person_role',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'organisation_departments', 'organisation_id', 'department_id');
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'organisation_projects', 'organisation_id', 'project_id');
    }

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }
}