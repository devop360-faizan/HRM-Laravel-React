<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaveTypeRequest;
use App\Http\Resources\LeaveTypeResource;
use App\Models\LeaveType;
use App\Services\LeaveTypeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class LeaveTypeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly LeaveTypeService $leaveTypeService
    ) {}

    public function index(): JsonResponse
    {
        return $this->respondSuccess(
            LeaveTypeResource::collection($this->leaveTypeService->all())
        );
    }

    public function store(StoreLeaveTypeRequest $request): JsonResponse
    {
        $leaveType = $this->leaveTypeService->create($request->validated());
        return $this->respondCreated(
            new LeaveTypeResource($leaveType),
            'Leave Type created'
        );
    }

    public function update(StoreLeaveTypeRequest $request, LeaveType $leaveType): JsonResponse
    {
        $leaveType = $this->leaveTypeService->update($request->validated(), $leaveType);
        return $this->respondUpdated(
            new LeaveTypeResource($leaveType),
            'Leave Type updated'
        );
    }

    public function destroy(LeaveType $leaveType): JsonResponse
    {
        $this->leaveTypeService->delete($leaveType);
        return $this->respondDeleted('Leave Type deleted');
    }
}
