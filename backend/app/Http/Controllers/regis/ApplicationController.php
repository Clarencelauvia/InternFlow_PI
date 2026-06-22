<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApplicationController extends Controller
{
    public function getStudentApplications(Request $request)
    {
        try {
            $applications = Application::with(['internship', 'internship.organization'])
                ->where('student_id', $request->user()->id)
                ->latest()
                ->get()
                ->map(function($application) {
                    return [
                        'id' => $application->id,
                        'internship_id' => $application->internship_id,
                        'status' => $application->status,
                        'cover_letter' => $application->cover_letter,
                        'created_at' => $application->created_at,
                        'internship' => $application->internship ? [
                            'id' => $application->internship->id,
                            'title' => $application->internship->title,
                            'description' => $application->internship->description,
                            'location' => $application->internship->location,
                            'duration' => $application->internship->duration,
                            'start_date' => $application->internship->start_date,
                            'end_date' => $application->internship->end_date,
                            'slots' => $application->internship->slots,
                            'status' => $application->internship->status,
                            'internship_type' => $application->internship->internship_type,
                            'payment_type' => $application->internship->payment_type,
                            'salary' => $application->internship->salary,
                            'created_at' => $application->internship->created_at,
                            'organization' => $application->internship->organization ? [
                                'organisation_name' => $application->internship->organization->organisation_name,
                            ] : null,
                        ] : null,
                    ];
                });
            
            return response()->json($applications);
        } catch (\Exception $e) {
            Log::error('Error fetching student applications: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch applications'], 500);
        }
    }
}