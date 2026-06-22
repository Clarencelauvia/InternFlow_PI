<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UniversityProfile extends Model
{
    use HasFactory;

    protected $table = 'university_profiles';

    protected $fillable = [
        'user_id',
        'university_name',
        'domain',
        'official_email',
        'location',
        'postal_code',
        'official_number',
        'description',
        'logo_path',
        'website',
        'institution_code',
        'city',
        'country',
        'accreditation_number',
        'contact_email',
        'contact_phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'university_departments', 'university_id', 'department_id');
    }
}