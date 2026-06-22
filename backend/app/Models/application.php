<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class application extends Model
{
    use HasFactory;

    protected $table = 'applications';

    protected $fillable = [
        'internship_id',
        'student_id',
        'status',
        'cover_letter',
        'message',
        'availability_confirmed',
        'available_from',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'availability_confirmed' => 'boolean',
        'available_from' => 'date',
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class, 'internship_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}