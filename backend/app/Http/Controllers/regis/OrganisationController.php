<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OrganisationController extends Controller
{
    // Get organisation's internships
public function myInternships(Request $request)
{
    try {
        $organization = $request->user()->organizationProfile;
        
        if (!$organization) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }
        
        $internships = Internship::where('organisation_id', $organization->id)
            ->withCount('applications')
            ->latest()
            ->get();
        
        return response()->json($internships);
    } catch (\Exception $e) {
        Log::error('Error fetching organization internships: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch internships'], 500);
    }
}

    // Get applications for organization's internships
public function myApplications(Request $request)
{
    try {
        $organization = $request->user()->organizationProfile;

        if (!$organization) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }

        $internshipIds = Internship::where('organisation_id', $organization->id)->pluck('id');

        if ($internshipIds->isEmpty()) {
            return response()->json([]);
        }

        $applications = Application::whereIn('internship_id', $internshipIds)
            ->with(['student.studentProfile', 'internship'])
            ->latest()
            ->get();

        $formattedApplications = $applications->map(function ($app) {
            $sp = $app->student?->studentProfile;

            return [
                'id' => $app->id,
                'student_name' => $app->student?->name ?? 'Unknown',
                'student_email' => $app->student?->email ?? 'Unknown',
                'status' => $app->status,
                'cover_letter' => $app->cover_letter,
                'message' => $app->message,
                'availability_confirmed' => (bool) $app->availability_confirmed,
                'available_from' => $app->available_from,
                'created_at' => $app->created_at,
                'internship_title' => $app->internship?->title ?? 'Unknown',
                'student_profile' => $sp ? [
                    'university' => $sp->university,
                    'department' => $sp->department,
                    'course' => $sp->course,
                    'year' => $sp->year,
                    'skills' => $sp->skills,
                    'resume_url' => $sp->resume_path ? asset('storage/' . $sp->resume_path) : null,
                    'linkedin_url' => $sp->linkedin_url,
                    'github_url' => $sp->github_url,
                    'portfolio_url' => $sp->portfolio_url,
                ] : null,
            ];
        });

        return response()->json($formattedApplications);

    } catch (\Exception $e) {
        Log::error('Error in myApplications: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch applications: ' . $e->getMessage()], 500);
    }
}
    // Update application status
    public function updateApplicationStatus(Request $request, $id)
    {
        try {
            $application = Application::findOrFail($id);
            $organization = $request->user()->organizationProfile;

            if (!$application->internship || $application->internship->organisation_id !== $organization->id) {
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
            
        } catch (\Exception $e) {
            Log::error('Error in updateApplicationStatus: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update status: ' . $e->getMessage()], 500);
        }
    }

    // Get internship stats
    public function stats(Request $request)
    {
        try {
            $organization = $request->user()->organizationProfile;
            
            if (!$organization) {
                return response()->json(['error' => 'Organization profile not found'], 404);
            }
            
            $internships = Internship::where('organisation_id', $organization->id)->get();
            $internshipIds = $internships->pluck('id');
            
            $applications = Application::whereIn('internship_id', $internshipIds)->get();
            
            return response()->json([
                'total_internships' => $internships->count(),
                'active_internships' => $internships->where('status', 'open')->count(),
                'total_applications' => $applications->count(),
                'pending_applications' => $applications->where('status', 'pending')->count(),
                'accepted_applications' => $applications->where('status', 'accepted')->count(),
                'rejected_applications' => $applications->where('status', 'rejected')->count(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch stats: ' . $e->getMessage()], 500);
        }
    }
}