<?php

namespace App\Services;

use App\Models\Leave;
use App\Models\LeaveType;
use Illuminate\Http\Request;

class LeaveService extends BaseService
{
    public function all(): mixed
    {
        return Leave::with(['user:id,name,email', 'leaveType'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function myLeaves(Request $request): mixed
    {
        return $request->user()->leaves()
            ->with('leaveType')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request, array $data): Leave
    {
        $defaultLeaveType = LeaveType::first();
        if ($defaultLeaveType) {
            $data['leave_type_id'] = $defaultLeaveType->id;
        }

        return $request->user()->leaves()->create($data);
    }

    public function updateStatus(Leave $leave, string $status): Leave
    {
        $leave->update(['status' => $status]);
        return $leave;
    }
}
