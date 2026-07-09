<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveType;

class LeaveTypeController extends Controller
{
    public function index()
    {
        return response()->json(LeaveType::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:leave_types,name',
            'days_allowed' => 'required|integer|min:0'
        ]);

        $leaveType = LeaveType::create($validated);
        return response()->json(['message' => 'Leave Type created', 'leave_type' => $leaveType]);
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:leave_types,name,' . $leaveType->id,
            'days_allowed' => 'required|integer|min:0'
        ]);

        $leaveType->update($validated);
        return response()->json(['message' => 'Leave Type updated', 'leave_type' => $leaveType]);
    }

    public function destroy(LeaveType $leaveType)
    {
        $leaveType->delete();
        return response()->json(['message' => 'Leave Type deleted']);
    }
}
