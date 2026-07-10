<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplyLeaveRequest;
use App\Http\Requests\UpdateLeaveStatusRequest;
use App\Http\Resources\LeaveResource;
use App\Models\Leave;
use App\Services\LeaveService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly LeaveService $leaveService
    ) {}

    public function index(): JsonResponse
    {
        return $this->respondSuccess(
            LeaveResource::collection($this->leaveService->all())
        );
    }

    public function myLeaves(Request $request): JsonResponse
    {
        return $this->respondSuccess(
            LeaveResource::collection($this->leaveService->myLeaves($request))
        );
    }

    public function store(ApplyLeaveRequest $request): JsonResponse
    {
        $leave = $this->leaveService->store($request, $request->validated());
        return $this->respondCreated(
            new LeaveResource($leave),
            'Leave applied successfully'
        );
    }

    public function updateStatus(UpdateLeaveStatusRequest $request, Leave $leave): JsonResponse
    {
        $leave = $this->leaveService->updateStatus($leave, $request->validated()['status']);
        return $this->respondUpdated(
            new LeaveResource($leave),
            'Leave status updated'
        );
    }
}
