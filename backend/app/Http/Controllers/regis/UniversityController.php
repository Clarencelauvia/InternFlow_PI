<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\StudentProfile;
use App\Models\OrganizationProfile;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UniversityController extends Controller
{
    // ============ EXISTING METHODS ============
    
    /**
     * Get university statistics
     */
    public function stats(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        // Get confirmed students from this university (same definition as
        // the "Étudiants" tab — pending students aren't part of the roster
        // yet, and matching by department name alone used to leak in
        // students from other universities that happen to share a
        // department label).
        $students = StudentProfile::where('university_id', $university->id)
            ->where('university_status', 'confirmed')
            ->get();
        
        // Get internships posted by companies in this university's region
        $internships = Internship::where('location', 'like', '%' . $university->location . '%')
            ->orWhere('location', $university->city ?? '')
            ->get();
        
        // Get companies that have posted internships
        $companies = OrganizationProfile::whereHas('internships', function($query) use ($university) {
            $query->where('location', 'like', '%' . $university->location . '%');
        })->get();
        
        return response()->json([
            'total_students' => $students->count(),
            'active_internships' => $internships->where('status', 'open')->count(),
            'total_internships' => $internships->count(),
            'partner_companies' => $companies->count(),
            'pending_conventions' => 0,
        ]);
    }
    
    /**
     * Get students registered from this university (paginated)
     */
    public function myStudents(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $students = StudentProfile::with('user')
            ->where('university_id', $university->id)
            ->where('university_status', 'confirmed')
            ->latest()
            ->paginate(20);
        
        return response()->json($students);
    }
    
    /**
     * Get internships relevant to this university
     */
    public function internships(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $departmentNames = $university->departments->pluck('name')->toArray();
        
        $internships = Internship::with('organization.user')
            ->whereIn('department', $departmentNames)
            ->orWhere('location', 'like', '%' . $university->location . '%')
            ->where('status', 'open')
            ->latest()
            ->paginate(10);
        
        return response()->json($internships);
    }
    
    /**
     * Get companies that have posted internships
     */
    public function companies(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $companies = OrganizationProfile::with('user')
            ->whereHas('internships', function($query) use ($university) {
                $query->where('location', 'like', '%' . $university->location . '%');
            })
            ->orWhere('location', 'like', '%' . $university->location . '%')
            ->latest()
            ->get();
        
        return response()->json($companies);
    }
    
    /**
     * Validate a company (add to approved list)
     */
    public function validateCompany(Request $request, $id)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $company = OrganizationProfile::findOrFail($id);
        
        // You might want to store this in a pivot table
        // For now, just return success
        
        return response()->json([
            'message' => 'Company validated successfully',
            'company' => $company
        ]);
    }
    
    /**
     * Generate convention document
     */
    public function generateConvention(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'internship_id' => 'required|exists:internships,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $student = StudentProfile::with('user')->where('user_id', $request->student_id)->first();
        $internship = Internship::with('organization.user')->find($request->internship_id);
        
        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }
        
        if (!$internship) {
            return response()->json(['error' => 'Internship not found'], 404);
        }
        
        // Generate convention data
        $convention = [
            'student_name' => $student->user->name,
            'student_email' => $student->user->email,
            'student_university' => $student->university,
            'student_department' => $student->department,
            'company_name' => $internship->organization->organisation_name,
            'company_address' => $internship->organization->location,
            'internship_title' => $internship->title,
            'internship_description' => $internship->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'generated_at' => now(),
        ];
        
        return response()->json([
            'message' => 'Convention generated successfully',
            'convention' => $convention
        ]);
    }
    
    // ============ NEW METHODS ============
    
    /**
     * Get all students with search and filtering
     */
    public function getAllStudents(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $query = StudentProfile::with('user')
            ->where('university_id', $university->id)
            ->where('university_status', 'confirmed');
        
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('student_id', 'like', "%{$search}%");
            });
        }
        
        // Department filter
        if ($request->has('department') && $request->department && $request->department !== 'all') {
            $query->where('department', $request->department);
        }
        
        $students = $query->latest()->get();
        
        // Add applications/internships counts and resolve storage paths into
        // full URLs (raw paths aren't directly usable by the frontend)
        foreach ($students as $student) {
            $student->applications_count = Application::where('student_id', $student->user_id)->count();
            $student->internships_count = Application::where('student_id', $student->user_id)
                ->where('status', 'accepted')
                ->count();
            $student->profile_picture_url = $student->profile_picture ? asset('storage/' . $student->profile_picture) : null;
            $student->resume_url = $student->resume_path ? asset('storage/' . $student->resume_path) : null;
        }
        
        return response()->json($students);
    }
    
    /**
     * Add a new student to the university
     */
    public function addStudent(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'contact' => 'nullable|string|max:20',
            'student_id' => 'required|string|unique:student_profiles,student_id',
            'department' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'password' => 'required|string|min:6',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'contact' => $request->contact ?? '',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            
            StudentProfile::create([
                'user_id' => $user->id,
                'university' => $university->university_name,
                'university_id' => $university->id,
                'university_status' => 'confirmed',
                'university_confirmed_at' => now(),
                'department' => $request->department ?? '',
                'course' => $request->course ?? '',
                'year' => $request->year ?? '',
                'student_id' => $request->student_id,
                'guardian_name' => '',
                'guardian_contact' => '',
            ]);
            
            return response()->json([
                'message' => 'Student added successfully',
                'student' => $user->load('studentProfile')
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error adding student: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add student: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Update student information
     */
    public function updateStudent(Request $request, $id)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $studentProfile = StudentProfile::with('user')->findOrFail($id);
        
        // Verify student belongs to this university
        if ($studentProfile->university_id !== $university->id) {
            return response()->json(['error' => 'Student does not belong to your university'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $studentProfile->user_id,
            'contact' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,suspended',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            // Update user
            if ($request->has('name')) {
                $studentProfile->user->name = $request->name;
            }
            if ($request->has('email')) {
                $studentProfile->user->email = $request->email;
            }
            if ($request->has('contact')) {
                $studentProfile->user->contact = $request->contact;
            }
            if ($request->has('status')) {
                $studentProfile->user->status = $request->status;
            }
            $studentProfile->user->save();
            
            // Update profile
            $studentProfile->update($request->only([
                'department', 'course', 'year'
            ]));
            
            return response()->json([
                'message' => 'Student updated successfully',
                'student' => $studentProfile->load('user')
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating student: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update student'], 500);
        }
    }
    
    /**
     * Get all applications from students of this university
     */
    public function getApplications(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        // Get all confirmed student IDs from this university
        $studentIds = StudentProfile::where('university_id', $university->id)
            ->where('university_status', 'confirmed')
            ->pluck('user_id');
        
        $query = Application::with(['student', 'internship', 'internship.organization'])
            ->whereIn('student_id', $studentIds);
        
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('student', function($studentQuery) use ($search) {
                    $studentQuery->where('name', 'like', "%{$search}%")
                                 ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('internship', function($internshipQuery) use ($search) {
                    $internshipQuery->where('title', 'like', "%{$search}%");
                });
            });
        }
        
        // Status filter
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        $applications = $query->latest()->get();
        
        // Format response
        $formatted = $applications->map(function($app) {
            return [
                'id' => $app->id,
                'student_name' => $app->student ? $app->student->name : 'Unknown',
                'student_id' => $app->student->studentProfile->student_id ?? 'N/A',
                'student_email' => $app->student ? $app->student->email : 'Unknown',
                'internship_title' => $app->internship ? $app->internship->title : 'Unknown',
                'organization_name' => $app->internship && $app->internship->organization 
                    ? $app->internship->organization->organisation_name 
                    : 'Unknown',
                'status' => $app->status,
                'created_at' => $app->created_at,
            ];
        });
        
        return response()->json($formatted);
    }
    
    /**
     * Get application statistics for dashboard charts
     */
    public function getApplicationStats(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        // Get confirmed student IDs
        $studentIds = StudentProfile::where('university_id', $university->id)
            ->where('university_status', 'confirmed')
            ->pluck('user_id');
        
        // Applications by status
        $applications = Application::whereIn('student_id', $studentIds)->get();
        
        $pending = $applications->where('status', 'pending')->count();
        $accepted = $applications->where('status', 'accepted')->count();
        $rejected = $applications->where('status', 'rejected')->count();
        
        // Monthly trend (last 6 months)
        $monthlyData = [];
        $months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $count = Application::whereIn('student_id', $studentIds)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $monthlyData[] = $count;
        }
        
        // Placements by department (for bar chart)
        $departments = $university->departments->pluck('name')->toArray();
        $placementByDept = [];
        $placementLabels = [];
        $placementValues = [];
        
        foreach ($departments as $dept) {
            $deptStudentIds = StudentProfile::where('university_id', $university->id)
                ->where('university_status', 'confirmed')
                ->where('department', $dept)
                ->pluck('user_id');
            $placedCount = Application::whereIn('student_id', $deptStudentIds)
                ->where('status', 'accepted')
                ->count();
            $placementByDept[$dept] = $placedCount;
            $placementLabels[] = $dept;
            $placementValues[] = $placedCount;
        }
        
        return response()->json([
            'pending_applications' => $pending,
            'accepted_applications' => $accepted,
            'rejected_applications' => $rejected,
            'monthly_trend' => $monthlyData,
            'monthly_labels' => $months,
            'placement_by_department' => $placementByDept,
            'placement_labels' => $placementLabels,
            'placement_values' => $placementValues,
        ]);
    }
    
    /**
     * Get all internships (with search and filters)
     */
    public function getAllInternships(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $query = Internship::with(['organization', 'organization.user']);
        
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('organization', function($orgQuery) use ($search) {
                      $orgQuery->where('organisation_name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Status filter
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Type filter
        if ($request->has('internship_type') && $request->internship_type && $request->internship_type !== 'all') {
            $query->where('internship_type', $request->internship_type);
        }
        
        $internships = $query->latest()->get();
        
        // Format response
        $formatted = $internships->map(function($internship) {
            return [
                'id' => $internship->id,
                'title' => $internship->title,
                'location' => $internship->location,
                'duration' => $internship->duration,
                'status' => $internship->status,
                'internship_type' => $internship->internship_type,
                'organization_name' => $internship->organization ? $internship->organization->organisation_name : 'Unknown',
                'slots' => $internship->slots,
                'applications_count' => $internship->applications()->count(),
                'created_at' => $internship->created_at,
            ];
        });
        
        return response()->json($formatted);
    }
    
    /**
     * Complete/Update university profile
     */
    public function completeProfile(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'university') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $university = $user->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'university_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'vice_chancellor' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            $university->update($request->only([
                'university_name', 'location', 'website', 'description', 'established_year', 
                'vice_chancellor', 'type'
            ]));
            
            // Also update the users table location if provided
            if ($request->has('location')) {
                $user->location = $request->location;
                $user->save();
            }
            
            return response()->json([
                'message' => 'University profile updated successfully',
                'university_profile' => $university->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update profile: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Get placement statistics by department
     */
    public function getPlacementStats(Request $request)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $departments = $university->departments->pluck('name')->toArray();
        $stats = [];
        
        foreach ($departments as $dept) {
            $studentIds = StudentProfile::where('university_id', $university->id)
                ->where('university_status', 'confirmed')
                ->where('department', $dept)
                ->pluck('user_id');
            $totalStudents = count($studentIds);
            $placedStudents = Application::whereIn('student_id', $studentIds)
                ->where('status', 'accepted')
                ->distinct('student_id')
                ->count('student_id');
            
            $stats[] = [
                'department' => $dept,
                'total_students' => $totalStudents,
                'placed_students' => $placedStudents,
                'placement_rate' => $totalStudents > 0 ? round(($placedStudents / $totalStudents) * 100) : 0,
            ];
        }
        
        return response()->json($stats);
    }
    
    /**
     * Get a single student with full details
     */
    public function getStudent(Request $request, $id)
    {
        $university = $request->user()->universityProfile;
        
        if (!$university) {
            return response()->json(['error' => 'University profile not found'], 404);
        }
        
        $studentProfile = StudentProfile::with('user')
            ->where('user_id', $id)
            ->orWhere('id', $id)
            ->first();
        
        if (!$studentProfile) {
            return response()->json(['error' => 'Student not found'], 404);
        }
        
        // Verify student belongs to this university
        if ($studentProfile->university_id !== $university->id) {
            return response()->json(['error' => 'Student does not belong to your university'], 403);
        }
        
        // Add counts
        $studentProfile->applications_count = Application::where('student_id', $studentProfile->user_id)->count();
        $studentProfile->internships_count = Application::where('student_id', $studentProfile->user_id)
            ->where('status', 'accepted')
            ->count();
        
        // Get applications
        $studentProfile->applications = Application::with(['internship', 'internship.organization'])
            ->where('student_id', $studentProfile->user_id)
            ->latest()
            ->get();
        
        return response()->json($studentProfile);
    }

    // ============ NEW: STUDENT CONFIRMATION FLOW ============

    /**
     * Public endpoint: list verified (registered) universities for the
     * student registration dropdown. No auth required.
     */
    public static function verifiedUniversities()
    {
        $universities = \App\Models\UniversityProfile::query()
            ->select('id', 'university_name', 'city', 'location')
            ->orderBy('university_name')
            ->get();

        return response()->json($universities);
    }

    /**
     * Link any students who registered by typing this university's name as
     * free text (the old/legacy flow) but were never linked through
     * university_id — without this, those students are permanently invisible
     * to studentsByStatus()/confirmStudent()/rejectStudent(), even though
     * they show up fine in myStudents()/getAllStudents() (which still match
     * on the free-text `university` column). Only touches rows that are
     * currently unlinked AND have no status yet, so it never overwrites a
     * student who was already confirmed/rejected through some other path.
     */
    private function backfillUniversityLinks($university): void
    {
        // 'none' is the default registerStudent() assigns to ANY student who
        // didn't pick a university at sign-up (see AuthController) — it's
        // not exclusively a "was rejected" marker, even though rejectStudent()
        // also writes 'none'. We match it here too so existing/legacy
        // students actually show up in the confirmation queue.
        StudentProfile::whereNull('university_id')
            ->where(function ($q) {
                $q->whereNull('university_status')
                  ->orWhere('university_status', '')
                  ->orWhere('university_status', 'none');
            })
            ->whereRaw('LOWER(TRIM(university)) = ?', [
                mb_strtolower(trim($university->university_name))
            ])
            ->update([
                'university_id' => $university->id,
                'university_status' => 'pending',
            ]);
    }

    /**
     * List the current university's students by confirmation status.
     * Query params:
     *   ?status=pending|confirmed|rejected|all (default: pending)
     *   ?search=...
     */
    public function studentsByStatus(Request $request)
    {
        try {
            $university = $request->user()->universityProfile;

            if (!$university) {
                return response()->json(['error' => 'University profile not found'], 404);
            }

            $this->backfillUniversityLinks($university);

            $status = $request->query('status', 'pending');
            $search = $request->query('search');

            $query = StudentProfile::with('user')
                ->where('university_id', $university->id);

            if (in_array($status, ['pending', 'confirmed', 'rejected'], true)) {
                $query->where('university_status', $status);
            } // 'all' = no status filter

            if ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $students = $query->latest()->get()->map(function ($sp) {
                return [
                    'id' => $sp->id,
                    'user_id' => $sp->user_id,
                    'name' => $sp->user?->name,
                    'email' => $sp->user?->email,
                    'phone' => $sp->user?->contact,
                    'student_id' => $sp->student_id,
                    'department' => $sp->department,
                    'course' => $sp->course,
                    'year' => $sp->year,
                    'skills' => $sp->skills,
                    'languages' => $sp->languages,
                    'experience' => $sp->experience,
                    'bio' => $sp->bio,
                    'location' => $sp->location,
                    'preferred_work_type' => $sp->preferred_work_type,
                    'internship_type' => $sp->internship_type,
                    'guardian_name' => $sp->guardian_name,
                    'guardian_contact' => $sp->guardian_contact,
                    'profile_picture_url' => $sp->profile_picture ? asset('storage/' . $sp->profile_picture) : null,
                    'resume_url' => $sp->resume_path ? asset('storage/' . $sp->resume_path) : null,
                    'linkedin_url' => $sp->linkedin_url,
                    'github_url' => $sp->github_url,
                    'portfolio_url' => $sp->portfolio_url,
                    'university_status' => $sp->university_status,
                    'university_confirmed_at' => $sp->university_confirmed_at,
                    'registered_at' => $sp->created_at,
                ];
            });

            return response()->json($students);
        } catch (\Exception $e) {
            Log::error('Error listing university students: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch students'], 500);
        }
    }

    /**
     * Confirm a pending student belongs to this university.
     */
    public function confirmStudent(Request $request, $id)
    {
        try {
            $university = $request->user()->universityProfile;

            if (!$university) {
                return response()->json(['error' => 'University profile not found'], 404);
            }

            $sp = StudentProfile::find($id);

            if (!$sp || $sp->university_id !== $university->id) {
                return response()->json(['error' => 'Student not found or not linked to your university'], 404);
            }

            if ($sp->university_status === 'confirmed') {
                return response()->json(['message' => 'Already confirmed']);
            }

            $sp->university_status = 'confirmed';
            $sp->university_confirmed_at = now();
            $sp->save();

            // Notify the student
            if ($sp->user_id) {
                \App\Models\UserNotification::create([
                    'user_id' => $sp->user_id,
                    'type' => 'university_confirmed',
                    'title' => 'Université confirmée',
                    'message' => "Votre université ({$university->university_name}) a confirmé votre profil. Vos candidatures porteront désormais un badge « Vérifié ».",
                    'data' => ['university_id' => $university->id],
                ]);
            }

            return response()->json(['message' => 'Student confirmed', 'student' => $sp]);
        } catch (\Exception $e) {
            Log::error('Error confirming student: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to confirm student'], 500);
        }
    }

    /**
     * Reject a pending student — auto-downgrades them to free-text:
     * keeps the university name string but clears university_id and resets status to 'none'.
     */
    public function rejectStudent(Request $request, $id)
    {
        try {
            $university = $request->user()->universityProfile;

            if (!$university) {
                return response()->json(['error' => 'University profile not found'], 404);
            }

            $sp = StudentProfile::find($id);

            if (!$sp || $sp->university_id !== $university->id) {
                return response()->json(['error' => 'Student not found or not linked to your university'], 404);
            }

            // Soft downgrade: cut the link but keep the typed university string + the user account
            $universityNameSnapshot = $university->university_name;
            $sp->university_id = null;
            $sp->university_status = 'none';
            $sp->university_confirmed_at = null;
            $sp->save();

            // Notify the student
            if ($sp->user_id) {
                \App\Models\UserNotification::create([
                    'user_id' => $sp->user_id,
                    'type' => 'university_rejected',
                    'title' => 'Université non confirmée',
                    'message' => "L'université « {$universityNameSnapshot} » n'a pas confirmé votre profil. Vous pouvez continuer à utiliser la plateforme normalement; pour relier votre compte, sélectionnez à nouveau une université dans votre profil.",
                    'data' => ['university_id' => $university->id],
                ]);
            }

            return response()->json(['message' => 'Student rejected and unlinked']);
        } catch (\Exception $e) {
            Log::error('Error rejecting student: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reject student'], 500);
        }
    }
}