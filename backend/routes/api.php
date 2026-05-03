<?php

use App\Http\Controllers\regis\AuthController;
use App\Http\Controllers\regis\internshipController;
use App\Http\Controllers\regis\profileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\regis\OrganisationController;


// Public routes
Route::post('/register/student', [AuthController::class, 'registerStudent']);
Route::post('/register/organization', [AuthController::class, 'registerOrganization']);
Route::post('/register/university', [AuthController::class, 'registerUniversity']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/upload/profile-picture', [ProfileController::class, 'uploadProfilePicture']);
Route::post('/upload/organization-logo', [ProfileController::class, 'uploadOrganizationLogo']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/complete', [ProfileController::class, 'completeProfile']);

    //profile for organisations
    Route::post('/organization/profile/complete', [AuthController::class, 'completeOrganizationProfile']);
    Route::get('/organization/internships', [OrganisationController::class, 'myInternships']);
    Route::get('/organization/applications', [OrganisationController::class, 'myApplications']);
    Route::put('/applications/{id}/status', [OrganisationController::class, 'updateApplicationStatus']);
    Route::get('/organization/stats', [OrganisationController::class, 'stats']);
  
    
       // Internships
    Route::get('/internships', [InternshipController::class, 'index']);
    Route::get('/internships/{id}', [InternshipController::class, 'show']);
    Route::post('/internships', [InternshipController::class, 'store']);
    Route::put('/internships/{id}', [InternshipController::class, 'update']);
    Route::delete('/internships/{id}', [InternshipController::class, 'destroy']);
    Route::post('/internships/{id}/apply', [InternshipController::class, 'apply']);
});