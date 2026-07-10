<?php

namespace App\Services;

use App\Models\EmployeeProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EmployeeService extends BaseService
{
    public function index(): mixed
    {
        return User::with(['profile.designation', 'profile.department', 'roles'])
            ->whereHas('roles', fn($q) => $q->whereNotIn('name', ['admin', 'hr', 'employer']))
            ->get();
    }

    public function show(User $employee): array
    {
        $employee->load(['profile.designation', 'profile.department', 'roles', 'leaveBalance']);

        $month = Carbon::now()->month;
        $year = Carbon::now()->year;

        $attendances = $employee->attendances()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        return [
            'employee' => $employee,
            'attendance_stats' => [
                'present' => $attendances->where('status', 'present')->count(),
                'absent' => $attendances->where('status', 'absent')->count(),
                'late' => $attendances->where('status', 'late')->count(),
                'half_day' => $attendances->where('status', 'half_day')->count(),
            ],
        ];
    }

    public function store(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->assignRole($data['role']);

        $lastProfile = EmployeeProfile::orderBy('id', 'desc')->first();
        $nextId = $lastProfile ? $lastProfile->id + 1 : 1;
        $employeeId = 'Emp-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        $user->profile()->create([
            'employee_id' => $employeeId,
            'designation_id' => $data['designation_id'],
            'department_id' => $data['department_id'] ?? null,
            'salary' => $data['salary'],
            'join_date' => $data['join_date'],
            'employment_status' => $data['employment_status'],
            'probation_end_date' => $data['probation_end_date'] ?? null,
        ]);

        return $user->load('profile.designation', 'roles');
    }

    public function update(array $data, User $employee): User
    {
        if ($employee->profile) {
            $employee->profile->update($data);
        } else {
            $employee->profile()->create($data);
        }

        return $employee->load('profile.designation');
    }

    public function updateAvatar(Request $request): array
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return [
            'avatar_url' => asset('storage/' . $path),
        ];
    }

    public function updateSelf(Request $request): User
    {
        $user = $request->user();

        if ($request->filled('name')) {
            $user->update(['name' => $request->name]);
        }

        if ($request->filled('about_me')) {
            if ($user->profile) {
                $user->profile->update(['about_me' => $request->about_me]);
            } else {
                $user->profile()->create(['about_me' => $request->about_me]);
            }
        }

        return $user->load('profile');
    }
}
