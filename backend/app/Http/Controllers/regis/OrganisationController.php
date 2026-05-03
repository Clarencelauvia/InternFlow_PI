<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrganisationController extends Controller
{
    // Get organisation's internships
    public function myInternships(Request $request)
    {
        $organization = $request->user()->organizationProfile;
        
        if (!$organization) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }
        
        // Change 'organization_id' to 'organisation_id'
        $internships = Internship::where('organisation_id', $organization->id)
            ->latest()
            ->get();
        
        return response()->json($internships);
    }

    // Get applications for organization's internships
    public function myApplications(Request $request)
    {
        $organization = $request->user()->organizationProfile;
        
        if (!$organization) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }
        
        $applications = Application::whereHas('internship', function($query) use ($organization) {
            $query->where('organisation_id', $organization->id);
        })
        ->with(['student', 'internship'])
        ->latest()
        ->get()
        ->map(function($app) {
            return [
                'id' => $app->id,
                'student_name' => $app->student->name,
                'student_email' => $app->student->email,
                'status' => $app->status,
                'cover_letter' => $app->cover_letter,
                'created_at' => $app->created_at,
                'internship_title' => $app->internship->title,
            ];
        });
        
        return response()->json($applications);
    }

    // Update application status
    public function updateApplicationStatus(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $organization = $request->user()->organizationProfile;

        if ($application->internship->organisation_id !== $organization->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,accepted,rejected',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $application->status = $request->status;
        $application->save();
        
        return response()->json([
            'message' => 'Application status updated',
            'application' => $application
        ]);
    }

    // Get internship stats
    public function stats(Request $request)
    {
        $organization = $request->user()->organizationProfile;
        
        if (!$organization) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }
        
        // Change 'organization_id' to 'organisation_id'
        $internships = Internship::where('organisation_id', $organization->id)->get();
        $applications = Application::whereHas('internship', function($query) use ($organization) {
            $query->where('organisation_id', $organization->id);
        })->get();
        
        return response()->json([
            'total_internships' => $internships->count(),
            'active_internships' => $internships->where('status', 'open')->count(),
            'total_applications' => $applications->count(),
            'pending_applications' => $applications->where('status', 'pending')->count(),
            'accepted_applications' => $applications->where('status', 'accepted')->count(),
            'rejected_applications' => $applications->where('status', 'rejected')->count(),
        ]);
    }
}