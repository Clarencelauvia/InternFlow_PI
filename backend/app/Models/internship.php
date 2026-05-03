<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Internship extends Model
{
    use HasFactory;

    protected $fillable = [
        'organisation_id',
        'title',
        'description',
        'location',
        'duration',
        'start_date',
        'end_date',
        'slots',
        'status',
        'internship_type',
        'payment_type',
        'salary',
        'department',
        'expires_at',
        'requirements',
        'benefits',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'expires_at' => 'datetime',
        'salary' => 'decimal:2',
    ];

    public function organization()
    {
        return $this->belongsTo(OrganizationProfile::class, 'organization_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}