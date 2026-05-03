<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use\Illuminate\Database\Eloquent\Factories\HasFactory;

class application extends Model
{
       use HasFactory;

    protected $fillable = [
        'internship_id',
        'student_id',
        'status',
        'cover_letter',
    ];
       public function internship()
    {
        return $this->belongsTo(Internship::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
