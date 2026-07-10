<?php

namespace App\Services;

use App\Actions\DeductLeaveOnExcessiveLates;
use App\Actions\DetermineAttendanceStatus;
use App\Imports\AttendanceImport;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceService extends BaseService
{
    public function __construct(
        private readonly DeductLeaveOnExcessiveLates $deductLeaveAction,
        private readonly DetermineAttendanceStatus $determineStatusAction,
    ) {}

    public function import(Request $request): void
    {
        Excel::import(new AttendanceImport, $request->file('file'));
    }

    public function index(Request $request): mixed
    {
        $query = Attendance::with('user:id,name,email');

        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function myAttendances(Request $request): mixed
    {
        $query = $request->user()->attendances();

        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function markManual(array $data): Attendance
    {
        $status = $this->determineStatusAction->execute(
            $data['check_in'] ?? null,
            $data['status']
        );

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $data['user_id'], 'date' => $data['date']],
            [
                'status' => $status,
                'check_in' => $data['check_in'] ?? null,
                'check_out' => $data['check_out'] ?? null,
            ]
        );

        $this->deductLeaveAction->execute($data['user_id'], $data['date'], $status);

        return $attendance;
    }

    public function checkIn(Request $request): Attendance
    {
        $user = $request->user();
        $date = Carbon::today()->toDateString();
        $currentTime = Carbon::now()->format('H:i');

        $existing = Attendance::where('user_id', $user->id)
                              ->where('date', $date)
                              ->first();

        if ($existing && $existing->check_in) {
            throw new \RuntimeException('Already checked in for today');
        }

        $status = $this->determineStatusAction->execute(null, 'present');

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $user->id, 'date' => $date],
            ['check_in' => $currentTime, 'status' => $status]
        );

        $this->deductLeaveAction->execute($user->id, $date, $status);

        return $attendance;
    }

    public function checkOut(Request $request): Attendance
    {
        $user = $request->user();
        $date = Carbon::today()->toDateString();
        $currentTime = Carbon::now()->format('H:i');

        $attendance = Attendance::where('user_id', $user->id)
                                ->where('date', $date)
                                ->first();

        if (!$attendance || !$attendance->check_in) {
            throw new \RuntimeException('Please check in first');
        }

        $attendance->update(['check_out' => $currentTime]);

        return $attendance;
    }
}
