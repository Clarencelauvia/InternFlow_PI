<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class profileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'studentProfile',
            'organizationProfile.departments',
            'organizationProfile.projects',
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
        
        $validator = Validator::make($request->all(), [
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'preferred_work_type' => 'nullable|in:remote,onsite,hybrid',
            'internship_type' => 'nullable|in:professionnel,academique',
            'preferred_duration_min' => 'nullable|integer|min:1',
            'preferred_duration_max' => 'nullable|integer|min:1',
            'skills' => 'nullable|string',
            'languages' => 'nullable|string',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'portfolio_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $studentProfile = $user->studentProfile;
        
        if ($studentProfile) {
            $studentProfile->update($request->all());
        }

        return response()->json([
            'message' => 'Profile completed successfully',
            'profile' => $studentProfile
        ]);
    }

    public function uploadProfilePicture(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'student_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = User::find($request->student_id);
            
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
            return response()->json(['error' => 'Upload failed', 'details' => $e->getMessage()], 500);
        }
    }

    public function uploadOrganizationLogo(Request $request)
{
    $validator = Validator::make($request->all(), [
        'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        'organization_id' => 'required|exists:users,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    try {
        $user = User::find($request->organization_id);
        
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
        return response()->json(['error' => 'Upload failed', 'details' => $e->getMessage()], 500);
    }
}
}