<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class internshipController extends Controller
{
        public function index()
    {
        $internships = Internship::with('organization.user')
            ->where('status', 'open')
            ->latest()
            ->paginate(10);
        
        return response()->json($internships);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
           'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'duration' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'slots' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

          $organization = $request->user()->organizationProfile;

        if (!$organization) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }

            $internship = Internship::create([
            'organisation_id' => $organization->id,
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'duration' => $request->duration,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'slots' => $request->slots,
        ]);

             return response()->json([
            'message' => 'Internship created successfully',
            'internship' => $internship,
        ], 201);
    }

    public function show($id){
               $internship = Internship::with(['organisation.user', 'applications.student'])->findOrFail($id);
        return response()->json($internship);
    }

    public function update(Request $request, $id)
    {
        $internship = Internship::findOrFail($id);

        // check autorisation 
        if ($request->user()->organizationProfile->id !== $internship->organization_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'string',
            'location' => 'string|max:255',
            'duration' => 'string|max:255',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'slots' => 'integer|min:1',
            'status' => 'in:open,closed,in_progress',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $internship->update($request->all());

        return response()->json([
            'message' => 'Internship updated successfully',
            'internship' => $internship,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $internship = Internship::findOrFail($id);

        // check autorisation 
        if ($request->user()->organizationProfile->id !== $internship->organization_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $internship->delete();

        return response()->json(['message' => 'Internship deleted successfully']);
    }

    public function apply($id)
    {
        $internship = Internship::findOrFail($id);
        
        if ($internship->status !== 'open') {
            return response()->json(['error' => 'Internship is not open for applications'], 400);
        }
              $existingApplication = Application::where('internship_id', $id)
            ->where('student_id', $request->user()->id)
            ->first();

        if ($existingApplication) {
            return response()->json(['error' => 'Already applied for this internship'], 400);
        }
         $validator = Validator::make($request->all(), [
            'cover_letter' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

              $application = Application::create([
            'internship_id' => $id,
            'student_id' => $request->user()->id,
            'cover_letter' => $request->cover_letter,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application,
        ], 201);
    }
}
