<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
      use HasFactory;

    protected $fillable = ['name'];

    public function organizations()
    {
        return $this->belongsToMany(OrganizationProfile::class, 'organisation_projects');
    }
}
