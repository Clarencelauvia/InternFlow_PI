<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
        use HasFactory;

    protected $fillable = ['name', 'type'];

    public function organizations()
    {
        return $this->belongsToMany(OrganizationProfile::class, 'organisation_departments');
    }

    public function universities()
    {
        return $this->belongsToMany(UniversityProfile::class, 'university_departments');
    }
}
