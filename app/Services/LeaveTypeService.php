<?php

namespace App\Services;

use App\Models\LeaveType;

class LeaveTypeService extends BaseService
{
    public function all(): mixed
    {
        return LeaveType::all();
    }

    public function create(array $data): LeaveType
    {
        return LeaveType::create($data);
    }

    public function update(array $data, LeaveType $leaveType): LeaveType
    {
        $leaveType->update($data);
        return $leaveType;
    }

    public function delete(LeaveType $leaveType): void
    {
        $leaveType->delete();
    }
}
