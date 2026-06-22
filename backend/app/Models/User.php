<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'contact',
        'status',
        'verification_code',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function organizationProfile()
    {
        return $this->hasOne(OrganizationProfile::class);
    }

    public function universityProfile()
    {
        return $this->hasOne(UniversityProfile::class);
    }
}