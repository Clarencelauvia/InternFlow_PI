<?php

use App\Http\Controllers\regis\AuthController;
use App\Http\Controllers\regis\internshipController;
use App\Http\Controllers\regis\profileController;
use App\Http\Controllers\regis\UniversityController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\regis\OrganisationController;

// Public route for authentication redirect
Route::get('/login', function() {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login');

// Public internships routes (NO AUTH REQUIRED)
Route::get('/internships', [internshipController::class, 'index']);
Route::get('/internships/{id}', [internshipController::class, 'show']);

// Public auth routes
Route::post('/register/student', [AuthController::class, 'registerStudent']);
Route::post('/register/organization', [AuthController::class, 'registerOrganization']);
Route::post('/register/university', [AuthController::class, 'registerUniversity']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-organization', [AuthController::class, 'verifyOrganisation']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerificationCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/upload/profile-picture', [ProfileController::class, 'uploadProfilePicture']);
Route::post('/upload/organization-logo', [ProfileController::class, 'uploadOrganizationLogo']);
Route::post('/upload/university-logo', [ProfileController::class, 'uploadUniversityLogo']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/complete', [ProfileController::class, 'completeProfile']);

    // Profile for organisations
    Route::post('/organization/profile/complete', [AuthController::class, 'completeOrganizationProfile']);
    Route::get('/organization/internships', [OrganisationController::class, 'myInternships']);
    Route::get('/organization/applications', [OrganisationController::class, 'myApplications']);
    Route::put('/applications/{id}/status', [OrganisationController::class, 'updateApplicationStatus']);
    Route::get('/organization/stats', [OrganisationController::class, 'stats']);
    
    // University routes
    Route::get('/university/stats', [UniversityController::class, 'stats']);
    Route::get('/university/students', [UniversityController::class, 'myStudents']);
    Route::get('/university/internships', [UniversityController::class, 'internships']);
    Route::post('/university/companies/validate/{id}', [UniversityController::class, 'validateCompany']);
    Route::get('/university/companies', [UniversityController::class, 'companies']);
    Route::post('/university/convention/generate', [UniversityController::class, 'generateConvention']);
    
    // Internships (protected actions - create, update, delete)
    Route::post('/internships', [internshipController::class, 'store']);
    Route::put('/internships/{id}', [internshipController::class, 'update']);
    Route::delete('/internships/{id}', [internshipController::class, 'destroy']);
    Route::post('/internships/{id}/apply', [internshipController::class, 'apply']);

    // Application route
    Route::get('/student/applications', [App\Http\Controllers\regis\ApplicationController::class, 
    'getStudentApplications']);

    Route::post('/messages', [MessageController::class, 'store']);
Route::get('/messages/inbox', [MessageController::class, 'inbox']);
Route::get('/messages/sent', [MessageController::class, 'sent']);
Route::patch('/messages/{id}/read', [MessageController::class, 'markAsRead']);
Route::get('/university/applications/stats', [UniversityController::class, 'getApplicationStats']);
});

// University routes (add these inside the auth:sanctum middleware group)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/upload/resume', [ProfileController::class, 'uploadResume']);
    
    // University routes - ADD THESE
    Route::get('/university/students/all', [UniversityController::class, 'getAllStudents']);
    Route::post('/university/students', [UniversityController::class, 'addStudent']);
    Route::put('/university/students/{id}', [UniversityController::class, 'updateStudent']);
    Route::get('/university/applications', [UniversityController::class, 'getApplications']);
    Route::get('/university/applications/stats', [UniversityController::class, 'getApplicationStats']);
    Route::get('/university/internships/all', [UniversityController::class, 'getAllInternships']);
    Route::post('/university/profile/complete', [UniversityController::class, 'completeProfile']);
    Route::get('/university/placement/stats', [UniversityController::class, 'getPlacementStats']);
});