<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;

class DashboardService extends BaseService
{
    public function analytics(): array
    {
        $today = Carbon::today()->toDateString();
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();

        $profiles = EmployeeProfile::whereHas('user', function ($q) {
            $q->whereHas('roles', fn($r) => $r->where('name', 'employee'));
        })->get();

        return [
            'employee_status' => $this->employeeStatus($profiles),
            'overview' => $this->overviewStats($profiles, $today, $startOfMonth),
            'leave_distribution' => $this->leaveDistribution(),
            'attendance_trend' => $this->attendanceTrend(),
            'department_distribution' => $this->departmentDistribution(),
            'late_arrivals' => $this->lateArrivalsToday($today),
            'pending_approvals' => $this->pendingApprovals(),
        ];
    }

    private function employeeStatus($profiles): array
    {
        return [
            'full_time' => $profiles->where('employment_status', 'permanent')->count(),
            'contract' => $profiles->where('employment_status', 'contract')->count(),
            'probation' => $profiles->where('employment_status', 'probation')->count(),
        ];
    }

    private function overviewStats($profiles, string $today, string $startOfMonth): array
    {
        $todayAttendances = Attendance::where('date', $today)->get();

        return [
            'total_employees' => User::whereHas('roles', fn($q) => $q->where('name', 'employee'))->count(),
            'new_joinees' => $profiles->where('join_date', '>=', $startOfMonth)->count(),
            'today_present' => $todayAttendances->where('status', 'present')->count(),
            'today_late' => $todayAttendances->where('status', 'late')->count(),
            'today_absent' => $todayAttendances->where('status', 'absent')->count(),
            'pending_leaves' => Leave::where('status', 'pending')->count(),
        ];
    }

    private function leaveDistribution(): array
    {
        return LeaveType::withCount(['leaves' => fn($q) => $q->where('status', 'approved')])
            ->get()
            ->map(fn($lt) => ['name' => $lt->name, 'value' => $lt->leaves_count])
            ->filter(fn($lt) => $lt['value'] > 0)
            ->values()
            ->toArray();
    }

    private function attendanceTrend(): array
    {
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->toDateString();
            $dayStats = Attendance::where('date', $dateStr)->get();

            $trend[] = [
                'day' => $date->format('D'),
                'present' => $dayStats->where('status', 'present')->count(),
                'late' => $dayStats->where('status', 'late')->count(),
                'absent' => $dayStats->where('status', 'absent')->count(),
            ];
        }
        return $trend;
    }

    private function departmentDistribution(): array
    {
        return Department::withCount('employeeProfiles')
            ->get()
            ->map(fn($dept) => ['name' => $dept->name, 'value' => $dept->employee_profiles_count])
            ->sortByDesc('value')
            ->values()
            ->toArray();
    }

    private function lateArrivalsToday(string $today): array
    {
        return Attendance::with(['user.profile.designation'])
            ->where('date', $today)
            ->where('status', 'late')
            ->get()
            ->map(fn($att) => [
                'id' => $att->id,
                'name' => $att->user->name,
                'avatar' => $att->user->avatar,
                'designation' => $att->user->profile->designation->name ?? 'Employee',
                'time' => $att->check_in,
                'minutes_late' => Carbon::parse($att->check_in)->diffInMinutes(Carbon::parse('12:15')),
            ])
            ->toArray();
    }

    private function pendingApprovals(): array
    {
        return Leave::with(['user.profile', 'leaveType'])
            ->where('status', 'pending')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn($leave) => [
                'id' => $leave->id,
                'name' => $leave->user->name,
                'avatar' => $leave->user->avatar,
                'start_date' => $leave->start_date,
                'end_date' => $leave->end_date,
                'reason' => $leave->reason,
                'type' => $leave->leaveType->name ?? 'Leave',
                'days' => Carbon::parse($leave->start_date)->diffInDays(Carbon::parse($leave->end_date)) + 1,
            ])
            ->toArray();
    }
}
