<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Leave;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function analytics()
    {
        $today = Carbon::today()->toDateString();
        $startOfWeek = Carbon::now()->startOfWeek()->toDateString();
        $endOfWeek = Carbon::now()->endOfWeek()->toDateString();
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();

        // Base employee query
        $employeesQuery = User::whereHas('roles', function($q) {
            $q->where('name', 'employee');
        });

        // 1. Employee Status
        $totalEmployees = $employeesQuery->count();
        $profiles = \App\Models\EmployeeProfile::whereHas('user', function($q) {
            $q->whereHas('roles', function($r) {
                $r->where('name', 'employee');
            });
        })->get();

        $permanentCount = $profiles->where('employment_status', 'permanent')->count();
        $probationCount = $profiles->where('employment_status', 'probation')->count();
        $contractCount = $profiles->where('employment_status', 'contract')->count(); // Assuming we might have it

        // 2. Overview Stats
        $newJoinees = $profiles->where('join_date', '>=', $startOfMonth)->count();
        
        $todayAttendances = Attendance::where('date', $today)->get();
        $todayPresent = $todayAttendances->where('status', 'present')->count();
        $todayLate = $todayAttendances->where('status', 'late')->count();
        $todayAbsent = $todayAttendances->where('status', 'absent')->count();
        
        $pendingLeavesCount = Leave::where('status', 'pending')->count();

        // 3. Leave Type Distribution (Approved leaves this month/year for donut chart)
        $leavesDistribution = \App\Models\LeaveType::withCount(['leaves' => function($q) {
            $q->where('status', 'approved');
        }])->get()->map(function($lt) {
            return ['name' => $lt->name, 'value' => $lt->leaves_count];
        })->filter(fn($lt) => $lt['value'] > 0)->values();

        // 4. Attendance Trend (Last 7 days)
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

        // 5. Top Departments Distribution
        $departmentDistribution = \App\Models\Department::withCount('employeeProfiles')->get()
            ->map(function($dept) {
                return ['name' => $dept->name, 'value' => $dept->employee_profiles_count];
            })
            ->sortByDesc('value')
            ->values();

        // 6. Late Arrivals Today
        $lateArrivalsToday = Attendance::with(['user.profile.designation'])
            ->where('date', $today)
            ->where('status', 'late')
            ->get()
            ->map(function($att) {
                return [
                    'id' => $att->id,
                    'name' => $att->user->name,
                    'avatar' => $att->user->avatar,
                    'designation' => $att->user->profile->designation->name ?? 'Employee',
                    'time' => $att->check_in,
                    'minutes_late' => Carbon::parse($att->check_in)->diffInMinutes(Carbon::parse('12:15')) // Threshold was 12:15
                ];
            });

        // 7. Pending Approvals (Leaves)
        $pendingApprovals = Leave::with(['user.profile', 'leaveType'])
            ->where('status', 'pending')
            ->latest()
            ->take(4)
            ->get()
            ->map(function($leave) {
                return [
                    'id' => $leave->id,
                    'name' => $leave->user->name,
                    'avatar' => $leave->user->avatar,
                    'start_date' => $leave->start_date,
                    'end_date' => $leave->end_date,
                    'reason' => $leave->reason,
                    'type' => $leave->leaveType->name ?? 'Leave',
                    'days' => Carbon::parse($leave->start_date)->diffInDays(Carbon::parse($leave->end_date)) + 1
                ];
            });

        return response()->json([
            'employee_status' => [
                'full_time' => $permanentCount,
                'contract' => $contractCount,
                'probation' => $probationCount,
            ],
            'overview' => [
                'total_employees' => $totalEmployees,
                'new_joinees' => $newJoinees,
                'today_late' => $todayLate,
                'today_present' => $todayPresent,
                'today_absent' => $todayAbsent,
                'pending_leaves' => $pendingLeavesCount,
            ],
            'leave_distribution' => $leavesDistribution,
            'attendance_trend' => $trend,
            'department_distribution' => $departmentDistribution,
            'late_arrivals' => $lateArrivalsToday,
            'pending_approvals' => $pendingApprovals
        ]);
    }
}
