<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\OrganizationProfile;
use App\Models\Department;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function registerStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'contact' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
            'university' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'studentID' => 'required|string|unique:student_profiles,student_id',
            'guardianName' => 'required|string|max:255',
            'guardianContact' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->fullName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'contact' => $request->contact,
                'status' => 'pending',
            ]);

            StudentProfile::create([
                'user_id' => $user->id,
                'university' => $request->university,
                'department' => $request->department,
                'course' => $request->course,
                'year' => $request->year,
                'student_id' => $request->studentID,
                'guardian_name' => $request->guardianName,
                'guardian_contact' => $request->guardianContact,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Student registered successfully',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed', 'details' => $e->getMessage()], 500);
        }
    }

    public function registerOrganization(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'organisationName' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:organization_profiles',
            'location' => 'required|string|max:255',
            'postalCode' => 'required|string|max:20',
            'officialNumber' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
            'departments' => 'required|array|min:1',
            'departments.*' => 'string',
            'projects' => 'array',
            'projects.*' => 'string',
            'adminName' => 'required|string|max:255',
            'adminEmail' => 'required|string|email|max:255|unique:users,email',
            'adminContact' => 'required|string|max:20',
            'adminRole' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->adminName,
                'email' => $request->adminEmail,
                'password' => Hash::make($request->password),
                'role' => 'organization',
                'contact' => $request->adminContact,
                'status' => 'active',
            ]);

            $organization = OrganizationProfile::create([
                'user_id' => $user->id,
                'organisation_name' => $request->organisationName,
                'domain' => $request->domain,
                'location' => $request->location,
                'postal_code' => $request->postalCode,
                'official_number' => $request->officialNumber,
            ]);

            // Attach departments
            foreach ($request->departments as $deptName) {
                $department = Department::firstOrCreate(
                    ['name' => $deptName, 'type' => 'organization']
                );
                $organization->departments()->attach($department->id);
            }

            // Attach projects
            if ($request->has('projects')) {
                foreach ($request->projects as $projectName) {
                    $project = Project::firstOrCreate(['name' => $projectName]);
                    $organization->projects()->attach($project->id);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Organization registered successfully',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed', 'details' => $e->getMessage()], 500);
        }
    }

   public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|string|email',
        'password' => 'required|string',
        'role' => 'sometimes|string|in:student,organization'
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    if ($request->has('role') && $user->role !== $request->role) {
        return response()->json(['error' => 'Invalid account type for this login page'], 403);
    }

    // if ($user->status !== 'active') {
    //     return response()->json(['error' => 'Account is not active. Please contact support.'], 403);
    // }

    $token = $user->createToken('auth_token')->plainTextToken;

     $user->load('studentProfile');
    
    $profileComplete = $user->studentProfile && 
        ($user->studentProfile->location || 
         $user->studentProfile->skills || 
         $user->studentProfile->preferred_work_type ||
         $user->studentProfile->experience ||
         $user->studentProfile->location ||
         $user->studentProfile->resume ||
         $user->studentProfile->bio ||
         $user->studentProfile->profile_image);

    return response()->json([
        'message' => 'Login successful',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'contact' => $user->contact,
            'status' => $user->status,
        ],
        'student_profile' => $user->studentProfile,
        'profile_complete' => $profileComplete,
        'token' => $token,
        'role' => $user->role,
    ]);
}

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function completeOrganizationProfile(Request $request)
{
    $user = $request->user();
    
    $validator = Validator::make($request->all(), [
        'sector' => 'nullable|string|max:255',
        'company_size' => 'nullable|string|max:255',
        'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
        'website' => 'nullable|url',
        'mission_statement' => 'nullable|string',
        'recruitment_email' => 'nullable|email',
        'contact_person_name' => 'nullable|string|max:255',
        'contact_person_role' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'social_links' => 'nullable|array',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $organizationProfile = $user->organizationProfile;
    
    if ($organizationProfile) {
        $organizationProfile->update($request->only([
            'sector', 'company_size', 'founded_year', 'website',
            'mission_statement', 'recruitment_email', 'contact_person_name',
            'contact_person_role', 'description'
        ]));
        
        if ($request->has('social_links')) {
            $organizationProfile->social_links = json_encode($request->social_links);
            $organizationProfile->save();
        }
    }

    return response()->json([
        'message' => 'Organization profile completed successfully',
        'profile' => $organizationProfile
    ]);
}
}