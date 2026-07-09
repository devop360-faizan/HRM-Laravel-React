<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = User::with(['profile.designation', 'profile.department', 'roles'])
            ->whereHas('roles', function ($q) {
                $q->whereNotIn('name', ['admin', 'hr', 'employer']);
            })
            ->get();
        return response()->json($employees);
    }

    public function show(User $employee)
    {
        $employee->load(['profile.designation', 'profile.department', 'roles', 'leaveBalance']);

        // Generate Chart Data (e.g. this month's attendance)
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;

        $attendances = $employee->attendances()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $chartData = [
            'present' => $attendances->where('status', 'present')->count(),
            'absent' => $attendances->where('status', 'absent')->count(),
            'late' => $attendances->where('status', 'late')->count(),
            'half_day' => $attendances->where('status', 'half_day')->count(),
        ];

        return response()->json([
            'employee' => $employee,
            'attendance_stats' => $chartData
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'designation_id' => 'required|exists:designations,id',
            'department_id' => 'nullable|exists:departments,id',
            'salary' => 'required|numeric',
            'join_date' => 'required|date',
            'employment_status' => 'required|in:probation,permanent',
            'probation_end_date' => 'nullable|date'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        $lastProfile = \App\Models\EmployeeProfile::orderBy('id', 'desc')->first();
        $nextId = $lastProfile ? $lastProfile->id + 1 : 1;
        $employeeId = 'Emp-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        $user->profile()->create([
            'employee_id' => $employeeId,
            'designation_id' => $validated['designation_id'],
            'department_id' => $validated['department_id'],
            'salary' => $validated['salary'],
            'join_date' => $validated['join_date'],
            'employment_status' => $validated['employment_status'],
            'probation_end_date' => $validated['probation_end_date'],
        ]);

        return response()->json(['message' => 'Employee created successfully', 'user' => $user->load('profile.designation', 'roles')]);
    }

    public function update(Request $request, User $employee)
    {
        $validated = $request->validate([
            'designation_id' => 'sometimes|exists:designations,id',
            'department_id' => 'sometimes|exists:departments,id',
            'salary' => 'sometimes|numeric',
            'employment_status' => 'sometimes|in:probation,permanent,terminated',
            'probation_end_date' => 'nullable|date',
            'about_me' => 'nullable|string'
        ]);

        if($employee->profile) {
            $employee->profile->update($validated);
        } else {
            $employee->profile()->create($validated);
        }

        return response()->json(['message' => 'Employee profile updated', 'user' => $employee->load('profile.designation')]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048'
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => asset('storage/' . $path)
        ]);
    }

    public function updateSelf(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'about_me' => 'nullable|string',
            'name' => 'sometimes|string|max:255'
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        if (isset($validated['about_me'])) {
            if ($user->profile) {
                $user->profile->update(['about_me' => $validated['about_me']]);
            } else {
                $user->profile()->create(['about_me' => $validated['about_me']]);
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('profile')
        ]);
    }
}
