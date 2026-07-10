<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateAvatarRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\EmployeeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly EmployeeService $employeeService
    ) {}

    public function index(): JsonResponse
    {
        return $this->respondSuccess(
            UserResource::collection($this->employeeService->index())
        );
    }

    public function show(User $employee): JsonResponse
    {
        return $this->respondSuccess(
            $this->employeeService->show($employee)
        );
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $user = $this->employeeService->store($request->validated());
        return $this->respondCreated(
            new UserResource($user),
            'Employee created successfully'
        );
    }

    public function update(UpdateEmployeeRequest $request, User $employee): JsonResponse
    {
        $user = $this->employeeService->update($request->validated(), $employee);
        return $this->respondUpdated(
            new UserResource($user),
            'Employee profile updated'
        );
    }

    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        $result = $this->employeeService->updateAvatar($request);
        return $this->respondSuccess($result, 'Avatar updated successfully');
    }

    public function updateSelf(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->employeeService->updateSelf($request);
        return $this->respondUpdated(
            new UserResource($user),
            'Profile updated successfully'
        );
    }
}
