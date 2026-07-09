<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\User;
use App\Imports\AttendanceImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new AttendanceImport, $request->file('file'));

        return response()->json(['message' => 'Attendance imported successfully']);
    }

    public function index(Request $request)
    {
        $query = Attendance::with('user:id,name,email');

        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }
        
        if ($request->has('user_id') && $request->user_id != '') {
            $query->where('user_id', $request->user_id);
        }

        $attendances = $query->orderBy('date', 'desc')->get();
        return response()->json($attendances);
    }

    public function myAttendances(Request $request)
    {
        $query = $request->user()->attendances();

        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        }

        $attendances = $query->orderBy('date', 'desc')->get();
        return response()->json($attendances);
    }

    public function markManualAttendance(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,half_day',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i'
        ]);

        $status = $validated['status'];

        // 12:15 Grace Time Logic
        if (!empty($validated['check_in'])) {
            $checkInTime = Carbon::createFromFormat('H:i', $validated['check_in']);
            $threshold = Carbon::createFromFormat('H:i', '12:15');
            
            if ($checkInTime->greaterThan($threshold) && $status === 'present') {
                $status = 'late';
            }
        }

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $validated['user_id'], 'date' => $validated['date']],
            [
                'status' => $status,
                'check_in' => $validated['check_in'] ?? null,
                'check_out' => $validated['check_out'] ?? null,
            ]
        );

        // Deduct leave if 3 lates in the month
        if ($status === 'late') {
            $month = Carbon::parse($validated['date'])->month;
            $year = Carbon::parse($validated['date'])->year;
            
            $lateCount = Attendance::where('user_id', $validated['user_id'])
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'late')
                ->count();
                
            if ($lateCount > 0 && $lateCount % 3 === 0) {
                // Deduct 1 leave balance
                $leaveBalance = \App\Models\LeaveBalance::firstOrCreate(
                    ['user_id' => $validated['user_id']],
                    ['balance' => 0]
                );
                $leaveBalance->decrement('balance', 1);
            }
        }

        return response()->json(['message' => 'Attendance marked manually', 'attendance' => $attendance]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        $date = Carbon::today()->toDateString();
        $currentTime = Carbon::now()->format('H:i');
        
        $attendance = Attendance::where('user_id', $user->id)
                                ->where('date', $date)
                                ->first();

        if ($attendance && $attendance->check_in) {
            return response()->json(['message' => 'Already checked in for today', 'attendance' => $attendance], 400);
        }

        $threshold = Carbon::createFromFormat('H:i', '12:15');
        $checkInTime = Carbon::now();
        
        $status = 'present';
        if ($checkInTime->greaterThan($threshold)) {
            $status = 'late';
        }

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $user->id, 'date' => $date],
            [
                'check_in' => $currentTime,
                'status' => $status
            ]
        );

        // Deduct leave if 3 lates in the month
        if ($status === 'late') {
            $month = Carbon::parse($date)->month;
            $year = Carbon::parse($date)->year;
            
            $lateCount = Attendance::where('user_id', $user->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'late')
                ->count();
                
            if ($lateCount > 0 && $lateCount % 3 === 0) {
                $leaveBalance = \App\Models\LeaveBalance::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0]
                );
                $leaveBalance->decrement('balance', 1);
            }
        }

        return response()->json(['message' => 'Checked in successfully', 'attendance' => $attendance]);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();
        $date = Carbon::today()->toDateString();
        $currentTime = Carbon::now()->format('H:i');
        
        $attendance = Attendance::where('user_id', $user->id)
                                ->where('date', $date)
                                ->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json(['message' => 'Please check in first'], 400);
        }

        $attendance->update([
            'check_out' => $currentTime
        ]);

        return response()->json(['message' => 'Checked out successfully', 'attendance' => $attendance]);
    }
}
