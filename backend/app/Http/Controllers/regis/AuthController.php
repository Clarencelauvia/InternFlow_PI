<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\OrganizationProfile;
use App\Models\UniversityProfile;
use App\Models\Department;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function registerStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,NULL,id,role,student',
            'contact' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
            'university' => 'required|string|max:255',
            'university_id' => 'nullable|integer|exists:university_profiles,id',
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
            $verificationCode = Str::random(6);
            
            $user = User::create([
                'name' => $request->fullName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'contact' => $request->contact,
                'status' => 'active',
                // 'verification_code' => $verificationCode,
                'email_verified_at' => now(),
            ]);

            $universityId = $request->university_id;
            $universityStatus = $universityId ? 'pending' : null;

            StudentProfile::create([
                'user_id' => $user->id,
                'university' => $request->university,
                'university_id' => $universityId,
                'university_status' => $universityStatus,
                'department' => $request->department,
                'course' => $request->course,
                'year' => $request->year,
                'student_id' => $request->studentID,
                'guardian_name' => $request->guardianName,
                'guardian_contact' => $request->guardianContact,
            ]);

            // Notify the university if the student picked a verified one
            if ($universityId) {
                $universityProfile = \App\Models\UniversityProfile::find($universityId);
                if ($universityProfile && $universityProfile->user_id) {
                    \App\Models\UserNotification::create([
                        'user_id' => $universityProfile->user_id,
                        'type' => 'student_confirmation_request',
                        'title' => 'Nouvelle demande de confirmation',
                        'message' => "{$user->name} ({$request->course}, {$request->year}) s'est inscrit en tant qu'étudiant de votre université. Confirmez ou rejetez ce profil depuis votre tableau de bord.",
                        'data' => ['student_user_id' => $user->id],
                    ]);
                }
            }


            DB::commit();

            return response()->json([
                'message' => 'Student registered successfully.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
                ]);
            return response()->json([
                'error' => 'Registration failed', 
                'details' => $e->getMessage()], 500);
        }
    }

