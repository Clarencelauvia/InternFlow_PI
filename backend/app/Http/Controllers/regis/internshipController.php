<?php

namespace App\Http\Controllers\regis;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class InternshipController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Internship::with(['organization', 'organization.user'])
                ->where('status', '!=', 'archived');

            // Personalized filters for authenticated students
            if ($request->user() && $request->user()->role === 'student') {
                $studentProfile = $request->user()->studentProfile;

                if ($studentProfile) {
                    if ($studentProfile->location) {
                        $query->where('location', 'LIKE', '%' . $studentProfile->location . '%');
                    }
                    if ($studentProfile->internship_type) {
                        $query->where('internship_type', $studentProfile->internship_type);
                    }
                    if ($studentProfile->preferred_duration_min && $studentProfile->preferred_duration_max) {
                        $query->whereRaw(
                            "CAST(SUBSTRING_INDEX(duration, ' ', 1) AS UNSIGNED) BETWEEN ? AND ?",
                            [$studentProfile->preferred_duration_min, $studentProfile->preferred_duration_max]
                        );
                    }
                }
            }

            $internships = $query->latest()->get();

            $formattedInternships = $internships->map(function ($internship) {
                return [
                    'id' => $internship->id,
                    'title' => $internship->title,
                    'description' => $internship->description,
                    'location' => $internship->location,
                    'quartier' => $internship->quartier,
                    'latitude' => $internship->latitude,
                    'longitude' => $internship->longitude,
                    'duration' => $internship->duration,
                    'duration_months' => $this->extractDurationMonths($internship->duration),
                    'start_date' => $internship->start_date,
                    'end_date' => $internship->end_date,
                    'slots' => $internship->slots,
                    'status' => $internship->status,
                    'internship_type' => $internship->internship_type,
                    'payment_type' => $internship->payment_type,
                    'salary' => $internship->salary,
                    'department' => $internship->department,
                    'expires_at' => $internship->expires_at,
                    'requirements' => $internship->requirements,
                    'benefits' => $internship->benefits,
                    'created_at' => $internship->created_at,
                    'organization' => $internship->organization ? [
                        'organisation_name' => $internship->organization->organisation_name,
                        'location' => $internship->organization->location,
                        'logo_path' => $internship->organization->logo_path,
                    ] : null,
                ];
            });

            return response()->json($formattedInternships);

        } catch (\Exception $e) {
            Log::error('Error fetching internships: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to fetch internships: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'required|string|max:255',     // city
                'quartier' => 'required|string|max:255',     // neighborhood — now required
                'duration' => 'required|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'slots' => 'required|integer|min:1',
                'internship_type' => 'nullable|string|in:professionnel,academique',
                'payment_type' => 'nullable|string|in:paid,unpaid',
                'salary' => 'nullable|numeric',
                'department' => 'nullable|string',
                'expires_at' => 'nullable|date',
                'requirements' => 'nullable|string',
                'benefits' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $organization = $request->user()->OrganizationProfile;

            if (!$organization) {
                return response()->json(['error' => 'Organization profile not found'], 404);
            }

            // Precise geocode (quartier + city), falling back to city if the quartier doesn't resolve
            $coordinates = $this->geocodeLocation($request->quartier, $request->location);

            $internship = Internship::create([
                'organisation_id' => $organization->id,
                'title' => $request->title,
                'description' => $request->description,
                'location' => $request->location,
                'quartier' => $request->quartier,
                'latitude' => $coordinates['latitude'] ?? null,
                'longitude' => $coordinates['longitude'] ?? null,
                'duration' => $request->duration,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'slots' => $request->slots,
                'status' => 'open',
                'internship_type' => $request->internship_type,
                'payment_type' => $request->payment_type,
                'salary' => $request->payment_type === 'paid' ? $request->salary : null,
                'department' => $request->department,
                'expires_at' => $request->expires_at,
                'requirements' => $request->requirements,
                'benefits' => $request->benefits,
            ]);

            return response()->json([
                'message' => 'Internship created successfully',
                'internship' => $internship,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating internship: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to create internship: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $internship = Internship::with(['organization', 'organization.user'])->findOrFail($id);

            return response()->json([
                'id' => $internship->id,
                'title' => $internship->title,
                'description' => $internship->description,
                'location' => $internship->location,
                'quartier' => $internship->quartier,
                'latitude' => $internship->latitude,
                'longitude' => $internship->longitude,
                'duration' => $internship->duration,
                'start_date' => $internship->start_date,
                'end_date' => $internship->end_date,
                'slots' => $internship->slots,
                'status' => $internship->status,
                'internship_type' => $internship->internship_type,
                'payment_type' => $internship->payment_type,
                'salary' => $internship->salary,
                'department' => $internship->department,
                'requirements' => $internship->requirements,
                'benefits' => $internship->benefits,
                'expires_at' => $internship->expires_at,
                'created_at' => $internship->created_at,
                'organization' => $internship->organization ? [
                    'organisation_name' => $internship->organization->organisation_name,
                    'location' => $internship->organization->location,
                    'logo_path' => $internship->organization->logo_path,
                ] : null,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching internship: ' . $e->getMessage());
            return response()->json(['error' => 'Internship not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $internship = Internship::findOrFail($id);

            if ($request->user()->organizationProfile->id !== $internship->organisation_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // 1. Validate FIRST
            $validator = Validator::make($request->all(), [
                'title' => 'string|max:255',
                'description' => 'string',
                'location' => 'string|max:255',
                'quartier' => 'string|max:255',
                'duration' => 'string|max:255',
                'start_date' => 'date',
                'end_date' => 'date|after:start_date',
                'slots' => 'integer|min:1',
                'status' => 'in:open,closed,in_progress',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // 2. Take only known fields — never $request->all()
            $data = $request->only([
                'title', 'description', 'location', 'quartier', 'duration', 'start_date',
                'end_date', 'slots', 'status', 'internship_type', 'payment_type',
                'salary', 'department', 'expires_at', 'requirements', 'benefits',
            ]);

            // 3. Re-geocode if either the city or the quartier changed
            $locationChanged = $request->has('location') && $request->location !== $internship->location;
            $quartierChanged = $request->has('quartier') && $request->quartier !== $internship->quartier;

            if ($locationChanged || $quartierChanged) {
                $city = $request->input('location', $internship->location);
                $quartier = $request->input('quartier', $internship->quartier);
                $coordinates = $this->geocodeLocation($quartier, $city);
                $data['latitude'] = $coordinates['latitude'] ?? null;
                $data['longitude'] = $coordinates['longitude'] ?? null;
            }

            // 4. Single update
            $internship->update($data);

            return response()->json([
                'message' => 'Internship updated successfully',
                'internship' => $internship,
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating internship: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update internship'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $internship = Internship::findOrFail($id);

            if ($request->user()->organizationProfile->id !== $internship->organisation_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $internship->delete();

            return response()->json(['message' => 'Internship deleted successfully']);

        } catch (\Exception $e) {
            Log::error('Error deleting internship: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete internship'], 500);
        }
    }

public function apply(Request $request, $id)
{
    try {
        $internship = Internship::findOrFail($id);

        if ($internship->status !== 'open') {
            return response()->json(['error' => 'Internship is not open for applications'], 400);
        }

        if ($internship->expires_at && now()->greaterThan($internship->expires_at)) {
            return response()->json(['error' => 'La date limite de candidature est dépassée'], 400);
        }

        $student = $request->user();
        $studentProfile = $student->studentProfile;

        // Must-have: a CV on the profile
        if (!$studentProfile || !$studentProfile->resume_path) {
            return response()->json([
                'error' => 'Veuillez ajouter un CV à votre profil avant de postuler.'
            ], 422);
        }

        $existingApplication = Application::where('internship_id', $id)
            ->where('student_id', $student->id)
            ->first();

        if ($existingApplication) {
            return response()->json(['error' => 'Already applied for this internship'], 400);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => 'required|string|min:30',
            'message' => 'nullable|string|max:2000',
            'availability_confirmed' => 'accepted',   // must be true
            'available_from' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::create([
            'internship_id' => $id,
            'student_id' => $student->id,
            'cover_letter' => $request->cover_letter,
            'message' => $request->message,
            'availability_confirmed' => (bool) $request->availability_confirmed,
            'available_from' => $request->available_from,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application,
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error applying to internship: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to apply: ' . $e->getMessage()], 500);
    }
}

    /**
     * Parse "3 mois" / "6 months" -> 3 / 6. Returns 0 when no leading number exists.
     */
    private function extractDurationMonths(?string $duration): int
    {
        if (!$duration) {
            return 0;
        }
        preg_match('/\d+/', $duration, $matches);
        return isset($matches[0]) ? (int) $matches[0] : 0;
    }

    /**
     * Best-effort geocoding via OpenStreetMap Nominatim (free, no API key).
     * Tries the most precise query first (quartier + city + Cameroun), then falls
     * back to city-level so a pin always appears even when a small quartier isn't
     * in OSM. Returns [] only if every attempt fails.
     */
    private function geocodeLocation(?string $quartier, string $city): array
    {
        // Ordered from most precise to least; first hit wins.
        $queries = [];
        if ($quartier) {
            $queries[] = trim($quartier) . ', ' . trim($city) . ', Cameroun';
        }
        $queries[] = trim($city) . ', Cameroun';
        $queries[] = trim($city);

        foreach ($queries as $q) {
            try {
                $response = Http::withHeaders([
                    // Nominatim requires a real contact in the User-Agent — change this email.
                    'User-Agent' => 'InternFlow/1.0 (contact: support@internflow.example)',
                ])->timeout(15)->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $q,
                    'format' => 'json',
                    'limit' => 1,
                    'countrycodes' => 'cm', // bias to Cameroon
                ]);

                $results = $response->json();

                if ($response->successful() && !empty($results)) {
                    return [
                        'latitude' => (float) $results[0]['lat'],
                        'longitude' => (float) $results[0]['lon'],
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Geocoding failed for "' . $q . '": ' . $e->getMessage());
            }
        }

        return [];
    }
}