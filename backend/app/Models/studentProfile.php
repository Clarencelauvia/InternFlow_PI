<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class studentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'university',
        'department',
        'course',
        'year',
        'student_id',
        'guardian_name',
        'guardian_contact',
        'bio',
        'resume_path',
        'profile_picture',
        'location',
        'skills',
        'preferred_work_type', // remote, onsite, hybrid
        'internship_type', // professionnel, academique
        'preferred_duration_min',
        'preferred_duration_max',
        'languages',
        'linkedin_url',
        'github_url',
        'portfolio_url',
        'experience'
    ];
       public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasManyThrough(Application::class, User::class, 'id', 'student_id', 'user_id');
    }
}
