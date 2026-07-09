<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;

class LeaveController extends Controller
{
    public function index()
    {
        $leaves = Leave::with(['user:id,name,email', 'leaveType'])->orderBy('created_at', 'desc')->get();
        return response()->json($leaves);
    }

    public function myLeaves(Request $request)
    {
        $leaves = $request->user()->leaves()->with('leaveType')->orderBy('created_at', 'desc')->get();
        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string'
        ]);

        $defaultLeaveType = \App\Models\LeaveType::first();
        if ($defaultLeaveType) {
            $validated['leave_type_id'] = $defaultLeaveType->id;
        }

        $leave = $request->user()->leaves()->create($validated);

        return response()->json(['message' => 'Leave applied successfully', 'leave' => $leave]);
    }

    public function updateStatus(Request $request, Leave $leave)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $leave->update(['status' => $request->status]);

        return response()->json(['message' => 'Leave status updated', 'leave' => $leave]);
    }
}