public function registerOrganization(Request $request)
{
    $validator = Validator::make($request->all(), [
        'organisationName' => 'required|string|max:255',
        'domain' => 'required|string|max:255',
        'officialEmail' => 'required|email|max:255|unique:users,email,NULL,id,role,organization',
        'location' => 'required|string|max:255',
        'postalCode' => 'required|string|max:20',
        'officialNumber' => 'required|string|max:20',
        'password' => 'required|string|min:6|confirmed',
        'departments' => 'required|array|min:1',
        'departments.*' => 'string',
        'projects' => 'array',
        'projects.*' => 'string',
        'adminName' => 'required|string|max:255',
        'adminContact' => 'required|string|max:20',
        'adminRole' => 'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    DB::beginTransaction();

    try {
        $verificationCode = Str::random(6);
        $companyCode = 'COMP-' . strtoupper(Str::random(8));
        
        // Create user with admin email (for login)
        $user = User::create([
            'name' => $request->adminName,
            'email' => $request->officialEmail, // This is the login email
            'password' => Hash::make($request->password),
            'role' => 'organization',
            'contact' => $request->adminContact,
            'status' => 'pending',
            'verification_code' => $verificationCode,
            'email_verified_at' => null,
        ]);

        // Create organization profile with all basic fields
        $organization = OrganizationProfile::create([
            'user_id' => $user->id,
            'organisation_name' => $request->organisationName,
            'domain' => $request->domain,
            'official_email' => $request->officialEmail,
            'location' => $request->location,
            'postal_code' => $request->postalCode,
            'official_number' => $request->officialNumber,
            'company_code' => $companyCode,
            'contact_person_name' => $request->adminName,
            'contact_person_role' => $request->adminRole,
            'recruitment_email' => $request->officialEmail, // Default to admin email
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

        // Send verification email
        try {
            Mail::send('organization_verification', [
                'name' => $user->name,
                'code' => $verificationCode,
                'companyCode' => $companyCode,
                'companyName' => $request->organisationName,
                'email' => $user->email
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('InternFlow - Vérifiez votre compte entreprise');
            });
        } catch (\Exception $mailError) {
            \Log::error('Email failed: ' . $mailError->getMessage());
        }

        DB::commit();

        return response()->json([
            'message' => 'Organization registered successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'organization_profile' => $organization,
            'company_code' => $companyCode,
            'verification_code' => $verificationCode 
        ], 201);
        
    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Organization registration failed', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Registration failed', 'details' => $e->getMessage()], 500);
    }
}

public function completeOrganizationProfile(Request $request)
{
    $user = $request->user();
    
    if ($user->role !== 'organization') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    
    $organization = $user->organizationProfile;
    
    if (!$organization) {
        return response()->json(['error' => 'Organization profile not found'], 404);
    }
    
    $validator = Validator::make($request->all(), [
        'sector' => 'nullable|string|max:255',
        'company_size' => 'nullable|string|max:255',
        'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
        'website' => 'nullable|url|max:255',
        'mission_statement' => 'nullable|string',
        'recruitment_email' => 'nullable|email|max:255',
        'contact_person_name' => 'nullable|string|max:255',
        'contact_person_role' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'social_links' => 'nullable|array',
        'social_links.linkedin' => 'nullable|url',
        'social_links.twitter' => 'nullable|url',
        'social_links.facebook' => 'nullable|url',
        'social_links.instagram' => 'nullable|url',
    ]);
    
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    
    try {
        $organization->update($request->only([
            'sector',
            'company_size',
            'founded_year',
            'website',
            'mission_statement',
            'recruitment_email',
            'contact_person_name',
            'contact_person_role',
            'description',
        ]));
        
        if ($request->has('social_links')) {
            $organization->social_links = array_merge(
                $organization->social_links ?? [],
                array_filter($request->social_links)
            );
            $organization->save();
        }
        
        return response()->json([
            'message' => 'Organization profile completed successfully',
            'organization_profile' => $organization
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Profile completion failed', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to update profile', 'details' => $e->getMessage()], 500);
    }
}
 
public function verifyOrganisation(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email|exists:users,email',
        'code' => 'required|string|size:6',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = User::where('email', $request->email)
                ->where('role', 'organization')
                ->where('verification_code', $request->code)
                ->first();

    if (!$user) {
        return response()->json(['error' => 'Invalid verification code'], 400);
    }

    $user->email_verified_at = now();
    $user->status = 'active';
    $user->verification_code = null;
    $user->save();

    return response()->json([
        'message' => 'Email verified successfully. You can now login.'
    ]);
}

    public function registerUniversity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'universityName' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:university_profiles,domain',
            'location' => 'required|string|max:255',
            'postalCode' => 'required|string|max:20',
            'officialNumber' => 'required|string|max:50',
            'password' => 'required|string|min:6|confirmed',
            'departments' => 'required|array|min:1',
            'departments.*' => 'string',
            'adminName' => 'required|string|max:255',
            'adminEmail' => 'required|string|email|max:255|unique:users,email,NULL,id,role,university',
            'adminContact' => 'required|string|max:50',
            'adminRole' => 'required|string|max:255',
            'institutionCode' => 'required|string|unique:university_profiles,institution_code',
        ]);

        if ($validator->fails()) {
            return response()->json([
            'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $verificationCode = Str::random(6);
            
            $user = User::create([
                'name' => $request->adminName,
                'email' => $request->adminEmail,
                'password' => Hash::make($request->password),
                'role' => 'university',
                'contact' => $request->adminContact,
                'status' => 'pending',
                'verification_code' => $verificationCode,
                'email_verified_at' => null,
            ]);

            // Extract city from location (assuming format "City, Country")
            $locationParts = explode(',', $request->location);
            $city = trim($locationParts[0]);
            $country = isset($locationParts[1]) ? trim($locationParts[1]) : '';

            $university = UniversityProfile::create([
                'user_id' => $user->id,
                'university_name' => $request->universityName,
                'domain' => $request->domain,
                'location' => $request->location,
                'city' => $city,
                'country' => $country,
                'postal_code' => $request->postalCode,
                'official_number' => $request->officialNumber,
                'institution_code' => $request->institutionCode,
                'contact_email' => $request->adminEmail,
                'contact_phone' => $request->adminContact,
            ]);

            // Attach departments
            foreach ($request->departments as $deptName) {
                $department = Department::firstOrCreate(
                    ['name' => $deptName, 'type' => 'university']
                );
                $university->departments()->attach($department->id);
            }

            // Send verification email
    try{
                Mail::send('verification', [
                'name' => $user->name,
                'code' => $verificationCode,
                'role' => 'university'
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Bienvenue sur InternFlow - Vérifiez votre compte université');
            });
    }
    catch (\Exception $mailError) {
                \Log::error('Email failed: ' . $mailError->getMessage());
            }

            DB::commit();

            return response()->json([
                'message' => 'University registered successfully. Please check your email for verification code.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'verification_code' => $verificationCode
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('University registration failed', 
            ['error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
            ]);
            return response()->json(
                ['error' => 'Registration failed', 
                'details' => $e->getMessage()], 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('verification_code', $request->code)
                    ->first();

        if (!$user) {
            return response()->json(['error' => 'Invalid verification code'], 400);
        }

        $user->email_verified_at = now();
        $user->status = 'active';
        $user->verification_code = null;
        $user->save();

        return response()->json([
            'message' => 'Email verified successfully. You can now login.'
        ]);
    }

    public function resendVerificationCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json(['error' => 'Email already verified'], 400);
        }

        $newCode = Str::random(6);
        $user->verification_code = $newCode;
        $user->save();

        Mail::send('verification', [
            'name' => $user->name,
            'code' => $newCode,
            'role' => $user->role
        ], function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('InternFlow - Nouveau code de vérification');
        });

        return response()->json([
            'message' => 'New verification code sent to your email'
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
            'role' => 'sometimes|string|in:student,organization,university'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = User::where('email', $request->email);
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        $user = $query->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if (in_array($user->role, ['organization', 'university'], true) && !$user->email_verified_at) {
            return response()->json([
                'error' => 'Please verify your email first. Check your inbox for the verification code.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'error' => 'Your account is pending verification. Please verify your email first.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json(['error' => 'Account is not active. Please contact support.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $user->load('studentProfile', 'organizationProfile', 'universityProfile');

            $companyCode = $user->role === 'organization' && $user->organizationProfile 
            ? $user->organizationProfile->company_code 
            : null;
        

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
            'organization_profile' => $user->organizationProfile,
            'university_profile' => $user->universityProfile,
            'company_code' => $companyCode,
            'profile_complete' => $user->studentProfile ? true : false,
            'token' => $token,
            
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $resetToken = Str::random(60);

        // Store reset token in database (create password_resets table)
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $resetToken, 'created_at' => now()]
        );

        Mail::send('reset_password', [
            'name' => $user->name,
            'token' => $resetToken,
            'email' => $user->email
        ], function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('InternFlow - Réinitialisation de mot de passe');
        });

        return response()->json([
            'message' => 'Password reset link sent to your email'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset || now()->diffInMinutes($reset->created_at) > 60) {
            return response()->json(['error' => 'Invalid or expired token'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password reset successfully'
        ]);
    }
}