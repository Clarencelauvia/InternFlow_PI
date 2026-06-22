<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'studentProfile',
            'organizationProfile.departments',
            'organizationProfile.projects',
            'universityProfile.departments',
        ]);

        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'contact' => 'string|max:20',
            'current_password' => 'required_with:new_password',
            'new_password' => 'string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        if ($request->has('contact')) {
            $user->contact = $request->contact;
        }
        
        if ($request->has('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['error' => 'Current password is incorrect'], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

public function completeProfile(Request $request)
{
    $user = $request->user();
    
    if ($user->role !== 'student') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    
    $studentProfile = $user->studentProfile;
    
    if (!$studentProfile) {
        return response()->json(['error' => 'Student profile not found'], 404);
    }
    
    $validator = Validator::make($request->all(), [
        'location' => 'nullable|string|max:255',
        'bio' => 'nullable|string',
        'skills' => 'nullable|string',
        'preferred_work_type' => 'nullable|string|in:remote,hybrid,onsite',
        'internship_type' => 'nullable|string|in:professionnel,academique',
        'preferred_duration_min' => 'nullable|integer|min:1',
        'preferred_duration_max' => 'nullable|integer|min:1',
        'languages' => 'nullable|string',
        'linkedin_url' => 'nullable|url',
        'github_url' => 'nullable|url',
        'portfolio_url' => 'nullable|url',
    ]);
    
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    
    try {
        $studentProfile->update($request->only([
            'location', 'bio', 'skills', 'preferred_work_type', 
            'internship_type', 'preferred_duration_min', 'preferred_duration_max',
            'languages', 'linkedin_url', 'github_url', 'portfolio_url'
        ]));
        
        // Return the updated profile with all data
        return response()->json([
            'message' => 'Profile completed successfully',
            'student_profile' => $studentProfile->fresh(),
            'user' => $user
        ]);
    } catch (\Exception $e) {
        Log::error('Profile completion failed: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to update profile'], 500);
    }
}

    public function uploadProfilePicture(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'student_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()], 422);
        }

        try {
            $user = User::with('studentProfile')->find($request->student_id);
            
            if (!$user->studentProfile) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            $file = $request->file('profile_picture');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('profile_pictures', $filename, 'public');

            $user->studentProfile->update([
                'profile_picture' => $path
            ]);

            return response()->json([
                'message' => 'Profile picture uploaded successfully',
                'path' => asset('storage/' . $path)
            ]);
        } catch (\Exception $e) {
        \Log::error('Profile picture upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
                ]);
            return response()->json([
                'error' => 'Upload failed', 
                'details' => $e->getMessage()], 500);
        }
    }

public function uploadOrganizationLogo(Request $request)
{
    $validator = Validator::make($request->all(), [
        'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    try {
        $user = $request->user();
        
        if (!$user->organizationProfile) {
            return response()->json(['error' => 'Organization profile not found'], 404);
        }

        $file = $request->file('logo');
        $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('organization_logos', $filename, 'public');

        $user->organizationProfile->update([
            'logo_path' => $path
        ]);

        return response()->json([
            'message' => 'Logo uploaded successfully',
            'path' => asset('storage/' . $path)
        ]);
    } catch (\Exception $e) {
        \Log::error('Logo upload failed', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Upload failed', 'details' => $e->getMessage()], 500);
    }
}

    public function uploadUniversityLogo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'university_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = User::find($request->university_id);
            
            if (!$user->universityProfile) {
                return response()->json(['error' => 'University profile not found'], 404);
            }

            $file = $request->file('logo');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('university_logos', $filename, 'public');

            $user->universityProfile->update([
                'logo_path' => $path
            ]);

            return response()->json([
                'message' => 'University logo uploaded successfully',
                'path' => asset('storage/' . $path)
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed', 'details' => $e->getMessage()], 500);
        }
    }


public function uploadResume(Request $request)
{
    $validator = Validator::make($request->all(), [
        'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5 MB
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = $request->user();

    if (!$user->studentProfile) {
        return response()->json(['error' => 'Student profile not found'], 404);
    }

    try {
        $file = $request->file('resume');
        $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('resumes', $filename, 'public');

        $user->studentProfile->update(['resume_path' => $path]);

        return response()->json([
            'message' => 'CV téléversé avec succès',
            'resume_path' => $path,
            'resume_url' => asset('storage/' . $path),
        ]);
    } catch (\Exception $e) {
        \Log::error('Resume upload failed: ' . $e->getMessage());
        return response()->json(['error' => 'Upload failed', 'details' => $e->getMessage()], 500);
    }
}
}